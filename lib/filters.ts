// notun
import type { FilterName } from './store';

export const CSS_FILTERS: Record<FilterName, string> = {
  none: 'none',
  bw: 'grayscale(1) contrast(1.1)',
  vintage: 'sepia(0.6) contrast(0.9) saturate(1.2)',
  warm: 'sepia(0.25) saturate(1.3) hue-rotate(-10deg)',
  cool: 'saturate(1.1) hue-rotate(15deg) brightness(1.03)',
};

// Safari fallback when ctx.filter is not supported
export function applyPixelFilter(ctx: CanvasRenderingContext2D, w: number, h: number, f: FilterName) {
  if (f === 'none') return;
  const d = ctx.getImageData(0, 0, w, h);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    let r = p[i], g = p[i + 1], b = p[i + 2];
    if (f === 'bw') { r = g = b = 0.3 * r + 0.59 * g + 0.11 * b; }
    if (f === 'vintage') {
      const nr = 0.393 * r + 0.769 * g + 0.189 * b;
      const ng = 0.349 * r + 0.686 * g + 0.168 * b;
      const nb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = nr * 0.8 + r * 0.2; g = ng * 0.8 + g * 0.2; b = nb * 0.8 + b * 0.2;
    }
    if (f === 'warm') { r *= 1.1; b *= 0.9; }
    if (f === 'cool') { r *= 0.9; b *= 1.1; }
    p[i] = Math.min(255, r); p[i + 1] = Math.min(255, g); p[i + 2] = Math.min(255, b);
  }
  ctx.putImageData(d, 0, 0);
}