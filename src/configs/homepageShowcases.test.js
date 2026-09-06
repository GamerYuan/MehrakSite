import { homepageDocsRoute, homepageShowcases } from "./homepageShowcases";

describe("homepage showcase contracts", () => {
  it("keeps stable IDs and game-qualified command documentation routes", () => {
    expect(homepageShowcases.map((showcase) => showcase.id)).toEqual([
      "build-card",
      "roster-summary",
      "endgame-record",
    ]);

    expect(homepageShowcases.map(homepageDocsRoute)).toEqual([
      { path: "/docs", query: { tab: "commands", search: "hsr character" } },
      { path: "/docs", query: { tab: "commands", search: "genshin charlist" } },
      { path: "/docs", query: { tab: "commands", search: "genshin theater" } },
    ]);
  });

  it("defines responsive, intrinsic, and accessible media for every showcase", () => {
    for (const showcase of homepageShowcases) {
      expect(showcase.srcset).toContain("480w");
      expect(showcase.srcset).toContain("1600w");
      expect(showcase.width).toBeGreaterThan(0);
      expect(showcase.height).toBeGreaterThan(0);
      expect(showcase.alt).not.toBe("");
      expect(showcase.original).not.toBe(showcase.src);
    }
  });
});
