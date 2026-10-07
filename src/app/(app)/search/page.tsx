import type { Metadata } from 'next';
import { SearchView } from '@/components/search/SearchView';

export const metadata: Metadata = { title: 'Search' };

export default function Page() {
  return <SearchView />;
}
