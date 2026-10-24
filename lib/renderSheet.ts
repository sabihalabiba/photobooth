// A4 sticker sheet: 3 columns x 4 rows (12 stickers), printed at 300 dpi
const DPI = 300;
const mm = (v: number) => Math.round((v / 25.4) * DPI);

const W = mm(210);
const H = mm(297);
const COLS = 3;
const ROWS = 4;
const MARGIN = mm(15);
const CELL_W = Math.floor((W - MARGIN * 2) / COLS);
const CELL_H = Math.floor((H - MARGIN * 2) / ROWS);
const PAD = mm(6); // space between a sticker and its cell edge

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderSheet(
  cutouts: string[],
  cutLines = true
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const items = cutouts.slice(0, COLS * ROWS);

  for (let i = 0; i < items.length; i++) {
    const img = await loadImage(items[i]);
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cellX = MARGIN + col * CELL_W;
    const cellY = MARGIN + row * CELL_H;

    const maxW = CELL_W - PAD * 2;
    const maxH = CELL_H - PAD * 2;
    const scale = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = cellX + (CELL_W - w) / 2;
    const y = cellY + (CELL_H - h) / 2;

    ctx.drawImage(img, x, y, w, h);

    if (cutLines) {
      const g = mm(2.5); // gap between sticker and cut line
      ctx.save();
      ctx.strokeStyle = "#9a9a9a";
      ctx.lineWidth = 3;
      ctx.setLineDash([mm(2), mm(1.5)]);
      roundRectPath(ctx, x - g, y - g, w + g * 2, h + g * 2, mm(4));
      ctx.stroke();
      ctx.restore();
    }
  }

  return canvas;
}