export function timeAgo(iso: string, now: number = Date.now(), locale = 'en'): string {
  const diff = new Date(iso).getTime() - now;
  if (Number.isNaN(diff)) return '';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diff);
  const m = 60_000;
  if (abs < m) return rtf.format(0, 'second');
  if (abs < 60 * m) return rtf.format(Math.round(diff / m), 'minute');
  if (abs < 24 * 60 * m) return rtf.format(Math.round(diff / (60 * m)), 'hour');
  if (abs < 30 * 24 * 60 * m) return rtf.format(Math.round(diff / (24 * 60 * m)), 'day');
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function compactNumber(n: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(n);
}
