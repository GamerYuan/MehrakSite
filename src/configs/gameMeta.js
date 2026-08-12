import { gameRegistry } from "./gameConfigs";

export const gameMeta = gameRegistry;

export const getGameMeta = (game) =>
  gameMeta[game] || Object.values(gameMeta).find((meta) => meta.routeKey === game);

export const getGamePermission = (game) => getGameMeta(game)?.id || null;

export const getGameCapabilities = (game) => getGameMeta(game)?.capabilities || {};

export const isSuperAdminUser = (user) => Boolean(user?.isSuperAdmin);

export const hasGamePermission = (user, game) => {
  if (isSuperAdminUser(user)) return true;
  const permission = getGamePermission(game);
  return Boolean(permission && user?.gameWritePermissions?.includes(permission));
};

export const hasAnyGamePermission = (user) =>
  isSuperAdminUser(user) || Boolean(user?.gameWritePermissions?.length);

export const canManageGame = hasGamePermission;

export const canManageGameCapability = (user, game, capability) => {
  const { management } = getGameCapabilities(game);
  return hasGamePermission(user, game) && management?.[capability] === true;
};

export const gameOptions = [
  ...Object.entries(gameMeta)
    .filter(([key]) => key !== "Unsupported")
    .map(([value, meta]) => ({ label: meta.label, value })),
  { label: "Miscellaneous", value: "Unsupported" },
];

export const gameFilterOptions = [{ label: "All Games", value: "All" }, ...gameOptions];

export const permissionLabels = Object.fromEntries(
  Object.entries(gameMeta)
    .filter(([key]) => key !== "Unsupported")
    .map(([key, meta]) => [key, meta.label]),
);

export const availablePermissions = Object.keys(permissionLabels);

export const gameLabels = Object.fromEntries(
  Object.entries(gameMeta).map(([key, meta]) => [key, meta.label]),
);
