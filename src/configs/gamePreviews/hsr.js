import { renderPortrait } from "./renderPortrait.js";

const blurCanvas = document.createElement("canvas");
const blurCtx = blurCanvas.getContext("2d");

export default {
  width: 1000,
  height: 1200,
  background: "/portrait_bg/hsr.webp",
  assets: {},
  render(ctx, { canvas, background, portrait, x, y, w, h, flipX, fadeX, fadeWidth }) {
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(background, 0, 0, cw, ch);

    renderPortrait(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth });

    blurCanvas.width = cw;
    blurCanvas.height = ch;
    blurCtx.drawImage(canvas, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(800, 0, cw, ch, [100, 0, 0, 100]);
    ctx.clip();
    ctx.filter = "blur(30px) brightness(0.35)";
    ctx.drawImage(blurCanvas, 0, 0);
    ctx.filter = "none";
    ctx.restore();
  },
};
