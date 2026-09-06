export function resolveActiveGameKey(route, validGameKeys) {
  const direct = Array.isArray(route.params?.game) ? route.params.game[0] : route.params?.game;
  if (validGameKeys.has(direct)) return direct;

  for (const record of (route.matched || []).toReversed()) {
    const matchedKey = record.meta?.gameRouteKey || record.params?.game;
    if (validGameKeys.has(matchedKey)) return matchedKey;
  }

  return null;
}

export function isDashboardDestinationActive(route, destinationName) {
  return route.name === destinationName;
}
