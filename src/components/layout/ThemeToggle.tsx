'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';

export function ThemeToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const isDark = mode === 'dark';
  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-pressed={isDark}
      aria-label={t('theme.toggle')}
      title={isDark ? t('theme.switchLight') : t('theme.switchDark')}
      data-testid="theme-toggle"
      className="btn-ghost h-10 w-10 rounded-full p-0"
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
