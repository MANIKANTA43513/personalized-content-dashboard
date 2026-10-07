import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const metadata: Metadata = { title: 'Dashboard' };

export default function Page() {
  return <DashboardView />;
}
