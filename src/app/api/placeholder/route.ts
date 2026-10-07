import { CATEGORY_COLORS, isCategory } from '@/lib/categories';

/** Deterministic generated artwork so the app has imagery with zero external dependencies. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const c = url.searchParams.get('c') ?? '';
  const seed = (url.searchParams.get('s') ?? '').slice(0, 80);
  const kind = ['news', 'rec', 'social'].includes(url.searchParams.get('k') ?? '') ? url.searchParams.get('k') : 'news';
  if (!isCategory(c)) return new Response('Bad request', { status: 400 });

  const [dark, light] = CATEGORY_COLORS[c];
  const h = hash(seed + c);
  const shapes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const v = hash(`${seed}${i}`);
    const cx = v % 640;
    const cy = (v >> 8) % 360;
    const r = 40 + ((v >> 4) % 140);
    const op = (0.12 + ((v >> 12) % 30) / 100).toFixed(2);
    shapes.push(kind === 'rec' ? `<rect x="${cx - r / 2}" y="${cy - r / 2}" width="${r}" height="${r * 1.4}" rx="10" fill="${light}" opacity="${op}" transform="rotate(${(v >> 3) % 40 - 20} ${cx} ${cy})"/>` : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${light}" opacity="${op}"/>`);
  }
  const angle = h % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img"><defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${dark}" stop-opacity=".78"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/>${shapes.join('')}</svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" },
  });
}
