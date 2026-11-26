'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { deleteContent, saveContent, saveSiteDocument } from '@/app/admin/content/actions';
import { Button } from '@/components/ui/Button';
import { toPlain } from '@/lib/data/to-plain';
import { adminDbClient } from '@/lib/firebase/client-db';
import { BUILT_IN_CATEGORIES } from '@/lib/portfolio/categories';
import { useAdminSession } from '../AdminSession';
import { ContentField, type Option } from './ContentField';
import {
  CONTENT_FIELDS,
  fieldKey,
  fieldTextKey,
  fieldVisible,
  isSingleDoc,
  SINGLE_DOCS,
  type EditorKind,
} from './fields';
import { DEFAULT_DOCS } from './default-docs';
import { getPath, setPath, toFormValues, toSaveData, type Values } from './form-values';
import { missingSwahili } from './translation-status';

type Props = { kind: EditorKind; id: string };

/** Public address of items that have their own page: /en/<base>/<slug>. */
const PUBLIC_BASE = { services: 'services', portfolio: 'portfolio', posts: 'blog' } as const; // id "new" creates an item

const titleOf = (data: Values) =>
  String(getPath(data, 'title.en') ?? getPath(data, 'name.en') ?? getPath(data, 'name') ?? '');

/** Generic editor for content items and the single site documents (settings, About, legal). */
export function ContentEditor({ kind, id }: Props) {
  const t = useTranslations('Admin.content');
  const router = useRouter();
  const { getIdToken } = useAdminSession();
  const fields = CONTENT_FIELDS[kind];
  // Settings, About and legal pages are single documents in `settings/…`, never deleted.
  const single = isSingleDoc(kind) ? SINGLE_DOCS[kind] : null;
  const isSettings = single !== null;
  const isNew = id === 'new';

  // New items get their Firestore id up front, so images can be uploaded before saving.
  const docId = useMemo(
    () => (isNew ? doc(collection(adminDbClient(), kind)).id : id),
    [isNew, kind, id],
  );
  const [values, setValues] = useState<Values | null>(null);
  const [missing, setMissing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false); // a new item that has been saved once
  const unsaved = isNew && !created;
  const [serviceOptions, setServiceOptions] = useState<Option[]>([]);
  const [portfolioOptions, setPortfolioOptions] = useState<Option[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);

  useEffect(() => {
    let active = true;
    const db = adminDbClient();
    (async () => {
      const path = single ? doc(db, 'settings', single.id) : doc(db, kind, docId);
      const snap = isNew ? null : await getDoc(path);
      if (!active) return;
      if (snap && !snap.exists() && !isSettings) {
        setMissing(true);
        return;
      }
      // Never saved yet: start from built-in defaults where there are some (legal drafts).
      const stored = snap?.exists() ? (toPlain(snap.data()) as Values) : null;
      setValues(toFormValues(fields, stored ?? DEFAULT_DOCS[kind] ?? null));

      const needs = new Set(fields.map((f) => f.type));
      const options = async (
        name: string,
        label: (d: Values) => string,
        value: (id: string, d: Values) => string,
      ) =>
        (await getDocs(collection(db, name))).docs.map((d) => ({
          value: value(d.id, d.data()),
          label: label(d.data()) || d.id,
        }));
      if (needs.has('services')) {
        const list = await options('services', titleOf, (_id, d) => String(d.slug));
        if (active) setServiceOptions(list);
      }
      if (needs.has('portfolioRef')) {
        const list = await options('portfolio', titleOf, (docId) => docId);
        if (active) setPortfolioOptions(list);
      }
      if (needs.has('category')) {
        // Admin → Categories; the built-in two until that list has been saved.
        const saved = await getDoc(doc(db, 'settings', 'categories'));
        const items = (saved.data()?.items as { slug: string; name: { en: string } }[] | undefined)
          ?.length
          ? (saved.data()!.items as { slug: string; name: { en: string } }[])
          : BUILT_IN_CATEGORIES;
        const list = items.map((c) => ({ value: c.slug, label: c.name.en || c.slug }));
        if (!active) return;
        setCategoryOptions(list);
        // New project: preselect the first category.
        setValues((current) =>
          current && !current.category && list[0]
            ? { ...current, category: list[0].value }
            : current,
        );
      }
    })().catch(() => active && setMessage({ kind: 'error', text: t('errors.load') }));
    return () => {
      active = false;
    };
  }, [docId, fields, isNew, isSettings, kind, single, t]);

  const errorFor = (path: string) => {
    const hit = Object.entries(errors).find(([p]) => p === path || p.startsWith(`${path}.`));
    return hit ? t(`errors.${hit[1]}`) : undefined;
  };

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!values) return;
    setBusy(true);
    setMessage(null);
    setErrors({});
    try {
      const token = await getIdToken();
      const data = toSaveData(fields, values);
      const result = isSingleDoc(kind)
        ? await saveSiteDocument(token, { id: SINGLE_DOCS[kind].id, data })
        : await saveContent(token, { collection: kind, id: docId, data });
      if (result.ok) {
        setMessage({ kind: 'ok', text: t('saved') });
        if (unsaved) {
          // Update the address without reloading the editor (keeps the "Saved" message).
          window.history.replaceState(null, '', `/admin/content/${kind}/${docId}`);
          setCreated(true);
        }
      } else {
        setErrors(result.fieldErrors ?? {});
        setMessage({
          kind: 'error',
          text: t.has(`errors.${result.error}`) ? t(`errors.${result.error}`) : t('errors.server'),
        });
      }
    } catch {
      setMessage({ kind: 'error', text: t('errors.network') });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(t('confirmDelete'))) return;
    setBusy(true);
    try {
      const result = await deleteContent(await getIdToken(), { collection: kind, id: docId });
      if (result.ok) {
        router.replace(`/admin/content/${kind}`);
        return;
      }
      setMessage({ kind: 'error', text: t('errors.server') });
    } catch {
      setMessage({ kind: 'error', text: t('errors.network') });
    } finally {
      setBusy(false);
    }
  }

  if (missing) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p>{t('notFound')}</p>
        <Link href={`/admin/content/${kind}`} className="text-primary underline">
          {t('backToList')}
        </Link>
      </div>
    );
  }
  if (!values) {
    return (
      <p role="status" className="text-muted-foreground">
        {message?.text ?? t('loading')}
      </p>
    );
  }

  const slug = getPath(values, 'slug');
  const publicPath = single
    ? single.publicPath
    : !unsaved && typeof slug === 'string' && slug && kind in PUBLIC_BASE
      ? `/en/${PUBLIC_BASE[kind as keyof typeof PUBLIC_BASE]}/${slug}`
      : null;

  // Live as the owner types: which bilingual fields still have English only.
  const missingSw = missingSwahili(fields, toSaveData(fields, values));

  return (
    <form onSubmit={onSave} noValidate className="flex flex-col gap-6">
      {!isSettings && (
        <Link
          href={`/admin/content/${kind}`}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          ← {t('backToList')}
        </Link>
      )}
      <h1 className="font-display text-2xl font-bold">
        {isSettings
          ? t(single.heading)
          : unsaved
            ? t(`new.${kind}`)
            : titleOf(values) || t(`edit.${kind}`)}
      </h1>

      {missingSw.length > 0 && (
        <div className="rounded-md border border-accent bg-background p-3 text-sm">
          <p className="font-semibold">{t('swNotice')}</p>
          <p className="text-muted-foreground">
            {missingSw
              .map((path) => {
                const field = fields.find((f) => f.path === path);
                return t(`fields.${field ? fieldTextKey(field) : fieldKey(path)}`);
              })
              .join(' · ')}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 rounded-lg bg-background p-5">
        {fields
          .filter((field) => fieldVisible(field, values))
          .map((field) => (
            <ContentField
              key={field.path}
              field={field}
              value={getPath(values, field.path)}
              error={errorFor(field.path)}
              itemId={docId}
              serviceOptions={serviceOptions}
              portfolioOptions={portfolioOptions}
              categoryOptions={categoryOptions}
              formValues={values}
              errorFor={errorFor}
              onChange={(v) => setValues((current) => setPath(current ?? {}, field.path, v))}
            />
          ))}
      </div>

      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`rounded-md border p-3 ${message.kind === 'error' ? 'border-danger text-danger' : 'border-success text-success'}`}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? t('saving') : t('save')}
        </Button>
        {publicPath && (
          <Button asChild variant="outline">
            <a href={publicPath} target="_blank" rel="noopener noreferrer">
              {t('viewOnSite')}
            </a>
          </Button>
        )}
        {!isSettings && !unsaved && (
          <Button type="button" variant="ghost" disabled={busy} onClick={() => void onDelete()}>
            {t('delete')}
          </Button>
        )}
      </div>
    </form>
  );
}
