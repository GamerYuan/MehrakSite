const responsiveSource = (stem) =>
  [480, 768, 1200, 1600].map((width) => `/showcase/${stem}-${width}.webp ${width}w`).join(", ");

export const homepageShowcases = [
  {
    id: "build-card",
    title: "Build cards",
    description:
      "Turn character stats, equipment, talents, and progression into one card ready to share.",
    command: "/hsr character characters:Sparxie",
    docsKey: "hsr character",
    src: "/showcase/builds-2-1200.webp",
    srcset: responsiveSource("builds-2"),
    width: 3000,
    height: 1200,
    original: "/showcase/builds-2.webp",
    alt: "Genshin Impact build card showing Nahida's equipment, talents, and combat stats",
  },
  {
    id: "roster-summary",
    title: "Roster summaries",
    description:
      "Review character levels, progression, and key equipment in a compact roster overview.",
    command: "/genshin charlist",
    docsKey: "genshin charlist",
    src: "/showcase/list-1-1200.webp",
    srcset: responsiveSource("list-1"),
    width: 3930,
    height: 2750,
    original: "/showcase/list-1.webp",
    alt: "Generated roster summary with character portraits, levels, and equipment",
  },
  {
    id: "endgame-record",
    title: "Endgame records",
    description: "Present supported endgame clears with the teams and results that earned them.",
    command: "/genshin theater",
    docsKey: "genshin theater",
    src: "/showcase/endgame-2-1200.webp",
    srcset: responsiveSource("endgame-2"),
    width: 1900,
    height: 2420,
    original: "/showcase/endgame-2.webp",
    alt: "Generated Spiral Abyss clear record showing teams and chamber results",
  },
];

export function homepageDocsRoute(showcase) {
  return {
    path: "/docs",
    query: { tab: "commands", search: showcase.docsKey },
  };
}
