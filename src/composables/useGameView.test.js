import { describe, expect, it } from "vitest";
import { getGameTabLocation, getGameWorkspaceTabs, resolveGameTab } from "./useGameView";

const config = {
  id: "Genshin",
  routeKey: "genshin",
  tabs: [{ id: "character" }, { id: "abyss" }],
  capabilities: {
    management: { characters: true, userPortraits: true, aliases: true },
  },
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
