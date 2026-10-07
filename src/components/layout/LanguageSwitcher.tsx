'use client';

import { Languages } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';
import type { Language } from '@/types/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage } from '@/store/slices/preferencesSlice';

export function LanguageSwitcher({ showLabel = false }: { showLabel?: boolean }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.preferences.language);
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className={showLabel ? 'text-sm font-medium' : 'sr-only'}>
        {t('language.label')}
      </label>
      <div className="relative">
        {!showLabel && <Languages className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />}
        <select
          id={id}
          data-testid="language-select"
          value={language}
          onChange={(e) => dispatch(setLanguage(e.target.value as Language))}
          className={`input h-10 ${showLabel ? 'w-auto' : 'w-auto pl-8'}`}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
