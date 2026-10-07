import type { Metadata } from 'next';
import { FavoritesView } from '@/components/dashboard/FavoritesView';

export const metadata: Metadata = { title: 'Favorites' };

export default function Page() {
  return <FavoritesView />;
}
