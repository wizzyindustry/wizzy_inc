'use client';

import { useTranslations } from 'next-intl';
import type { LeadStatus } from '@/lib/schemas/lead';
import { STATUS_CLASSES } from './lead-format';

export function StatusBadge({ status }: { status: LeadStatus }) {
  const t = useTranslations('Admin.leads.status');
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {t(status)}
    </span>
  );
}
