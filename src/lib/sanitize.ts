/**
 * External content (news, TMDB, social) is untrusted. We never render it as HTML:
 * React escapes text nodes, and these helpers strip markup and validate URLs
 * so we never emit `javascript:` links or odd image sources.
 */
export function stripHtml(input: unknown, maxLength = 400): string {
  if (typeof input !== 'string') return '';
  const text = input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

export function safeUrl(input: unknown, fallback = '#'): string {
  if (typeof input !== 'string') return fallback;
  try {
    const u = new URL(input);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function safeImage(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  if (input.startsWith('/api/placeholder?')) return input;
  const u = safeUrl(input, '');
  return u.startsWith('https://') ? u : null;
}
