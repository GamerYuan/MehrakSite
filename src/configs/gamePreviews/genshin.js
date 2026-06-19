import { renderPortrait } from "./renderPortrait.js";

export default {
  width: 1200,
  height: 1080,
  background: "/portrait_bg/genshin.webp",
  assets: {},
  render(ctx, { canvas, background, portrait, x, y, w, h, flipX, fadeX, fadeWidth }) {
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = "SlateGray";
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "overlay";
    ctx.drawImage(background, 0, 0, cw, ch);
    ctx.globalCompositeOperation = "source-over";

    renderPortrait(ctx, { portrait, x, y, w, h, flipX, fadeX, fadeWidth });

    ctx.fillStyle = "DarkSlateGray";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(120, 900 - i * 150, 60, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(1050, 1000 - i * 140, 50, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};
