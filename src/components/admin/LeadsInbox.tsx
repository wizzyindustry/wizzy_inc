'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';
import { adminDbClient } from '@/lib/firebase/client-db';
import type { Lead, LeadKind, LeadStatus } from '@/lib/schemas/lead';
import { LEAD_PIPELINE, leadMatches, parseLeadDoc } from '@/lib/schemas/lead-admin';
import { formatDateTime } from './lead-format';
import { StatusBadge } from './StatusBadge';

const PAGE_SIZE = 50;

type Props = { serviceTitles: Record<string, string> };

/**
 * Leads inbox (A2): newest first, live updates, filters by status and type, and search.
 * Reads with the admin's own sign-in; Firestore rules allow this only for admins.
 */
export function LeadsInbox({ serviceTitles }: Props) {
  const t = useTranslations('Admin.leads');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [max, setMax] = useState(PAGE_SIZE);
  const [loadError, setLoadError] = useState(false);
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [kind, setKind] = useState<LeadKind | ''>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(adminDbClient(), 'leads'), orderBy('createdAt', 'desc'), limit(max));
    return onSnapshot(
      q,
      (snap) => {
        setLoadError(false);
        setHasMore(snap.size === max);
        setLeads(
          snap.docs.flatMap((doc) => {
            const lead = parseLeadDoc(doc.id, doc.data());
            if (!lead) console.warn(`[admin] lead ${doc.id} has an unexpected shape`);
            return lead ? [lead] : [];
          }),
        );
      },
      () => setLoadError(true),
    );
  }, [max]);

  const visible = useMemo(
    () =>
      (leads ?? []).filter(
        (lead) =>
          (!status || lead.status === status) &&
          (!kind || lead.kind === kind) &&
          leadMatches(lead, search),
      ),
    [leads, status, kind, search],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('filters.search')}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('filters.status')}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus | '')}
            className={fieldClass}
          >
            <option value="">{t('filters.allStatuses')}</option>
            {LEAD_PIPELINE.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('filters.kind')}
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as LeadKind | '')}
            className={fieldClass}
          >
            <option value="">{t('filters.allKinds')}</option>
            <option value="quote">{t('kind.quote')}</option>
            <option value="contact">{t('kind.contact')}</option>
          </select>
        </label>
      </div>

      {loadError && (
        <p role="alert" className="rounded-md border border-danger p-3 text-danger">
          {t('loadError')}
        </p>
      )}

      {leads === null && !loadError ? (
        <p role="status" className="text-muted-foreground">
          {t('loading')}
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-md bg-background p-6 text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3" aria-label={t('listLabel')}>
          {visible.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="flex flex-col gap-2 rounded-lg bg-background p-4 shadow-sm hover:ring-2 hover:ring-primary focus-visible:outline-2 focus-visible:outline-ring sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm">{lead.ref}</span>
                    <StatusBadge status={lead.status} />
                    <span className="text-xs text-muted-foreground">{t(`kind.${lead.kind}`)}</span>
                  </p>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.serviceSlug
                      ? (serviceTitles[lead.serviceSlug] ?? lead.serviceSlug)
                      : t('noService')}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{formatDateTime(lead.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <Button
          type="button"
          variant="outline"
          className="self-center"
          onClick={() => setMax((m) => m + PAGE_SIZE)}
        >
          {t('loadMore')}
        </Button>
      )}
    </div>
  );
}
