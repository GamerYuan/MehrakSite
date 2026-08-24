import {
  availablePermissions,
  canManageGame,
  canManageGameCapability,
  gameFilterOptions,
  gameLabels,
  gameOptions,
  getGameCapabilities,
  permissionLabels,
} from "./gameMeta";
import { gameConfigs } from "./gameConfigs";

describe("gameMeta derived exports", () => {
  it("availablePermissions only includes games with routes", () => {
    expect(availablePermissions).toContain("Genshin");
    expect(availablePermissions).not.toContain("TearsOfThemis");
    expect(availablePermissions).not.toContain("Unsupported");
  });

  it("permissionLabels maps game keys to their label", () => {
    expect(permissionLabels.Genshin).toBe("Genshin Impact");
    expect(permissionLabels.HonkaiStarRail).toBe("Honkai: Star Rail");
  });

  it("gameOptions includes routed games plus Miscellaneous", () => {
    const values = gameOptions.map((o) => o.value);
    expect(values).toContain("Genshin");
    expect(values).not.toContain("TearsOfThemis");
    expect(values).toContain("Unsupported");
  });

  it("gameFilterOptions starts with All Games", () => {
    expect(gameFilterOptions[0]).toEqual({ label: "All Games", value: "All" });
  });

  it("gameLabels maps all keys including Unsupported", () => {
    expect(gameLabels.Unsupported).toBe("Miscellaneous");
    expect(gameLabels.TearsOfThemis).toBe("Tears of Themis");
    expect(gameLabels.Genshin).toBe("Genshin Impact");
  });

  it("derives route identity and capabilities from the game registry", () => {
    expect(gameConfigs.genshin.routeKey).toBe("genshin");
    expect(gameConfigs.genshin.id).toBe("Genshin");
    expect(gameLabels.Genshin).toBe(gameConfigs.genshin.title);
    expect(getGameCapabilities("genshin").management.weaponIcons).toBe(true);
    expect(gameConfigs.hi3.hasCodesManagement).toBe(false);
    expect(gameConfigs.genshin.label).toBe("Genshin Impact");
  });

  it("derives scoped and compatibility colors from one light/dark pair", () => {
    const config = gameConfigs.genshin;

    expect(config.gameColor).toBe(`light-dark(${config.colors.light}, ${config.colors.dark})`);
    expect(config.gameColorStyle).toEqual({ "--game-color": config.gameColor });
    expect(config.lightColor).toBe(config.colors.light);
    expect(config.color).toBe(config.gameColor);
    expect(config.bgColor).toContain(config.gameColor);
  });

  it("accepts route keys while checking PascalCase permissions", () => {
    const genshinUser = { isSuperAdmin: false, gameWritePermissions: ["Genshin"] };
    const otherUser = { isSuperAdmin: false, gameWritePermissions: ["HonkaiStarRail"] };

    expect(canManageGame(genshinUser, "genshin")).toBe(true);
    expect(canManageGame(otherUser, "genshin")).toBe(false);
    expect(canManageGameCapability(genshinUser, "genshin", "characters")).toBe(true);
    expect(canManageGameCapability(genshinUser, "genshin", "unknown")).toBe(false);
    expect(canManageGame({ isSuperAdmin: true }, "genshin")).toBe(true);
  });
});
