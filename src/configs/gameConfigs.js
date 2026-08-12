const rawGameConfigs = {
  genshin: {
    id: "Genshin",
    routeKey: "genshin",
    shortLabel: "Genshin",
    logo: "/genshin.webp",
    color: "#FFD700",
    bgColor: "rgba(255, 215, 0, 0.15)",
    borderColor: "rgba(255, 215, 0, 0.4)",
    lightColor: "#B8860B",
    lightBgColor: "rgba(184, 134, 11, 0.15)",
    lightBorderColor: "rgba(184, 134, 11, 0.4)",
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
    color: "#00D4FF",
    bgColor: "rgba(0, 212, 255, 0.15)",
    borderColor: "rgba(0, 212, 255, 0.4)",
    lightColor: "#0077A8",
    lightBgColor: "rgba(0, 119, 168, 0.15)",
    lightBorderColor: "rgba(0, 119, 168, 0.4)",
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
    color: "#FF6B00",
    bgColor: "rgba(255, 107, 0, 0.15)",
    borderColor: "rgba(255, 107, 0, 0.4)",
    lightColor: "#C45200",
    lightBgColor: "rgba(196, 82, 0, 0.15)",
    lightBorderColor: "rgba(196, 82, 0, 0.4)",
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
    color: "#FF69B4",
    bgColor: "rgba(255, 105, 180, 0.15)",
    borderColor: "rgba(255, 105, 180, 0.4)",
    lightColor: "#CC3388",
    lightBgColor: "rgba(204, 51, 136, 0.15)",
    lightBorderColor: "rgba(204, 51, 136, 0.4)",
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
    color: "#C8A2C8",
    bgColor: "rgba(200, 162, 200, 0.15)",
    borderColor: "rgba(200, 162, 200, 0.4)",
    lightColor: "#8B6B8B",
    lightBgColor: "rgba(139, 107, 139, 0.15)",
    lightBorderColor: "rgba(139, 107, 139, 0.4)",
    routeKey: null,
    capabilities: { commands: false, management: {} },
  },
  Unsupported: {
    id: "Unsupported",
    label: "Miscellaneous",
    shortLabel: "Misc",
    color: "#888888",
    bgColor: "rgba(136, 136, 136, 0.15)",
    borderColor: "rgba(136, 136, 136, 0.4)",
    lightColor: "#555555",
    lightBgColor: "rgba(85, 85, 85, 0.15)",
    lightBorderColor: "rgba(85, 85, 85, 0.4)",
    routeKey: null,
    capabilities: { commands: false, management: {} },
  },
};

const normalizeGameConfig = (config) => {
  const management = config.capabilities?.management || {};

  return {
    ...config,
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
