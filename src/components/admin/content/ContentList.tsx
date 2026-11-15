'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { collection, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { adminDbClient } from '@/lib/firebase/client-db';
import type { ContentCollection } from '@/lib/schemas/content-admin';
import { CONTENT_FIELDS } from './fields';
import { missingSwahili } from './translation-status';

type Row = {
  id: string;
  title: string;
  detail: string;
  published: boolean;
  order: number;
  missingSw: number; // bilingual fields with English but no Swahili
};

function toRow(kind: ContentCollection, id: string, d: Record<string, unknown>): Row {
  const en = (v: unknown) => String((v as { en?: string } | undefined)?.en ?? '');
  const title =
    kind === 'testimonials' ? String(d.name ?? '') : en(kind === 'packages' ? d.name : d.title);
  const detail =
    kind === 'packages'
      ? `${String(d.category)} · ${String(d.tier)}`
      : kind === 'testimonials'
        ? String(d.role ?? '')
        : String(d.slug ?? '');
  return {
    id,
    title: title || id,
    detail,
    published: d.published === true,
    order: typeof d.order === 'number' ? d.order : 0,
    missingSw: missingSwahili(CONTENT_FIELDS[kind], d).length,
  };
}

/** List of one content type with publish state; links to the editor (A4–A6). */
export function ContentList({ kind }: { kind: ContentCollection }) {
  const t = useTranslations('Admin.content');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(
    () =>
      onSnapshot(
        collection(adminDbClient(), kind),
        (snap) =>
          setRows(
            snap.docs
              .map((d) => toRow(kind, d.id, d.data()))
              .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
          ),
        () => setError(true),
      ),
    [kind],
  );

  return (
    <div className="flex flex-col gap-4">
      <Button asChild className="self-start">
        <Link href={`/admin/content/${kind}/new`}>{t(`new.${kind}`)}</Link>
      </Button>
      {error && (
        <p role="alert" className="rounded-md border border-danger p-3 text-danger">
          {t('errors.load')}
        </p>
      )}
      {rows && rows.some((r) => r.missingSw > 0) && (
        <p className="text-sm text-muted-foreground">
          {t('swSummary', {
            count: rows.filter((r) => r.missingSw > 0).length,
            total: rows.length,
          })}
        </p>
      )}
      {rows === null && !error ? (
        <p role="status" className="text-muted-foreground">
          {t('loading')}
        </p>
      ) : rows?.length === 0 ? (
        <p className="rounded-md bg-background p-6 text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows?.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/content/${kind}/${row.id}`}
                className="flex items-center justify-between gap-4 rounded-lg bg-background p-4 shadow-sm hover:ring-2 hover:ring-primary"
              >
                <span className="flex flex-col">
                  <span className="font-semibold">{row.title}</span>
                  <span className="text-sm text-muted-foreground">{row.detail}</span>
                </span>
                <span className="flex flex-wrap items-center justify-end gap-2">
                  {row.missingSw > 0 && (
                    <span className="rounded-full border border-accent px-2.5 py-0.5 text-xs font-semibold text-accent">
                      {t('swMissing')}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.published ? 'bg-success text-primary-foreground' : 'border border-border bg-muted text-muted-foreground'}`}
                  >
                    {row.published ? t('published') : t('hidden')}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
