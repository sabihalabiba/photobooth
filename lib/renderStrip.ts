import type { PlacedSticker, PlacedText, FilterName, Stroke } from "./store";
import type { Theme } from "./themes";
import { CSS_FILTERS, applyPixelFilter } from "./filters";
import { drawStrokes } from "./drawStrokes";
import { FONT_BY_ID, canvasFont } from "./fonts";

const W = 160;
const PAD = 12;
const GAP = 8;
const PW = W - PAD * 2; // 136
const PH = (PW * 3) / 4; // 102
const FOOTER = 16;
const SCALE = 4;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous"; // Supabase URL e canvas taint na hoy
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

export async function renderStrip(opts: {
  photos: string[];
  stickers: PlacedSticker[];
  texts: PlacedText[];
  filter: FilterName;
  theme: Theme;
  strokes: Stroke[];
}): Promise<Blob> {
  const { photos, stickers, texts, filter, theme, strokes } = opts;
  const n = photos.length;
  const H = PAD * 2 + n * PH + n * GAP + FOOTER;
  const bw = theme.photoBorderWidth;
  const wins =
    theme.windows && n === 3 && theme.windows.length === 3 ? theme.windows : null;

  await document.fonts.load(`16px ${theme.font}`);

  // 1) base: background + photos + footer
  const base = document.createElement("canvas");
  base.width = W * SCALE;
  base.height = H * SCALE;
  const b = base.getContext("2d")!;
  b.scale(SCALE, SCALE);

  const grad = b.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, theme.bg[0]);
  grad.addColorStop(1, theme.bg[1]);
  b.fillStyle = grad;
  roundRectPath(b, 0, 0, W, H, 8);
  b.fill();

  for (let i = 0; i < n; i++) {
    const img = await loadImage(photos[i]);
    let y: number, ix: number, iy: number, iw: number, ih: number;
    if (wins) {
      const w = wins[i];
      ix = w.x / SCALE;
      iy = w.y / SCALE;
      iw = w.w / SCALE;
      ih = w.h / SCALE;
      y = iy;
    } else {
      y = PAD + i * (PH + GAP);
      ix = PAD + bw;
      iy = y + bw;
      iw = PW - bw * 2;
      ih = PH - bw * 2;
    }
    const r = Math.max(iw / img.width, ih / img.height);
    const sw = iw / r, sh = ih / r;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;

    b.save();
    roundRectPath(b, ix, iy, iw, ih, wins ? 0 : 3);
    b.clip();
    b.drawImage(img, sx, sy, sw, sh, ix, iy, iw, ih);
    b.restore();

    if (bw > 0 && !wins) {
      b.strokeStyle = theme.photoBorder;
      b.lineWidth = bw;
      roundRectPath(b, PAD + bw / 2, y + bw / 2, PW - bw, PH - bw, 4);
      b.stroke();
    }
  }

  b.fillStyle = theme.textColor;
  b.font = `14px ${theme.font}`;
  b.textAlign = "center";
  b.textBaseline = "middle";
  b.fillText(theme.footer, W / 2, PAD + n * (PH + GAP) + FOOTER / 2);

  if (theme.overlay) {
    try {
      b.drawImage(await loadImage(theme.overlay), 0, 0, W, H);
    } catch {
      /* frame image nai, skip */
    }
  }

  // 2) final: base e filter, tarpor drawing, sticker, text (filter chhara)
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
      applyPixelFilter(b, base.width, base.height, filter);
      ctx.drawImage(base, 0, 0);
    }
  } else {
    ctx.drawImage(base, 0, 0);
  }

  ctx.scale(SCALE, SCALE);

  drawStrokes(ctx, W, H, strokes);

  for (const s of stickers) {
    const cx = (s.x / 100) * W;
    const cy = (s.y / 100) * H;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((s.rotation ?? 0) * Math.PI) / 180);
    if (s.src) {
      const img = await loadImage(s.src);
      const w = s.size;
      const h = (img.height / img.width) * w;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000";
      ctx.fillText(s.emoji, 0, 0);
    }
    ctx.restore();
  }

  for (const t of texts) {
    const fd = FONT_BY_ID[t.font] ?? FONT_BY_ID.classic;
    const font = canvasFont(fd.id, t.size);
    try {
      await document.fonts.load(font, t.text);
    } catch {
      /* font failed to load, fall back to the default */
    }
    const label = fd.uppercase ? t.text.toUpperCase() : t.text;

    ctx.save();
    ctx.translate((t.x / 100) * W, (t.y / 100) * H);
    ctx.rotate(((t.rotation ?? 0) * Math.PI) / 180);
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (fd.outline) {
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(label, 0, 0);
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = t.color;
    }
    ctx.fillText(label, 0, 0);
    ctx.restore();
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