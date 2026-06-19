import { renderPortrait } from "./renderPortrait.js";

const assetCache = {};

function loadAsset(src) {
  if (assetCache[src]) return assetCache[src];
  const img = new Image();
  img.src = src;
  assetCache[src] = img;
  return img;
}

export default {
  width: 1920,
  height: 1080,
  background: "/portrait_bg/hsr.webp",
  assets: {},
  render(ctx, { background, portrait, x, y, w, h, flipX, fadeX, fadeWidth }) {
    ctx.clearRect(0, 0, 1920, 1080);
    ctx.drawImage(background, 0, 0, 1920, 1080);
    renderPortrait(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth });
  },
};
