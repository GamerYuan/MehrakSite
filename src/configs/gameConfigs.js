const rawGameConfigs = {
  genshin: {
    id: "Genshin",
    routeKey: "genshin",
    shortLabel: "Genshin",
    logo: "/genshin.webp",
    colors: { light: "oklch(52% 0.13 85)", dark: "oklch(82% 0.14 85)" },
    endpoint: "/genshin",
    title: "Genshin Impact",
    capabilities: {
      commands: true,
      management: {
        characters: true,
        aliases: true,
        codes: true,
        stats: true,
        portraits: true,
        userPortraits: true,
        weaponIcons: true,
      },
    },
    servers: [
      { value: "America", label: "America" },
      { value: "Europe", label: "Europe" },
      { value: "Asia", label: "Asia" },
      { value: "Sar", label: "TW/HK/MO" },
    ],
    tabs: [
      { id: "character", name: "Character", hasCharacterInput: true },
      {
        id: "abyss",
        name: "Spiral Abyss",
        hasFloorInput: true,
        floorMin: 9,
        floorMax: 12,
      },
      { id: "theater", name: "Imaginarium Theater" },
      { id: "stygian", name: "Stygian Onslaught" },
      { id: "charlist", name: "Character List" },
    ],
    characterPlaceholder: "e.g. Nahida",
    portraitAlignX: 640,
    portraitAlignY: 640,
    portraitAnchorX: 0.5,
    portraitAnchorY: 0.5,
    portraitDefaultWidth: 1400,
    fadeX: 1000,
    fadeWidth: 150,
  },

  hsr: {
    id: "HonkaiStarRail",
    routeKey: "hsr",
    shortLabel: "HSR",
    logo: "/hsr.webp",
    colors: { light: "oklch(51% 0.12 225)", dark: "oklch(80% 0.12 225)" },
    endpoint: "/hsr",
    title: "Honkai: Star Rail",
    capabilities: {
      commands: true,
      management: {
        characters: true,
        aliases: true,
        codes: true,
        stats: false,
        portraits: true,
        userPortraits: true,
        weaponIcons: false,
      },
    },
    servers: [
      { value: "America", label: "America" },
      { value: "Europe", label: "Europe" },
      { value: "Asia", label: "Asia" },
      { value: "Sar", label: "TW/HK/MO" },
    ],
    tabs: [
      { id: "character", name: "Character", hasCharacterInput: true },
      { id: "moc", name: "Memory of Chaos" },
      { id: "pf", name: "Pure Fiction" },
      { id: "as", name: "Apocalyptic Shadow" },
      { id: "aa", name: "Anomaly Arbitration" },
      { id: "charlist", name: "Character List" },
    ],
    characterPlaceholder: "e.g. Firefly",
    portraitAlignX: 400,
    portraitAlignY: 700,
    portraitAnchorX: 0.5,
    portraitAnchorY: 0.5,
    portraitDefaultWidth: 1000,
    fadeX: 0,
    fadeWidth: 0,
  },

  zzz: {
    id: "ZenlessZoneZero",
    routeKey: "zzz",
    shortLabel: "ZZZ",
    logo: "/zzz.webp",
    colors: { light: "oklch(55% 0.17 50)", dark: "oklch(76% 0.16 50)" },
    endpoint: "/zzz",
    title: "Zenless Zone Zero",
    capabilities: {
      commands: true,
      management: {
        characters: true,
        aliases: true,
        codes: true,
        stats: false,
        portraits: true,
        userPortraits: true,
        weaponIcons: false,
      },
    },
    servers: [
      { value: "America", label: "America" },
      { value: "Europe", label: "Europe" },
      { value: "Asia", label: "Asia" },
      { value: "Sar", label: "TW/HK/MO" },
    ],
    tabs: [
      { id: "character", name: "Character", hasCharacterInput: true },
      { id: "shiyu", name: "Shiyu Defense" },
      { id: "da", name: "Deadly Assault" },
    ],
    characterPlaceholder: "e.g. Ellen",
    portraitAlignX: 350,
    portraitAlignY: 650,
    portraitAnchorX: 0.5,
    portraitAnchorY: 0.25,
    portraitDefaultWidth: 2000,
    fadeX: 0,
    fadeWidth: 0,
  },

  hi3: {
    id: "HonkaiImpact3",
    routeKey: "hi3",
    shortLabel: "HI3",
    logo: "/hi3.webp",
    colors: { light: "oklch(54% 0.16 350)", dark: "oklch(78% 0.14 350)" },
    endpoint: "/hi3",
    title: "Honkai Impact 3rd",
    capabilities: {
      commands: true,
      management: {
        characters: true,
        aliases: true,
        codes: false,
        stats: false,
        portraits: true,
        userPortraits: true,
        weaponIcons: false,
      },
    },
    servers: [
      { value: "SEA", label: "SEA" },
      { value: "JP", label: "JP" },
      { value: "KR", label: "KR" },
      { value: "America", label: "America" },
      { value: "SAR", label: "TW/HK/MO" },
      { value: "Europe", label: "Europe" },
    ],
    tabs: [
      {
        id: "battlesuit",
        name: "Battlesuit",
        hasCharacterInput: true,
        characterLabel: "Battlesuit Name",
      },
    ],
    characterPlaceholder: "e.g. White Comet",
    portraitAlignX: 350,
    portraitAlignY: 425,
    portraitAnchorX: 0.5,
    portraitAnchorY: 0.5,
    fadeX: 650,
    fadeWidth: 100,
  },

  TearsOfThemis: {
    id: "TearsOfThemis",
    label: "Tears of Themis",
    shortLabel: "ToT",
    colors: { light: "oklch(52% 0.08 315)", dark: "oklch(77% 0.08 315)" },
    routeKey: null,
    capabilities: { commands: false, management: {} },
  },
  Unsupported: {
    id: "Unsupported",
    label: "Miscellaneous",
    shortLabel: "Misc",
    colors: { light: "oklch(50% 0.02 240)", dark: "oklch(72% 0.02 240)" },
    routeKey: null,
    capabilities: { commands: false, management: {} },
  },
};

const normalizeGameConfig = (config) => {
  const management = config.capabilities?.management || {};
  const { light, dark } = config.colors;
  const gameColor = `light-dark(${light}, ${dark})`;

  return {
    ...config,
    gameColor,
    gameColorStyle: { "--game-color": gameColor },
    // Compatibility fields stay derived from the same pair until their consumers adopt --game-color.
    color: gameColor,
    bgColor: `color-mix(in oklch, ${gameColor} 15%, transparent)`,
    borderColor: `color-mix(in oklch, ${gameColor} 40%, transparent)`,
    lightColor: light,
    lightBgColor: `color-mix(in oklch, ${light} 15%, transparent)`,
    lightBorderColor: `color-mix(in oklch, ${light} 40%, transparent)`,
    routeKey: config.routeKey || null,
    label: config.label || config.title,
    hasCodesManagement: Boolean(management.codes),
    hasStatEdit: Boolean(management.stats),
    hasWeaponIcons: Boolean(management.weaponIcons),
  };
};

const normalizedGameConfigs = Object.values(rawGameConfigs).map(normalizeGameConfig);

export const gameRegistry = Object.fromEntries(
  normalizedGameConfigs.map((config) => [config.id, config]),
);

export const gameConfigs = Object.fromEntries(
  normalizedGameConfigs
    .filter((config) => Boolean(config.routeKey))
    .map((config) => [config.routeKey, config]),
);

export const getGameConfig = (game) =>
  gameConfigs[game] ||
  gameRegistry[game] ||
  Object.values(gameConfigs).find((config) => config.id === game);
