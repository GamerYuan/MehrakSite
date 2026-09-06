import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  buildError: vi.fn((message, status) => Object.assign(new Error(message), { status })),
  handleApiError: vi.fn(() => false),
}));

vi.mock("../useApi", () => ({
  useApi: () => api,
}));

import { useCommandExecution } from "./useCommandExecution";

const config = {
  id: "Genshin",
  endpoint: "/genshin/commands",
  servers: [{ value: "America" }],
  tabs: [
    { id: "build", hasCharacterInput: true },
    { id: "abyss", hasFloorInput: true, floorMin: 9 },
  ],
};

const response = (data, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: vi.fn(async () => data),
});

describe("useCommandExecution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves the command endpoint and payload contract", async () => {
    api.apiFetch.mockResolvedValue(response({ storageFileName: "result.webp" }));
    const activeTab = ref("build");
    const execution = useCommandExecution(config, activeTab);
    execution.profileId.value = 12;
    execution.server.value = "America";
    execution.characterName.value = "Nahida";

    await execution.executeCommand();

    expect(api.apiFetch).toHaveBeenCalledTimes(1);
    expect(api.apiFetch).toHaveBeenCalledWith("/genshin/commands/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: 12, server: "America", character: "Nahida" }),
    });
  });

  it("blocks a duplicate submission while the first request is loading", async () => {
    let resolveRequest = null;
    api.apiFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const activeTab = ref("abyss");
    const execution = useCommandExecution(config, activeTab);

    const first = execution.executeCommand();
    const second = execution.executeCommand();

    expect(api.apiFetch).toHaveBeenCalledTimes(1);
    resolveRequest(response({ storageFileName: "abyss.webp" }));
    await Promise.all([first, second]);
    expect(execution.loading.value.abyss).toBe(false);
  });

  it("retains the authentication retry sequence", async () => {
    api.apiFetch
      .mockResolvedValueOnce(response({ code: "AUTH_REQUIRED" }, { ok: false, status: 403 }))
      .mockResolvedValueOnce(response({ ok: true }))
      .mockResolvedValueOnce(response({ storageFileName: "result.webp" }));
    const activeTab = ref("build");
    const execution = useCommandExecution(config, activeTab);
    execution.profileId.value = 7;

    await execution.executeCommand();
    expect(execution.showAuthModal.value).toBe(true);
    execution.authPassphrase.value = "passphrase";
    await execution.handleAuth();
    await Promise.resolve();

    expect(api.apiFetch.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      "/genshin/commands/build",
      "/profile-auth",
      "/genshin/commands/build",
    ]);
    expect(api.apiFetch.mock.calls[1][1].body).toBe(
      JSON.stringify({ profileId: 7, passphrase: "passphrase" }),
    );
  });

  it("clears credentials on dismissal and ignores a late authentication response", async () => {
    let resolveAuth = null;
    api.apiFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveAuth = resolve;
      }),
    );
    const activeTab = ref("build");
    const execution = useCommandExecution(config, activeTab);
    execution.showAuthModal.value = true;
    execution.authProfileId.value = 7;
    execution.authPassphrase.value = "secret";

    const request = execution.handleAuth();
    expect(execution.authLoading.value).toBe(true);

    execution.closeAuthModal();
    expect(execution.authPassphrase.value).toBe("");
    expect(execution.authError.value).toBe("");
    expect(execution.authLoading.value).toBe(false);

    resolveAuth(response({ ok: true }));
    await request;

    expect(api.apiFetch).toHaveBeenCalledTimes(1);
    expect(execution.showAuthModal.value).toBe(false);
  });

  it("resets loading when a newer authentication-required response reopens the dialog", async () => {
    api.apiFetch.mockResolvedValueOnce(
      response({ code: "AUTH_REQUIRED" }, { ok: false, status: 403 }),
    );
    const activeTab = ref("build");
    const execution = useCommandExecution(config, activeTab);

    await execution.executeCommand();
    execution.authLoading.value = true;
    execution.openAuthModal(9);

    expect(execution.showAuthModal.value).toBe(true);
    expect(execution.authProfileId.value).toBe(9);
    expect(execution.authLoading.value).toBe(false);
  });
});
