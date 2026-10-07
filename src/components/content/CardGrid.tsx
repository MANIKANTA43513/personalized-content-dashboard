import type { ContentItem } from '@/types/content';
import { ContentCard } from './ContentCard';

/** Static (non-sortable) grid used by Search, Favorites and Dashboard previews. */
export function CardGrid({ items, ranked = false, columns = 3 }: { items: ContentItem[]; ranked?: boolean; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${columns === 3 ? 'xl:grid-cols-3' : ''}`}>
      {items.map((item, i) => (
        <li key={item.id}>
          <ContentCard item={item} rank={ranked ? i + 1 : undefined} />
        </li>
      ))}
    </ul>
  );
}
