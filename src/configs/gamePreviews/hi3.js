import { renderPortrait } from "./renderPortrait.js";

export default {
  width: 800,
  height: 750,
  background: "/portrait_bg/hi3.webp",
  assets: {},
  render(ctx, { canvas, background, portrait, x, y, w, h, flipX, fadeX, fadeWidth }) {
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(background, 0, 0, cw, ch);

    renderPortrait(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth });

    ctx.fillStyle = "rgba(47, 87, 126, 0.769)";
    ctx.beginPath();
    ctx.roundRect(720, 30, 600, 700, 15);
    ctx.fill();
  },
};
