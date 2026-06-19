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
  width: 750,
  height: 1400,
  background: null,
  bgColor: "#778899",
  assets: {},
  render(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth }) {
    ctx.clearRect(0, 0, 750, 1400);
    ctx.fillStyle = "#778899";
    ctx.fillRect(0, 0, 750, 1400);
    renderPortrait(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth });
  },
};
