'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Smaller inline variant used for "load more" failures */
  inline?: boolean;
}

export function ErrorState({ title, message, onRetry, inline = false }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      data-testid="error-state"
      className={`flex ${inline ? 'flex-row items-center justify-between gap-4 p-4' : 'flex-col items-center px-6 py-14 text-center'} rounded-card border border-danger/30 bg-danger/5`}
    >
      <div className={`flex ${inline ? 'items-center gap-3' : 'flex-col items-center'}`}>
        <AlertTriangle className={inline ? 'h-5 w-5 shrink-0 text-danger' : 'mb-3 h-8 w-8 text-danger'} aria-hidden="true" />
        <div>
          <p className="font-semibold">{title ?? t('error.title')}</p>
          <p className="mt-1 text-sm text-muted">{message ?? t('error.generic')}</p>
        </div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`btn-secondary ${inline ? '' : 'mt-5'}`}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
