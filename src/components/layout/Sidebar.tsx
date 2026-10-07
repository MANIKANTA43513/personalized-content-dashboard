'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Activity, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeNav } from '@/store/slices/uiSlice';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { NAV_ITEMS } from './navItems';

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-ink"><Activity className="h-5 w-5" aria-hidden="true" /></span>
      <span className="font-display text-xl font-semibold tracking-tight">Pulse</span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const favCount = useAppSelector((s) => s.favorites.ids.length);
  return (
    <nav aria-label={t('nav.main')}>
      <ul className="space-y-1">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                data-testid={`nav-${href.slice(1)}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-raised hover:text-ink'}`}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="flex-1">{t(labelKey)}</span>
                {href === '/favorites' && favCount > 0 && <span className="rounded-full bg-raised px-2 py-0.5 text-xs text-ink" aria-label={t('nav.favoritesCount', { count: favCount })}>{favCount}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Persistent sidebar on large screens; slide-in modal drawer below `lg`. */
export function Sidebar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navOpen = useAppSelector((s) => s.ui.navOpen);
  const reduce = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  const close = () => dispatch(closeNav());
  useFocusTrap(drawerRef, navOpen, close);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-line bg-surface px-3 py-6 lg:flex">
        <Brand />
        <NavList />
      </aside>

      <AnimatePresence>
        {navOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.15 }}>
            <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden="true" />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.main')}
              data-testid="mobile-drawer"
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-8 bg-surface px-3 py-6 shadow-lift"
              initial={{ x: reduce ? 0 : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: reduce ? 0 : '-100%' }}
              transition={{ type: 'tween', duration: reduce ? 0 : 0.2 }}
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button type="button" onClick={close} aria-label={t('nav.close')} className="btn-ghost h-9 w-9 p-0"><X className="h-5 w-5" aria-hidden="true" /></button>
              </div>
              <NavList onNavigate={close} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
