import { renderPortrait } from "./renderPortrait.js";
import { getCanvasColor } from "./color.js";

export default {
  width: 750,
  height: 1400,
  background: "/portrait_bg/zzz.webp",
  bgColor: "var(--preview-zzz-bg)",
  assets: {},
  render(ctx, { canvas, background, portrait, x, y, w, h, flipX, fadeX, fadeWidth }) {
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(background, 0, 0, cw, ch);

    renderPortrait(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth });

    ctx.fillStyle = getCanvasColor("--preview-zzz-panel");
    ctx.beginPath();
    ctx.moveTo(600, ch);
    ctx.lineTo(700, 0);
    ctx.lineTo(cw, 0);
    ctx.lineTo(cw, ch);
    ctx.closePath();
    ctx.fill();
  },
};
