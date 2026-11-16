'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Download } from 'lucide-react';
import { removeSubscriber } from '@/app/admin/subscribers/actions';
import { Button } from '@/components/ui/Button';
import { toPlain } from '@/lib/data/to-plain';
import { adminDbClient } from '@/lib/firebase/client-db';
import { subscriberSchema, type Subscriber } from '@/lib/schemas/subscriber';
import { useAdminSession } from './AdminSession';
import { subscribersCsv } from '@/lib/utils/csv';
import { formatDateTime } from './lead-format';

/**
 * Newsletter subscribers (live list): who signed up, in which language, from where.
 * Download as CSV for any email tool; remove someone who asks to be taken off.
 */
export function SubscribersList() {
  const t = useTranslations('Admin.subscribers');
  const { getIdToken } = useAdminSession();
  const [rows, setRows] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(adminDbClient(), 'subscribers'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const list: Subscriber[] = [];
        for (const d of snap.docs) {
          const parsed = subscriberSchema.safeParse({
            ...(toPlain(d.data()) as Record<string, unknown>),
            id: d.id,
          });
          if (parsed.success) list.push(parsed.data);
        }
        setRows(list);
      },
      () => setError(t('loadError')),
    );
  }, [t]);

  function download() {
    if (!rows) return;
    const blob = new Blob([subscribersCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function remove(row: Subscriber) {
    if (!window.confirm(t('confirmRemove', { email: row.email }))) return;
    setBusyId(row.id);
    setError(null);
    try {
      const result = await removeSubscriber(await getIdToken(), { id: row.id });
      if (!result.ok) setError(t('removeError'));
    } catch {
      setError(t('removeError'));
    } finally {
      setBusyId(null);
    }
  }

  if (error && !rows)
    return (
      <p role="alert" className="text-danger">
        {error}
      </p>
    );
  if (!rows) return <p role="status">{t('loading')}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">{t('count', { count: rows.length })}</p>
        <Button type="button" variant="outline" onClick={download} disabled={rows.length === 0}>
          <Download aria-hidden="true" className="size-4" />
          {t('download')}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="rounded-md bg-background p-4">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-background">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{t('caption')}</caption>
            <thead className="border-b border-border">
              <tr>
                <th scope="col" className="p-3">
                  {t('columns.email')}
                </th>
                <th scope="col" className="p-3">
                  {t('columns.language')}
                </th>
                <th scope="col" className="p-3">
                  {t('columns.source')}
                </th>
                <th scope="col" className="p-3">
                  {t('columns.date')}
                </th>
                <th scope="col" className="p-3">
                  <span className="sr-only">{t('columns.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="p-3 break-all">{row.email}</td>
                  <td className="p-3">{row.locale.toUpperCase()}</td>
                  <td className="p-3">{t(`sources.${row.source}`)}</td>
                  <td className="p-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                  <td className="p-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busyId === row.id}
                      onClick={() => void remove(row)}
                      aria-label={t('remove', { email: row.email })}
                    >
                      {t('removeShort')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
