'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetSessionQuery } from '@/services/api/contentApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signedIn, signedOut } from '@/store/slices/authSlice';
import { closeNav } from '@/store/slices/uiSlice';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnnouncementRegion } from './AnnouncementRegion';

/** Protected layout: verifies the session cookie, then renders sidebar + header + animated page area. */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const reduce = useReducedMotion();
  const status = useAppSelector((s) => s.auth.status);
  const session = useGetSessionQuery();

  useEffect(() => {
    if (session.data) dispatch(signedIn(session.data.user));
    else if (session.isError) dispatch(signedOut());
  }, [session.data, session.isError, dispatch]);

  useEffect(() => {
    if (status === 'anonymous') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    dispatch(closeNav());
  }, [pathname, dispatch]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" aria-hidden="true" />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <a href="#main" className="sr-only-focusable btn-primary fixed left-3 top-3 z-[60]">{t('common.skipToContent')}</a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.div key={pathname} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <ErrorBoundary key={pathname}>{children}</ErrorBoundary>
          </motion.div>
        </main>
      </div>
      <AnnouncementRegion />
    </div>
  );
}
