import { normalizeUser } from "./useAuth";

describe("normalizeUser", () => {
  it("maps camelCase fields directly", () => {
    const input = {
      discordId: "123",
      discordUserId: "456",
      isSuperAdmin: true,
      isRootUser: false,
      isActive: false,
      gameWritePermissions: ["Genshin"],
      username: "tester",
      avatarUrl: "https://example.com/a.png",
    };
    const result = normalizeUser(input);
    expect(result.discordUserId).toBe("456");
    expect(result.isSuperAdmin).toBe(true);
    expect(result.isRootUser).toBe(false);
    expect(result.isActive).toBe(false);
    expect(result.gameWritePermissions).toEqual(["Genshin"]);
    expect(result.username).toBe("tester");
    expect(result.avatarUrl).toBe("https://example.com/a.png");
  });

  it("falls back to PascalCase fields", () => {
    const input = {
      DiscordId: "123",
      DiscordUserId: "789",
      IsSuperAdmin: true,
      IsRootUser: true,
      IsActive: false,
      GameWritePermissions: ["HonkaiStarRail"],
      Username: "pascal",
    };
    const result = normalizeUser(input);
    expect(result.discordUserId).toBe("789");
    expect(result.isSuperAdmin).toBe(true);
    expect(result.isRootUser).toBe(true);
    expect(result.isActive).toBe(false);
    expect(result.gameWritePermissions).toEqual(["HonkaiStarRail"]);
    expect(result.username).toBe("pascal");
  });

  it("generates fallback avatar from discordId when no avatar provided", () => {
    const result = normalizeUser({ discordId: "123", discordUserId: "123" });
    expect(result.avatarUrl).toContain("cdn.discordapp.com/embed/avatars/");
    expect(result.avatarUrl).toMatch(/\.png$/);
  });

  it("defaults booleans to false when neither case is present", () => {
    const result = normalizeUser({ discordId: "1" });
    expect(result.isSuperAdmin).toBe(false);
    expect(result.isRootUser).toBe(false);
    expect(result.isActive).toBe(null);
    expect(result.gameWritePermissions).toEqual([]);
    expect(result.username).toBe("");
  });

  it("does not forward unknown fields from the API response", () => {
    const result = normalizeUser({
      discordId: "123",
      discordUserId: "123",
      username: "test",
      secretToken: "abc123",
      internalDebugFlag: true,
    });
    expect(result).not.toHaveProperty("secretToken");
    expect(result).not.toHaveProperty("internalDebugFlag");
  });
});
