'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { contentApi, useLogoutMutation } from '@/services/api/contentApi';
import { signedOut } from '@/store/slices/authSlice';

export function AccountMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [logout, { isLoading }] = useLogoutMutation();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector<HTMLElement>('button')?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initials = (user?.name ?? '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const onLogout = async () => {
    await logout().unwrap().catch(() => undefined);
    dispatch(signedOut());
    dispatch(contentApi.util.resetApiState());
    router.replace('/login');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t('account.menu')}
        data-testid="account-button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink"
      >
        {initials}
      </button>
      {open && (
        <div role="group" aria-label={t('account.menu')} className="absolute right-0 z-40 mt-2 w-64 rounded-card border border-line bg-surface p-2 shadow-lift">
          <div className="border-b border-line px-3 py-2">
            <p className="truncate font-medium" data-testid="account-name">{user?.name}</p>
            <p className="truncate text-sm text-muted">{user?.email}</p>
          </div>
          <Link href="/settings" onClick={() => setOpen(false)} className="btn-ghost mt-1 w-full justify-start">
            <Settings className="h-4 w-4" aria-hidden="true" />
            {t('nav.settings')}
          </Link>
          <button type="button" onClick={onLogout} disabled={isLoading} className="btn-ghost w-full justify-start" data-testid="logout-button">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('account.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
