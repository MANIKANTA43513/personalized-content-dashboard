import type { Metadata } from 'next';
import { FeedView } from '@/components/dashboard/FeedView';

export const metadata: Metadata = { title: 'Personalized feed' };

export default function Page() {
  return <FeedView />;
}
