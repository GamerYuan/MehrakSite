export function getCanvasColor(token) {
  return globalThis
    .getComputedStyle(globalThis.document.documentElement)
    .getPropertyValue(token)
    .trim();
}

export function resolveCanvasColor(value) {
  if (!value.startsWith("var(")) return value;
  return getCanvasColor(value.slice(4, -1).trim());
}
