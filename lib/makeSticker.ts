import { removeBackground } from '@imgly/background-removal';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

export async function makeSticker(photoDataUrl: string, border = 14): Promise<string> {
  const blob = await (await fetch(photoDataUrl)).blob();
  const cut = await removeBackground(blob); // first run downloads the model
  const img = await loadImage(URL.createObjectURL(cut));

  const pad = border * 2 + 20;
  const w = img.width + pad * 2;
  const h = img.height + pad * 2;

  // white silhouette
  const sil = document.createElement('canvas');
  sil.width = w; sil.height = h;
  const sctx = sil.getContext('2d')!;
  sctx.drawImage(img, pad, pad);
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = '#fff';
  sctx.fillRect(0, 0, w, h);

  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d')!;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) { // white border
    ctx.drawImage(sil, Math.cos(a) * border, Math.sin(a) * border);
  }
  ctx.shadowColor = 'transparent';
  ctx.drawImage(img, pad, pad);
  return out.toDataURL('image/png');
}