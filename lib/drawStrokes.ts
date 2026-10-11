import type { Stroke } from "./store";

export function drawStrokes(ctx: CanvasRenderingContext2D, W: number, H: number, strokes: Stroke[]) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.beginPath();
    s.points.forEach((p, i) => {
      const x = (p.x / 100) * W;
      const y = (p.y / 100) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    if (s.points.length === 1) {
      const p = s.points[0];
      ctx.lineTo((p.x / 100) * W + 0.01, (p.y / 100) * H);
    }
    ctx.stroke();
  }
}