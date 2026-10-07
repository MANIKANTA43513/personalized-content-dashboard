import type { Config } from 'tailwindcss';

/**
 * Colours are CSS custom properties (see globals.css) so light/dark themes
 * swap by toggling the `dark` class on <html> — no per-component dark: variants needed.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        raised: token('raised'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        accent: token('accent'),
        'accent-ink': token('accent-ink'),
        news: token('news'),
        rec: token('rec'),
        social: token('social'),
        danger: token('danger'),
        success: token('success'),
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgb(var(--line) / 0.6), 0 8px 24px -16px rgb(var(--shadow) / 0.35)',
        lift: '0 1px 0 rgb(var(--line) / 0.6), 0 18px 34px -18px rgb(var(--shadow) / 0.5)',
      },
      borderRadius: { card: '14px' },
    },
  },
  plugins: [],
};

export default config;
