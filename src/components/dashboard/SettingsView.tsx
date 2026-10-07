'use client';

import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLiveUpdates } from '@/store/slices/preferencesSlice';
import { setTheme } from '@/store/slices/themeSlice';
import { resetOrder } from '@/store/slices/feedSlice';
import { setSimulateError, announce } from '@/store/slices/uiSlice';
import { contentApi } from '@/services/api/contentApi';
import { PreferencesPanel } from '@/components/settings/PreferencesPanel';
import { Switch } from '@/components/settings/Switch';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { PageHeader } from './PageHeader';

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className="rounded-card border border-line bg-surface p-6 shadow-card" aria-label={title}>
      {children}
    </section>
  );
}

export function SettingsView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const liveUpdates = useAppSelector((s) => s.preferences.liveUpdates);
  const mode = useAppSelector((s) => s.theme.mode);
  const simulateError = useAppSelector((s) => s.ui.simulateError);
  const hasOrder = useAppSelector((s) => s.feed.order.length > 0);

  return (
    <>
      <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />
      <div className="grid max-w-3xl gap-6">
        <Card><PreferencesPanel /></Card>

        <Card title={t('settings.appearance')}>
          <h2 className="mb-4 text-lg font-semibold">{t('settings.appearance')}</h2>
          <div className="space-y-5">
            <Switch label={t('settings.darkMode')} description={t('settings.darkModeHelp')} checked={mode === 'dark'} onChange={(v) => dispatch(setTheme(v ? 'dark' : 'light'))} testId="setting-dark" />
            <LanguageSwitcher showLabel />
          </div>
        </Card>

        <Card title={t('settings.feed')}>
          <h2 className="mb-4 text-lg font-semibold">{t('settings.feed')}</h2>
          <div className="space-y-5">
            <Switch label={t('settings.live')} description={t('settings.liveHelp')} checked={liveUpdates} onChange={(v) => dispatch(setLiveUpdates(v))} testId="setting-live" />
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="font-medium">{t('settings.order')}</p>
                <p className="mt-0.5 text-sm text-muted">{t('settings.orderHelp')}</p>
              </div>
              <button type="button" className="btn-secondary shrink-0" disabled={!hasOrder} onClick={() => { dispatch(resetOrder()); dispatch(announce(t('feed.orderReset'))); }}>{t('feed.resetOrder')}</button>
            </div>
          </div>
        </Card>

        <Card title={t('settings.account')}>
          <h2 className="mb-4 text-lg font-semibold">{t('settings.account')}</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">{t('settings.name')}</dt><dd className="mt-0.5 font-medium">{user?.name}</dd></div>
            <div><dt className="text-muted">{t('settings.email')}</dt><dd className="mt-0.5 font-medium">{user?.email}</dd></div>
          </dl>
        </Card>

        <Card title={t('settings.demo')}>
          <h2 className="mb-4 text-lg font-semibold">{t('settings.demo')}</h2>
          <Switch
            label={t('settings.simulate')}
            description={t('settings.simulateHelp')}
            checked={simulateError}
            onChange={(v) => {
              dispatch(setSimulateError(v));
              if (!v) dispatch(contentApi.util.invalidateTags([]));
            }}
            testId="setting-simulate-error"
          />
        </Card>
      </div>
    </>
  );
}
