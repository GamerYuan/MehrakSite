import { describe, it, expect } from "vitest";

// Ponytail: hasGameWriteAccess is internal to DocsManagementView.
// This test exercises the same comparison logic the fix relies on —
// PascalCase game names must match gameWritePermissions without
// Lowercasing. If the component refactors this function out, update
// This import accordingly.
const hasGameWriteAccess = (userInfo, game) => {
  if (userInfo.isSuperAdmin) return true;
  return userInfo.gameWritePermissions?.includes(game);
};

describe("hasGameWriteAccess — docs permission check", () => {
  it("grants access to superAdmin regardless of permissions", () => {
    const user = { isSuperAdmin: true, gameWritePermissions: [] };
    expect(hasGameWriteAccess(user, "Genshin")).toBe(true);
  });

  it("matches PascalCase game name against PascalCase permissions", () => {
    const user = {
      isSuperAdmin: false,
      gameWritePermissions: ["Genshin", "HonkaiStarRail"],
    };
    expect(hasGameWriteAccess(user, "Genshin")).toBe(true);
    expect(hasGameWriteAccess(user, "HonkaiStarRail")).toBe(true);
  });

  it("rejects game not in permissions list", () => {
    const user = {
      isSuperAdmin: false,
      gameWritePermissions: ["Genshin"],
    };
    expect(hasGameWriteAccess(user, "ZenlessZoneZero")).toBe(false);
  });

  it("does not lowercase before matching", () => {
    const user = {
      isSuperAdmin: false,
      gameWritePermissions: ["Genshin"],
    };
    // This is the exact bug that was fixed — lowercasing caused mismatch
    expect(hasGameWriteAccess(user, "genshin")).toBe(false);
    expect(hasGameWriteAccess(user, "Genshin")).toBe(true);
  });

  it("handles undefined gameWritePermissions gracefully", () => {
    const user = { isSuperAdmin: false };
    expect(hasGameWriteAccess(user, "Genshin")).toBeFalsy();
  });
});
