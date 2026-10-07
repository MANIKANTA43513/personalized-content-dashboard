'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCategory, setCategories } from '@/store/slices/preferencesSlice';
import { CATEGORIES } from '@/types/content';
import { useTranslation } from 'react-i18next';

/** Multi-select topic chooser. Each option is a real checkbox so it is keyboard- and screen-reader-friendly. */
export function PreferencesPanel() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.preferences.categories);

  return (
    <fieldset>
      <legend className="text-lg font-semibold">{t('settings.topics')}</legend>
      <p className="mt-1 text-sm text-muted" id="topics-help">{t('settings.topicsHelp')}</p>
      <div className="mt-4 flex flex-wrap gap-2.5" aria-describedby="topics-help">
        {CATEGORIES.map((c) => {
          const checked = selected.includes(c);
          return (
            <label key={c} className="cursor-pointer">
              <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => dispatch(toggleCategory(c))} data-testid={`category-${c}`} />
              <span className="inline-flex items-center rounded-full border border-line bg-surface px-4 py-2 text-sm transition-colors peer-checked:border-transparent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {t(`category.${c}`)}
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm">
        <span className="text-muted" aria-live="polite" data-testid="topics-count">{t('settings.selectedCount', { count: selected.length })}</span>
        <button type="button" className="btn-ghost px-2 py-1" onClick={() => dispatch(setCategories([...CATEGORIES]))}>{t('settings.selectAll')}</button>
        <button type="button" className="btn-ghost px-2 py-1" onClick={() => dispatch(setCategories([]))}>{t('settings.clearAll')}</button>
      </div>
    </fieldset>
  );
}
