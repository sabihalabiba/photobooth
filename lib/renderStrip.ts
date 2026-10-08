import type { PlacedSticker, PlacedText, FilterName } from "./store";
import { CSS_FILTERS, applyPixelFilter } from "./filters";

// StripPreview.tsx er layout (px)
const W = 160;
const PAD = 12;
const GAP = 8;
const PW = W - PAD * 2; // 136
const PH = (PW * 3) / 4; // 102
const FOOTER = 16;
const SCALE = 4; // output = 640px wide

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderStrip(opts: {
  photos: string[];
  stickers: PlacedSticker[];
  texts: PlacedText[];
  filter: FilterName;
}): Promise<Blob> {
  const { photos, stickers, texts, filter } = opts;
  const n = photos.length;
  const H = PAD * 2 + n * PH + n * GAP + FOOTER;

  // 1) strip (background + photos + footer) alada canvas e
  const base = document.createElement("canvas");
  base.width = W * SCALE;
  base.height = H * SCALE;
  const b = base.getContext("2d")!;
  b.scale(SCALE, SCALE);

  b.fillStyle = "#ffffff";
  roundRectPath(b, 0, 0, W, H, 8);
  b.fill();

  for (let i = 0; i < n; i++) {
    const img = await loadImage(photos[i]);
    const y = PAD + i * (PH + GAP);
    // object-cover er moto crop
    const r = Math.max(PW / img.width, PH / img.height);
    const sw = PW / r;
    const sh = PH / r;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    b.save();
    roundRectPath(b, PAD, y, PW, PH, 4);
    b.clip();
    b.drawImage(img, sx, sy, sw, sh, PAD, y, PW, PH);
    b.restore();
  }

  b.fillStyle = "#000000";
  b.font = "12px sans-serif";
  b.textAlign = "center";
  b.textBaseline = "middle";
  b.fillText("photobooth studio", W / 2, PAD + n * (PH + GAP) + FOOTER / 2);

  // 2) final canvas: strip e filter, tarpor sticker ar text (filter chhara)
  const out = document.createElement("canvas");
  out.width = W * SCALE;
  out.height = H * SCALE;
  const ctx = out.getContext("2d")!;

  if (filter !== "none") {
    if ("filter" in ctx) {
      ctx.filter = CSS_FILTERS[filter];
      ctx.drawImage(base, 0, 0);
      ctx.filter = "none";
    } else {
      // Safari fallback
      applyPixelFilter(b, base.width, base.height, filter);
      ctx.drawImage(base, 0, 0);
    }
  } else {
    ctx.drawImage(base, 0, 0);
  }

  ctx.scale(SCALE, SCALE);

  for (const s of stickers) {
    const cx = (s.x / 100) * W;
    const cy = (s.y / 100) * H;
    if (s.src) {
      const img = await loadImage(s.src);
      const w = s.size;
      const h = (img.height / img.width) * w;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    } else {
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000";
      ctx.fillText(s.emoji, cx, cy);
    }
  }

  for (const t of texts) {
    ctx.font = `${t.size}px sans-serif`;
    ctx.fillStyle = t.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.text, (t.x / 100) * W, (t.y / 100) * H);
  }

  return new Promise((res) => out.toBlob((blob) => res(blob!), "image/png"));
}

export async function downloadStrip(opts: Parameters<typeof renderStrip>[0]) {
  const blob = await renderStrip(opts);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "photobooth-strip.png";
  a.click();
  URL.revokeObjectURL(a.href);
}