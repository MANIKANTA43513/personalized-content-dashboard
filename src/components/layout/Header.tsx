'use client';

import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { openNav } from '@/store/slices/uiSlice';
import { SearchBar } from '@/components/search/SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AccountMenu } from './AccountMenu';

export function Header() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-surface/90 px-3 py-3 backdrop-blur sm:gap-3 sm:px-6">
      <button type="button" onClick={() => dispatch(openNav())} aria-label={t('nav.open')} data-testid="open-nav" className="btn-ghost h-10 w-10 shrink-0 p-0 lg:hidden">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex min-w-0 flex-1 justify-center sm:justify-start"><SearchBar /></div>
      <div className="hidden md:block"><LanguageSwitcher /></div>
      <ThemeToggle />
      <AccountMenu />
    </header>
  );
}
