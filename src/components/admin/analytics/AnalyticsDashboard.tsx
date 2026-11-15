'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { collection, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
import { computeLeadStats, windowStart } from '@/lib/analytics/lead-stats';
import { adminDbClient } from '@/lib/firebase/client-db';
import type { Lead } from '@/lib/schemas/lead';
import { parseLeadDoc } from '@/lib/schemas/lead-admin';
import { BarList } from './BarList';
import { MonthColumns } from './MonthColumns';
import { StatTile } from './StatTile';

const MONTHS = 12;

type Props = { serviceTitles: Record<string, string> };

/**
 * Basic analytics (A7) for the last 12 months: headline numbers, leads per month, and
 * breakdowns by service, type and status. Reads leads with the admin's own sign-in
 * (Firestore rules allow this for admins only); updates live.
 */
export function AnalyticsDashboard({ serviceTitles }: Props) {
  const t = useTranslations('Admin.analytics');
  const tLeads = useTranslations('Admin.leads');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState(false);
  const [now] = useState(() => new Date());

  useEffect(() => {
    const q = query(
      collection(adminDbClient(), 'leads'),
      where('createdAt', '>=', Timestamp.fromDate(windowStart(now, MONTHS))),
    );
    return onSnapshot(
      q,
      (snap) => {
        setError(false);
        setLeads(snap.docs.flatMap((d) => parseLeadDoc(d.id, d.data()) ?? []));
      },
      () => setError(true),
    );
  }, [now]);

  const stats = useMemo(() => (leads ? computeLeadStats(leads, now, MONTHS) : null), [leads, now]);

  if (error) {
    return (
      <p role="alert" className="rounded-md border border-danger p-3 text-danger">
        {t('loadError')}
      </p>
    );
  }
  if (!stats) {
    return (
      <p role="status" className="text-muted-foreground">
        {t('loading')}
      </p>
    );
  }

  const thisMonth = stats.perMonth.at(-1)?.count ?? 0;
  const conversion = stats.conversion === null ? '—' : `${Math.round(stats.conversion * 100)}%`;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t('period')}</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={t('tiles.total')} value={String(stats.total)} />
        <StatTile label={t('tiles.thisMonth')} value={String(thisMonth)} />
        <StatTile label={t('tiles.won')} value={String(stats.won)} />
        <StatTile
          label={t('tiles.conversion')}
          value={conversion}
          note={t('tiles.conversionNote')}
        />
      </div>

      <MonthColumns title={t('charts.perMonth')} months={stats.perMonth} />

      <div className="grid gap-4 lg:grid-cols-3">
        <BarList
          title={t('charts.byService')}
          emptyText={t('empty')}
          rows={stats.byService.map((s) => ({
            label: serviceTitles[s.key] ?? s.key,
            count: s.count,
          }))}
        />
        <BarList
          title={t('charts.byKind')}
          emptyText={t('empty')}
          rows={stats.byKind.map((k) => ({ label: tLeads(`kind.${k.key}`), count: k.count }))}
        />
        <BarList
          title={t('charts.byStatus')}
          emptyText={t('empty')}
          rows={stats.byStatus.map((s) => ({ label: tLeads(`status.${s.key}`), count: s.count }))}
        />
      </div>
    </div>
  );
}
