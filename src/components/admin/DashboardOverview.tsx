'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Briefcase, FileText, Images, MessageSquareQuote, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { windowStart } from '@/lib/analytics/lead-stats';
import { adminDbClient } from '@/lib/firebase/client-db';
import { CONTENT_COLLECTIONS, type ContentCollection } from '@/lib/schemas/content-admin';
import type { Lead } from '@/lib/schemas/lead';
import { parseLeadDoc } from '@/lib/schemas/lead-admin';
import { StatTile } from './analytics/StatTile';
import { CONTENT_FIELDS } from './content/fields';
import { missingSwahili } from './content/translation-status';
import { formatDateTime } from './lead-format';
import { StatusBadge } from './StatusBadge';

const RECENT = 5;
const OPEN_STATUSES = ['new', 'contacted', 'quoted'];

type ContentSummary = { total: number; published: number; missingSw: number };
type Props = { serviceTitles: Record<string, string> };

const parseLeads = (docs: QueryDocumentSnapshot[]) =>
  docs.flatMap((d) => parseLeadDoc(d.id, d.data()) ?? []);

/**
 * Admin home: what needs attention right now (live), the latest leads, shortcuts to the
 * common jobs, and a summary of the website content. Reads with the admin's own sign-in
 * (Firestore rules allow this for admins only).
 */
export function DashboardOverview({ serviceTitles }: Props) {
  const t = useTranslations('Admin.dashboard');
  const tLeads = useTranslations('Admin.leads');
  const tNav = useTranslations('Admin.nav');
  const [now] = useState(() => new Date());
  const [openLeads, setOpenLeads] = useState<Lead[] | null>(null);
  const [thisMonth, setThisMonth] = useState<number | null>(null);
  const [recent, setRecent] = useState<Lead[] | null>(null);
  const [content, setContent] = useState<Partial<Record<ContentCollection, ContentSummary>>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    const db = adminDbClient();
    const leads = collection(db, 'leads');
    const onError = () => setError(true);
    const stops = [
      onSnapshot(
        query(leads, where('status', 'in', OPEN_STATUSES)),
        (snap) => setOpenLeads(parseLeads(snap.docs)),
        onError,
      ),
      onSnapshot(
        query(leads, where('createdAt', '>=', Timestamp.fromDate(windowStart(now, 1)))),
        (snap) => setThisMonth(snap.size),
        onError,
      ),
      onSnapshot(
        query(leads, orderBy('createdAt', 'desc'), limit(RECENT)),
        (snap) => setRecent(parseLeads(snap.docs)),
        onError,
      ),
      ...CONTENT_COLLECTIONS.map((name) =>
        onSnapshot(
          collection(db, name),
          (snap) =>
            setContent((current) => ({
              ...current,
              [name]: {
                total: snap.size,
                published: snap.docs.filter((d) => d.data().published === true).length,
                missingSw: snap.docs.filter(
                  (d) => missingSwahili(CONTENT_FIELDS[name], d.data()).length > 0,
                ).length,
              },
            })),
          onError,
        ),
      ),
    ];
    return () => stops.forEach((stop) => stop());
  }, [now]);

  const show = (n: number | null | undefined) => (n == null ? '…' : String(n));
  const newCount = openLeads?.filter((l) => l.status === 'new').length;
  const inProgress = openLeads?.filter((l) => l.status !== 'new').length;

  const actions = [
    { href: '/admin/content/services/new', label: t('actions.addService'), icon: Briefcase },
    { href: '/admin/content/portfolio/new', label: t('actions.addPortfolio'), icon: Images },
    {
      href: '/admin/content/testimonials/new',
      label: t('actions.addTestimonial'),
      icon: MessageSquareQuote,
    },
    { href: '/admin/about', label: t('actions.editAbout'), icon: FileText },
    { href: '/admin/settings', label: t('actions.editSettings'), icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p role="alert" className="rounded-md border border-danger p-3 text-danger">
          {t('loadError')}
        </p>
      )}

      <section aria-labelledby="attention-heading" className="flex flex-col gap-3">
        <h2 id="attention-heading" className="font-display text-xl font-bold">
          {t('attention')}
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatTile label={t('tiles.new')} value={show(newCount)} note={t('tiles.newNote')} />
          <StatTile label={t('tiles.inProgress')} value={show(inProgress)} />
          <StatTile label={t('tiles.thisMonth')} value={show(thisMonth)} />
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="recent-heading" className="font-display text-xl font-bold">
            {t('recent')}
          </h2>
          <Button asChild size="sm">
            <Link href="/admin/leads">{t('openLeads')}</Link>
          </Button>
        </div>
        {recent === null ? (
          <p role="status" className="text-muted-foreground">
            {t('loading')}
          </p>
        ) : recent.length === 0 ? (
          <p className="rounded-md bg-background p-6 text-muted-foreground">{t('noLeads')}</p>
        ) : (
          <ul
            aria-label={t('recent')}
            className="divide-y divide-border rounded-lg bg-background shadow-sm"
          >
            {recent.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="flex flex-col gap-1 p-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={lead.status} />
                    <span className="font-semibold">{lead.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {lead.serviceSlug
                        ? (serviceTitles[lead.serviceSlug] ?? lead.serviceSlug)
                        : tLeads(`kind.${lead.kind}`)}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(lead.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="actions-heading" className="flex flex-col gap-3">
        <h2 id="actions-heading" className="font-display text-xl font-bold">
          {t('quickActions')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex min-h-14 items-center gap-3 rounded-lg bg-background p-4 shadow-sm hover:ring-2 hover:ring-primary focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="content-heading" className="flex flex-col gap-3">
        <h2 id="content-heading" className="font-display text-xl font-bold">
          {t('content')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONTENT_COLLECTIONS.map((name) => {
            const summary = content[name];
            return (
              <li key={name}>
                <Link
                  href={`/admin/content/${name}`}
                  className="flex h-full flex-col gap-1 rounded-lg bg-background p-4 shadow-sm hover:ring-2 hover:ring-primary focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="font-semibold">{tNav(name)}</span>
                  <span className="text-sm text-muted-foreground">
                    {summary
                      ? t('contentCounts', { total: summary.total, published: summary.published })
                      : t('loading')}
                  </span>
                  {summary && summary.missingSw > 0 && (
                    <span className="text-sm font-medium">
                      {t('contentMissingSw', { count: summary.missingSw })}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
