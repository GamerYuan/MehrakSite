import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { buildError, standaloneApiFetch, standaloneApiFetchJson } = vi.hoisted(() => ({
  buildError: vi.fn((message, status) => Object.assign(new Error(message), { status })),
  standaloneApiFetch: vi.fn(),
  standaloneApiFetchJson: vi.fn(),
}));

vi.mock("./useApi", () => ({ buildError, standaloneApiFetch, standaloneApiFetchJson }));

import {
  clearAuthState,
  fetchUser,
  getAuthStatus,
  getUser,
  logout,
  setAuthState,
  useAuth,
} from "./useAuth";

describe("shared auth state", () => {
  beforeEach(() => {
    clearAuthState();
    standaloneApiFetch.mockReset();
    standaloneApiFetchJson.mockReset();
    globalThis.sessionStorage.clear();
    vi.stubGlobal("location", { href: "/dashboard" });
  });

  afterEach(async () => {
    if (useAuth().logoutStatus.value !== "idle") {
      standaloneApiFetch.mockReset();
      standaloneApiFetch.mockResolvedValue({ ok: true, status: 200 });
      await logout();
    }
    globalThis.sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("shares one in-flight /users/me request", async () => {
    let resolveRequest = null;
    standaloneApiFetchJson.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    const first = fetchUser();
    const second = fetchUser();

    expect(standaloneApiFetchJson).toHaveBeenCalledTimes(1);
    resolveRequest({
      ok: true,
      status: 200,
      data: { DiscordId: "123", Username: "shared-user" },
    });

    const [firstUser, secondUser] = await Promise.all([first, second]);
    expect(firstUser).toEqual(secondUser);
    expect(getUser()).toEqual(firstUser);
  });

  it("uses the resolved user as the cache for later callers", async () => {
    standaloneApiFetchJson.mockResolvedValue({
      ok: true,
      status: 200,
      data: { discordId: "123", username: "cached-user" },
    });

    await fetchUser();
    await fetchUser();

    expect(standaloneApiFetchJson).toHaveBeenCalledTimes(1);
    expect(getUser().username).toBe("cached-user");
  });

  it("retries a transient response and recovers", async () => {
    standaloneApiFetchJson
      .mockResolvedValueOnce({ ok: false, status: 503, data: { error: "Unavailable" } })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { discordId: "123", username: "recovered-user" },
      });

    expect(await fetchUser()).toBeNull();
    expect(getAuthStatus()).toBe(503);
    expect(useAuth().error.value).toBe("Unavailable");

    const recoveredUser = await fetchUser();
    expect(recoveredUser.username).toBe("recovered-user");
    expect(standaloneApiFetchJson).toHaveBeenCalledTimes(2);
    expect(getAuthStatus()).toBe(200);
  });

  it("caches a terminal unauthorized response", async () => {
    standaloneApiFetchJson.mockResolvedValue({
      ok: false,
      status: 401,
      data: { error: "Unauthorized" },
    });

    await fetchUser();
    await fetchUser();

    expect(standaloneApiFetchJson).toHaveBeenCalledTimes(1);
    expect(getAuthStatus()).toBe(401);
  });

  it("confirms a successful logout and clears the session marker", async () => {
    setAuthState({ discordId: "123", username: "signed-in" });
    standaloneApiFetch.mockResolvedValue({ ok: true, status: 200 });

    const result = await logout();

    expect(result).toMatchObject({ confirmed: true, alreadyExpired: false, status: 200 });
    expect(getUser()).toBeNull();
    expect(useAuth().logoutStatus.value).toBe("idle");
    expect(globalThis.sessionStorage.getItem("mehrak.logout.unconfirmed")).toBeNull();
    expect(globalThis.location.href).toBe("/");
    expect(standaloneApiFetch).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      skipAuthRedirect: true,
    });
  });

  it("treats an already-expired 401 session as a confirmed logout", async () => {
    setAuthState({ discordId: "123", username: "expired-session" });
    standaloneApiFetch.mockResolvedValue({ ok: false, status: 401 });

    const result = await logout();

    expect(result).toMatchObject({ confirmed: true, alreadyExpired: true, status: 401 });
    expect(useAuth().logoutStatus.value).toBe("idle");
    expect(globalThis.sessionStorage.getItem("mehrak.logout.unconfirmed")).toBeNull();
  });

  it("keeps an HTTP logout failure retryable and visible after auth refresh", async () => {
    setAuthState({ discordId: "123", username: "still-server-session" });
    standaloneApiFetch.mockResolvedValue({ ok: false, status: 503 });

    const result = await logout();

    expect(result).toMatchObject({ confirmed: false, status: 503 });
    expect(getUser()).toBeNull();
    expect(useAuth().logoutStatus.value).toBe("failed");
    expect(useAuth().logoutError.value).toContain("could not be confirmed");
    expect(globalThis.sessionStorage.getItem("mehrak.logout.unconfirmed")).toBe("1");

    standaloneApiFetchJson.mockResolvedValue({
      ok: true,
      status: 200,
      data: { discordId: "123", username: "server-session-returned" },
    });
    await fetchUser();

    expect(getUser().username).toBe("server-session-returned");
    expect(useAuth().logoutStatus.value).toBe("failed");
    expect(globalThis.sessionStorage.getItem("mehrak.logout.unconfirmed")).toBe("1");
  });

  it("keeps a network logout failure retryable without rejecting the caller", async () => {
    standaloneApiFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await logout();

    expect(result.confirmed).toBe(false);
    expect(result.status).toBeNull();
    expect(useAuth().logoutStatus.value).toBe("failed");
    expect(globalThis.sessionStorage.getItem("mehrak.logout.unconfirmed")).toBe("1");
  });

  it("keeps the failure notice in place when storage cannot persist the retry marker", async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get() {
        throw new Error("Storage access denied");
      },
    });
    standaloneApiFetch.mockResolvedValue({ ok: false, status: 503 });

    try {
      const result = await logout();

      expect(result.confirmed).toBe(false);
      expect(useAuth().logoutStatus.value).toBe("failed");
      expect(globalThis.location.href).toBe("/dashboard");
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "sessionStorage", originalDescriptor);
      } else {
        delete globalThis.sessionStorage;
      }
    }
  });

  it("does not let an in-flight auth refresh resurrect a logged-out user", async () => {
    let resolveUserRequest = null;
    standaloneApiFetchJson.mockReturnValue(
      new Promise((resolve) => {
        resolveUserRequest = resolve;
      }),
    );
    let resolveLogoutRequest = null;
    standaloneApiFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveLogoutRequest = resolve;
      }),
    );

    const userRequest = fetchUser();
    const logoutRequest = logout();
    const refreshDuringLogout = fetchUser();

    expect(standaloneApiFetchJson).toHaveBeenCalledTimes(1);
    expect(await refreshDuringLogout).toBeNull();

    resolveUserRequest({
      ok: true,
      status: 200,
      data: { discordId: "123", username: "late-auth-response" },
    });
    await userRequest;
    expect(getUser()).toBeNull();

    resolveLogoutRequest({ ok: true, status: 200 });
    await logoutRequest;
    expect(getUser()).toBeNull();
    expect(useAuth().logoutStatus.value).toBe("idle");
  });
});
