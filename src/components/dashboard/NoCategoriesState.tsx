'use client';

import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';

export function NoCategoriesState() {
  const { t } = useTranslation();
  return (
    <EmptyState
      testId="no-categories"
      icon={<SlidersHorizontal className="h-6 w-6" />}
      title={t('empty.noCategoriesTitle')}
      description={t('empty.noCategoriesBody')}
      actions={<Link href="/settings" className="btn-primary">{t('empty.chooseTopics')}</Link>}
    />
  );
}
