import { isDashboardDestinationActive, resolveActiveGameKey } from "./dashboardNavigation";

const gameKeys = new Set(["genshin", "hsr", "zzz", "hi3"]);

describe("dashboard navigation activity", () => {
  it("uses canonical route params for game and deep management routes", () => {
    expect(resolveActiveGameKey({ params: { game: "genshin" } }, gameKeys)).toBe("genshin");
    expect(
      resolveActiveGameKey(
        {
          params: { game: "hsr" },
          matched: [{ path: "/dashboard/:game/manage/aliases" }],
        },
        gameKeys,
      ),
    ).toBe("hsr");
  });

  it("falls back to deepest matched route metadata without path substring checks", () => {
    expect(
      resolveActiveGameKey(
        {
          params: {},
          matched: [{ meta: { gameRouteKey: "genshin" } }, { meta: { gameRouteKey: "zzz" } }],
        },
        gameKeys,
      ),
    ).toBe("zzz");
  });

  it("does not mark overview or administration routes as games", () => {
    expect(resolveActiveGameKey({ params: {}, matched: [] }, gameKeys)).toBeNull();
    expect(isDashboardDestinationActive({ name: "dashboard-home" }, "dashboard-home")).toBe(true);
    expect(isDashboardDestinationActive({ name: "docs-management" }, "dashboard-home")).toBe(false);
  });
});
