'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { doc, onSnapshot } from 'firebase/firestore';
import { addLeadNote, updateLeadStatus } from '@/app/admin/leads/actions';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';
import { adminDbClient } from '@/lib/firebase/client-db';
import type { Lead, LeadStatus } from '@/lib/schemas/lead';
import { LEAD_PIPELINE, parseLeadDoc } from '@/lib/schemas/lead-admin';
import { useAdminSession } from './AdminSession';
import { formatBudget, formatDate, formatDateTime, formatFileSize } from './lead-format';
import { StatusBadge } from './StatusBadge';

type Props = { leadId: string; serviceTitles: Record<string, string> };

/** One lead (A2, FR-10): details, contact links, attachments, status pipeline and notes. */
export function LeadDetail({ leadId, serviceTitles }: Props) {
  const t = useTranslations('Admin.leads');
  const { getIdToken } = useAdminSession();
  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [note, setNote] = useState('');

  // Live: changes made here (or on another device) show up immediately.
  useEffect(
    () =>
      onSnapshot(
        doc(adminDbClient(), 'leads', leadId),
        (snap) => setLead(snap.exists() ? parseLeadDoc(snap.id, snap.data()) : null),
        () => setLead(null),
      ),
    [leadId],
  );

  const errorText = (key: string) =>
    t.has(`errors.${key}`) ? t(`errors.${key}`) : t('errors.server');

  async function changeStatus(status: LeadStatus) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await updateLeadStatus(await getIdToken(), { leadId, status });
      setMessage(
        result.ok
          ? { kind: 'ok', text: t('statusSaved', { status: t(`status.${status}`) }) }
          : { kind: 'error', text: errorText(result.error) },
      );
    } catch {
      setMessage({ kind: 'error', text: t('errors.network') });
    } finally {
      setBusy(false);
    }
  }

  async function onAddNote(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const result = await addLeadNote(await getIdToken(), { leadId, text: note });
      if (result.ok) {
        setNote('');
        setMessage({ kind: 'ok', text: t('noteSaved') });
      } else {
        setMessage({ kind: 'error', text: errorText(result.fieldErrors?.text ?? result.error) });
      }
    } catch {
      setMessage({ kind: 'error', text: t('errors.network') });
    } finally {
      setBusy(false);
    }
  }

  async function download(index: number, name: string) {
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/attachments/${index}`, {
        headers: { authorization: `Bearer ${await getIdToken()}` },
      });
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ kind: 'error', text: t('errors.download') });
    }
  }

  if (lead === undefined) {
    return (
      <p role="status" className="text-muted-foreground">
        {t('loading')}
      </p>
    );
  }
  if (lead === null) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p>{t('notFound')}</p>
        <Link href="/admin/leads" className="text-primary underline">
          {t('backToInbox')}
        </Link>
      </div>
    );
  }

  const whatsapp = `https://wa.me/${lead.phone.replace(/\D/g, '')}`;
  const budget = formatBudget(lead.budgetRangeTZS);
  const details: [string, string][] = [
    [t('fields.kind'), t(`kind.${lead.kind}`)],
    [t('fields.received'), formatDateTime(lead.createdAt)],
    [t('fields.language'), t(`language.${lead.locale}`)],
    [t('fields.preferredContact'), t(`contactMethod.${lead.preferredContact}`)],
  ];
  if (lead.kind === 'quote') {
    details.push(
      [
        t('fields.service'),
        lead.serviceSlug ? (serviceTitles[lead.serviceSlug] ?? lead.serviceSlug) : '—',
      ],
      [t('fields.package'), lead.packageId ?? '—'],
      [t('fields.budget'), budget ?? t('notSure')],
      [t('fields.deadline'), lead.deadline ? formatDate(lead.deadline) : t('notGiven')],
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/leads"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          ← {t('backToInbox')}
        </Link>
        <h1 className="flex flex-wrap items-center gap-3 font-display text-2xl font-bold">
          <span className="font-mono">{lead.ref}</span>
          <StatusBadge status={lead.status} />
        </h1>
      </div>

      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`rounded-md border p-3 ${message.kind === 'error' ? 'border-danger text-danger' : 'border-success text-success'}`}
        >
          {message.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="client-heading" className="rounded-lg bg-background p-5">
            <h2 id="client-heading" className="mb-3 font-semibold">
              {t('client')}
            </h2>
            <p className="text-lg font-semibold">{lead.name}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              <li>
                <Button asChild size="sm" variant="outline">
                  <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                </Button>
              </li>
              <li>
                <Button asChild size="sm" variant="outline">
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </Button>
              </li>
              {lead.email && (
                <li>
                  <Button asChild size="sm" variant="outline">
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </Button>
                </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="details-heading" className="rounded-lg bg-background p-5">
            <h2 id="details-heading" className="mb-3 font-semibold">
              {t('details')}
            </h2>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
              {details.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-5 mb-2 text-sm text-muted-foreground">
              {lead.kind === 'quote' ? t('fields.description') : t('fields.message')}
            </h3>
            <p className="whitespace-pre-wrap">{lead.description}</p>
          </section>

          {lead.kind === 'quote' && (
            <section aria-labelledby="files-heading" className="rounded-lg bg-background p-5">
              <h2 id="files-heading" className="mb-3 font-semibold">
                {t('attachments')}
              </h2>
              {lead.attachments.length === 0 ? (
                <p className="text-muted-foreground">{t('noAttachments')}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {lead.attachments.map((file, i) => (
                    <li key={file.path} className="flex flex-wrap items-center gap-3">
                      <span className="break-all">
                        {file.name}{' '}
                        <span className="text-sm text-muted-foreground">
                          ({formatFileSize(file.size)})
                        </span>
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void download(i, file.name)}
                      >
                        {t('download')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="status-heading" className="rounded-lg bg-background p-5">
            <h2 id="status-heading" className="mb-3 font-semibold">
              {t('pipeline')}
            </h2>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="status-heading">
              {LEAD_PIPELINE.map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={lead.status === s ? 'primary' : 'outline'}
                  aria-pressed={lead.status === s}
                  disabled={busy || lead.status === s}
                  onClick={() => void changeStatus(s)}
                >
                  {t(`status.${s}`)}
                </Button>
              ))}
            </div>
            <h3 className="mt-5 mb-2 text-sm text-muted-foreground">{t('history')}</h3>
            <ol className="flex flex-col gap-1 text-sm">
              {[...lead.statusHistory].reverse().map((entry, i) => (
                <li key={`${entry.status}-${entry.at.getTime()}-${i}`}>
                  <span className="font-medium">{t(`status.${entry.status}`)}</span>
                  {' · '}
                  <span className="text-muted-foreground">{formatDateTime(entry.at)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="notes-heading" className="rounded-lg bg-background p-5">
            <h2 id="notes-heading" className="mb-3 font-semibold">
              {t('notes')}
            </h2>
            {lead.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noNotes')}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {[...lead.notes].reverse().map((n, i) => (
                  <li key={`${n.at.getTime()}-${i}`} className="rounded-md bg-muted p-3">
                    <p className="whitespace-pre-wrap">{n.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.at)}</p>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={onAddNote} className="mt-4 flex flex-col gap-2">
              <label htmlFor="note" className="text-sm font-medium">
                {t('addNote')}
              </label>
              <textarea
                id="note"
                rows={3}
                maxLength={2000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={fieldClass}
              />
              <Button
                type="submit"
                size="sm"
                disabled={busy || !note.trim()}
                className="self-start"
              >
                {t('saveNote')}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
