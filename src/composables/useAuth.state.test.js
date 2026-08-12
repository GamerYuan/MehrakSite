import { beforeEach, describe, expect, it, vi } from "vitest";

const { standaloneApiFetch, standaloneApiFetchJson } = vi.hoisted(() => ({
  standaloneApiFetch: vi.fn(),
  standaloneApiFetchJson: vi.fn(),
}));

vi.mock("./useApi", () => ({ standaloneApiFetch, standaloneApiFetchJson }));

import { clearAuthState, fetchUser, getAuthStatus, getUser, useAuth } from "./useAuth";

describe("shared auth state", () => {
  beforeEach(() => {
    clearAuthState();
    standaloneApiFetch.mockReset();
    standaloneApiFetchJson.mockReset();
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
});
