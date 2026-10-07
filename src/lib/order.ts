/**
 * Applies a persisted card order to a list. Items with a saved position come
 * first in that order; anything unseen (newly fetched) keeps its natural order after.
 */
export function applyOrder<T extends { id: string }>(items: T[], order: string[]): T[] {
  if (order.length === 0) return items;
  const index = new Map(order.map((id, i) => [id, i]));
  const known = items.filter((i) => index.has(i.id)).sort((a, b) => index.get(a.id)! - index.get(b.id)!);
  const unknown = items.filter((i) => !index.has(i.id));
  return [...known, ...unknown];
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
