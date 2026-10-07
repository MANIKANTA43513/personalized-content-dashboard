import type { Metadata } from 'next';
import { TrendingView } from '@/components/dashboard/TrendingView';

export const metadata: Metadata = { title: 'Trending' };

export default function Page() {
  return <TrendingView />;
}
