import { gameMeta, gameOptions, gameFilterOptions, permissionLabels, availablePermissions, gameLabels } from "./gameMeta";

describe("gameMeta derived exports", () => {
  it("availablePermissions excludes Unsupported but includes TearsOfThemis", () => {
    expect(availablePermissions).toContain("Genshin");
    expect(availablePermissions).toContain("TearsOfThemis");
    expect(availablePermissions).not.toContain("Unsupported");
  });

  it("permissionLabels maps game keys to their label", () => {
    expect(permissionLabels.Genshin).toBe("Genshin Impact");
    expect(permissionLabels.HonkaiStarRail).toBe("Honkai: Star Rail");
  });

  it("gameOptions includes all games plus Miscellaneous", () => {
    const values = gameOptions.map((o) => o.value);
    expect(values).toContain("Genshin");
    expect(values).toContain("Unsupported");
  });

  it("gameFilterOptions starts with All Games", () => {
    expect(gameFilterOptions[0]).toEqual({ label: "All Games", value: "All" });
  });

  it("gameLabels maps all keys including Unsupported", () => {
    expect(gameLabels.Unsupported).toBe("Miscellaneous");
    expect(gameLabels.Genshin).toBe("Genshin Impact");
  });
});
