import { CSS_FILTERS, applyPixelFilter, FilterName } from './filters';
import type { TextItem } from '@/components/DraggableText';

type Sticker = { src: string; x: number; y: number; size: number }; // x, y in %, size in px on a 600px-wide strip

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

export async function renderStrip(opts: {
  photos: string[]; stickers: Sticker[]; texts: TextItem[]; filter: FilterName;
}): Promise<Blob> {
  const { photos, stickers, texts, filter } = opts;
  const W = 600, pad = 30, gap = 20;
  const pw = W - pad * 2, ph = Math.round((pw * 3) / 4), footer = 110;
  const H = pad + photos.length * (ph + gap) - gap + footer;
  const scale = 2; // sharper PNG

  const c = document.createElement('canvas');
  c.width = W * scale; c.height = H * scale;
  const ctx = c.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  const supportsFilter = 'filter' in ctx;
  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i]);
    const y = pad + i * (ph + gap);
    // cover crop
    const r = Math.max(pw / img.width, ph / img.height);
    const sw = pw / r, sh = ph / r;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, y, pw, ph);
    ctx.clip();
    if (supportsFilter) ctx.filter = CSS_FILTERS[filter];
    ctx.drawImage(img, sx, sy, sw, sh, pad, y, pw, ph);
    ctx.restore();
    if (!supportsFilter) { // Safari: fix only the photo area
      const area = ctx.getImageData(pad * scale, y * scale, pw * scale, ph * scale);
      const t = document.createElement('canvas');
      t.width = area.width; t.height = area.height;
      const tctx = t.getContext('2d')!;
      tctx.putImageData(area, 0, 0);
      applyPixelFilter(tctx, t.width, t.height, filter);
      ctx.drawImage(t, pad, y, pw, ph);
    }
  }

  for (const s of stickers) {
    const img = await loadImage(s.src);
    const w = s.size, h = (img.height / img.width) * w;
    ctx.drawImage(img, (s.x / 100) * W - w / 2, (s.y / 100) * H - h / 2, w, h);
  }

  for (const t of texts) {
    ctx.font = `${t.size}px sans-serif`;
    ctx.fillStyle = t.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.text, (t.x / 100) * W, (t.y / 100) * H);
  }

  return new Promise((res) => c.toBlob((b) => res(b!), 'image/png'));
}

export async function downloadStrip(opts: Parameters<typeof renderStrip>[0]) {
  const blob = await renderStrip(opts);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'photobooth-strip.png';
  a.click();
  URL.revokeObjectURL(a.href);
}