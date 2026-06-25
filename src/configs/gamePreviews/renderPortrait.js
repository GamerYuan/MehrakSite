const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

function easeInCubic(t) {
  return t * t * t;
}

export function renderPortrait(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth }) {
  if (w <= 0 || h <= 0) return;
  tempCanvas.width = w;
  tempCanvas.height = h;
  tempCtx.clearRect(0, 0, w, h);

  if (flipX) {
    tempCtx.save();
    tempCtx.translate(w, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(portrait, 0, 0, w, h);
    tempCtx.restore();
  } else {
    tempCtx.drawImage(portrait, 0, 0, w, h);
  }

  if (fadeX > 0 && fadeWidth > 0) {
    const fadeStart = fadeX - x;
    const imageData = tempCtx.getImageData(0, 0, w, h);
    const {data} = imageData;

    for (let px = 0; px < w; px++) {
      if (px >= fadeStart) {
        const t = 1 - Math.min(Math.max((px - fadeStart) / fadeWidth, 0), 1);
        const fadeAlpha = easeInCubic(t);

        for (let py = 0; py < h; py++) {
          const idx = (py * w + px) * 4 + 3;
          data[idx] = Math.round(data[idx] * fadeAlpha);
        }
      }
    }

    tempCtx.putImageData(imageData, 0, 0);
  }

  ctx.drawImage(tempCanvas, x, y);
}
