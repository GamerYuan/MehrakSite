const PLACEHOLDER_CONTENT = /\b(?:lorem ipsum|placeholder|test command|example command|todo)\b/i;

const normalizedText = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

export function isPublicDocument(document, supportedGames) {
  if (!document || typeof document !== "object") return false;

  const id = normalizedText(String(document.id ?? ""));
  const name = normalizedText(document.name);
  const description = normalizedText(document.description);
  const game = normalizedText(document.game);

  // `/docs/list` is the backend's publication boundary. The client still fails closed on malformed,
  // Empty, unsafe-to-render, or obvious fixture-grade records are never exposed publicly.
  if (!id || name.length < 2 || !description || !supportedGames.includes(game)) return false;
  if (PLACEHOLDER_CONTENT.test(`${name} ${description}`)) return false;

  return true;
}
