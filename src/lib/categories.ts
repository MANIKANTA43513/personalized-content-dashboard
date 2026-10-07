import type { Category } from '@/types/content';

/** Hex values for category accents; used in generated artwork. */
export const CATEGORY_COLORS: Record<Category, [string, string]> = {
  technology: ['#0f766e', '#5eead4'],
  sports: ['#c2410c', '#fdba74'],
  finance: ['#1d4ed8', '#93c5fd'],
  entertainment: ['#9d174d', '#f9a8d4'],
  business: ['#4d3b1f', '#e7c98a'],
  science: ['#5b21b6', '#c4b5fd'],
  health: ['#166534', '#86efac'],
};

export function isCategory(value: string): value is Category {
  return Object.prototype.hasOwnProperty.call(CATEGORY_COLORS, value);
}

export function parseCategories(raw: string | null | undefined): Category[] {
  if (!raw) return [];
  return Array.from(new Set(raw.split(',').map((s) => s.trim()).filter(isCategory)));
}
