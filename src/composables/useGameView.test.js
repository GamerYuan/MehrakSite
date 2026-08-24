import { describe, expect, it, vi } from "vitest";
import { createApp, nextTick } from "vue";
import {
  getGameTabLocation,
  getGameWorkspaceTabs,
  resolveGameTab,
  resolveProfileSelection,
  useGameView,
} from "./useGameView";
import { useProfileManagement } from "./useProfileManagement";
import { __takeOnSuccess } from "./game/useCommandExecution";

vi.mock("vue-router", () => ({
  useRoute: () => ({ name: "game", params: { game: "genshin" }, meta: {}, query: {} }),
}));

vi.mock("./useAuth", async () => {
  const { ref } = await import("vue");
  const user = ref(null);
  return { useAuth: () => ({ user }) };
});

vi.mock("./useProfileManagement", async () => {
  const { ref } = await import("vue");
  const profiles = ref([]);
  const loading = ref(false);
  const fetchProfiles = vi.fn(async () => {});
  return { useProfileManagement: () => ({ profiles, loading, fetchProfiles }) };
});

vi.mock("./game/useCommandExecution", async () => {
  const { ref } = await import("vue");
  const profileId = ref(null);
  const server = ref("");
  let onSuccess = null;
  return {
    useCommandExecution: (_config, _tab, callback) => {
      onSuccess = callback;
      return { profileId, server };
    },
    __takeOnSuccess: () => onSuccess,
  };
});

vi.mock("./game/useCharacterManagement", () => ({
  useCharacterManagement: () => ({ fetchCharacters: vi.fn(), fetchCharacterStats: vi.fn() }),
}));
vi.mock("./game/useAliasManagement", () => ({ useAliasManagement: () => ({}) }));
vi.mock("./game/usePortraitConfig", () => ({ usePortraitConfig: () => ({}) }));
vi.mock("./game/useUserPortraits", () => ({ useUserPortraits: () => ({}) }));
vi.mock("./game/useCodesManagement", () => ({ useCodesManagement: () => ({}) }));
vi.mock("./game/useWeaponIcons", () => ({ useWeaponIcons: () => ({}) }));

const flush = async () => {
  await nextTick();
  await nextTick();
  await nextTick();
};

const mountView = (viewConfig) => {
  let view = null;
  const app = createApp({
    setup() {
      view = useGameView(viewConfig);
      return () => null;
    },
  });
  app.mount(document.createElement("div"));
  return view;
};

const config = {
  id: "Genshin",
  routeKey: "genshin",
  tabs: [{ id: "character" }, { id: "abyss" }],
  capabilities: {
    management: { characters: true, userPortraits: true, aliases: true },
  },
  servers: [{ value: "America" }, { value: "Europe" }],
};

describe("game workspace tab routing", () => {
  it("resolves command queries and safely falls back", () => {
    expect(resolveGameTab(config, { meta: {}, query: { tab: "abyss" } })).toBe("abyss");
    expect(resolveGameTab(config, { meta: {}, query: { tab: ["abyss", "character"] } })).toBe(
      "abyss",
    );
    expect(resolveGameTab(config, { meta: {}, query: { tab: "unknown" } })).toBe("character");
  });

  it("takes management state from route metadata", () => {
    expect(
      resolveGameTab(config, {
        meta: { gameManagementTab: "codes" },
        query: { tab: "abyss" },
      }),
    ).toBe("codes");
  });

  it("takes personal portrait state from route metadata", () => {
    expect(
      resolveGameTab(config, {
        meta: { gameWorkspaceTab: "portraits" },
        query: { tab: "abyss" },
      }),
    ).toBe("portraits");
  });

  it("maps management tabs to stable routes and commands to the game route", () => {
    expect(getGameTabLocation(config, "aliases")).toEqual({
      name: "game-alias-management",
      params: { game: "genshin" },
    });
    expect(getGameTabLocation(config, "portraits")).toEqual({
      name: "game-user-portraits",
      params: { game: "genshin" },
    });
    expect(getGameTabLocation(config, "abyss")).toEqual({
      name: "game",
      params: { game: "genshin" },
      query: { tab: "abyss" },
    });
  });

  it("shows personal portraits to ordinary users and keeps write tabs permission-gated", () => {
    const ordinaryTabs = getGameWorkspaceTabs(config, { gameWritePermissions: [] });
    const managerTabs = getGameWorkspaceTabs(config, { gameWritePermissions: ["Genshin"] });

    expect(ordinaryTabs.filter((tab) => tab.kind === "personal").map((tab) => tab.id)).toEqual([
      "portraits",
    ]);
    expect(ordinaryTabs.some((tab) => tab.kind === "management")).toBe(false);
    expect(managerTabs.filter((tab) => tab.kind === "management").map((tab) => tab.id)).toEqual([
      "manage",
      "aliases",
    ]);
    expect(managerTabs.some((tab) => tab.id === "portraits")).toBe(true);
  });
});

describe("profile selection", () => {
  const profiles = [
    { profileId: 12, lastUsedRegions: { Genshin: "Europe" } },
    { profileId: 24, lastUsedRegions: { Genshin: "Unsupported" } },
  ];

  it("keeps numeric profile IDs outside the old stepper range and restores valid regions", () => {
    expect(resolveProfileSelection(config, profiles, "12")).toEqual({
      profileId: 12,
      region: "Europe",
    });
    expect(resolveProfileSelection(config, profiles, 24)).toEqual({
      profileId: 24,
      region: null,
    });
  });

  it("falls back to the first available profile", () => {
    expect(resolveProfileSelection(config, profiles, 999).profileId).toBe(12);
    expect(resolveProfileSelection(config, [], 1)).toEqual({ profileId: null, region: null });
  });
});

describe("useGameView composable", () => {
  it("keeps a manually chosen server when a post-command refetch returns stale regions", async () => {
    const viewConfig = {
      id: "Genshin",
      routeKey: "genshin",
      tabs: [{ id: "character" }],
      capabilities: { management: {} },
      servers: [{ value: "America" }, { value: "Europe" }],
    };
    const staleProfile = {
      profileId: 1,
      gameUids: { Genshin: { America: "8001" } },
      lastUsedRegions: { Genshin: "America" },
    };

    const view = mountView(viewConfig);
    const { profiles, fetchProfiles } = useProfileManagement();

    // Initial load syncs the stored region.
    profiles.value = [{ ...staleProfile }];
    await flush();
    expect(view.server.value).toBe("America");

    // User manually switches to Europe; the choice is written onto the local profile only.
    view.server.value = "Europe";
    await flush();
    expect(profiles.value[0].lastUsedRegions.Genshin).toBe("Europe");

    // Command succeeds -> onSuccess refetches profiles holding stale server-side state.
    fetchProfiles.mockImplementationOnce(async () => {
      profiles.value = [{ ...staleProfile }];
    });
    await __takeOnSuccess()();
    await flush();

    expect(fetchProfiles).toHaveBeenCalled();
    expect(view.server.value).toBe("Europe");
  });
});
