'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { submitQuote } from '@/app/[locale]/quote/actions';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';
import { useRouter } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import {
  ALLOWED_ATTACHMENT_TYPES,
  attachmentError,
  BUDGET_RANGES,
  MAX_ATTACHMENTS,
} from '@/lib/schemas/quote-constants';
import type { QuoteData, QuoteInput } from '@/lib/schemas/quote-input';
import { HONEYPOT_FIELD } from '@/lib/security/honeypot';
import { describedBy, FormField } from '../FormField';

/** Load the validation code on demand so it isn't part of the first page load. */
const loadValidation = () =>
  Promise.all([import('@hookform/resolvers/zod'), import('@/lib/schemas/quote-input')]);

/**
 * Same Zod schema as the server, loaded lazily (performance budget). It is prefetched
 * right after the form mounts, so it is normally ready before the first "Next" click.
 */
const lazyZodResolver: Resolver<QuoteInput, unknown, QuoteData> = async (
  values,
  context,
  options,
) => {
  const [{ zodResolver }, { quoteInputSchema }] = await loadValidation();
  return zodResolver(quoteInputSchema)(values, context, options);
};

export type ServiceOption = { slug: string; title: string; category: string };
export type PackageOption = { id: string; label: string; category: string };
type FieldName = keyof QuoteInput;

const STEPS: { id: string; fields: FieldName[] }[] = [
  { id: 'service', fields: ['serviceSlug', 'packageId'] },
  { id: 'details', fields: ['description'] },
  { id: 'budget', fields: ['budgetRange', 'deadline'] },
  { id: 'contact', fields: ['name', 'phone', 'email', 'preferredContact'] },
];

type Props = {
  locale: Locale;
  today: string; // YYYY-MM-DD in Tanzania, for the deadline picker
  services: ServiceOption[];
  packages: PackageOption[];
  categoryLabels: Record<string, string>;
  initial: { serviceSlug?: string; packageId?: string };
};

/** Multi-step quote request form (F6). Same Zod schema as the server (validate twice). */
export function QuoteForm({ locale, today, services, packages, categoryLabels, initial }: Props) {
  const t = useTranslations('QuoteForm');
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<QuoteInput, unknown, QuoteData>({
    resolver: lazyZodResolver,
    mode: 'onTouched',
    defaultValues: {
      serviceSlug: initial.serviceSlug ?? '',
      packageId: initial.packageId ?? '',
      description: '',
      budgetRange: '',
      deadline: '',
      name: '',
      phone: '',
      email: '',
      preferredContact: 'whatsapp',
      locale,
    },
  });

  const serviceSlug = watch('serviceSlug');
  const packageId = watch('packageId');
  const packageCategory = packages.find((p) => p.id === packageId)?.category;
  const serviceCategory = services.find((s) => s.slug === serviceSlug)?.category;

  // ADR 0001: a chosen package limits services to its category.
  const visibleServices = useMemo(
    () => (packageCategory ? services.filter((s) => s.category === packageCategory) : services),
    [services, packageCategory],
  );
  const visiblePackages = serviceCategory
    ? packages.filter((p) => p.category === serviceCategory)
    : packages;

  useEffect(() => {
    if (!serviceSlug && visibleServices.length === 1 && visibleServices[0]) {
      setValue('serviceSlug', visibleServices[0].slug);
    }
  }, [serviceSlug, visibleServices, setValue]);

  useEffect(() => {
    if (packageCategory && serviceCategory && packageCategory !== serviceCategory) {
      setValue('packageId', '');
    }
  }, [packageCategory, serviceCategory, setValue]);

  useEffect(() => {
    void loadValidation();
  }, []);

  // Move focus to the step heading so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const err = (field: string) => {
    const key = (errors as Record<string, { message?: string } | undefined>)[field]?.message;
    return key ? errorText(key) : undefined;
  };
  function errorText(key: string): string {
    return t.has(`errors.${key}`) ? t(`errors.${key}`) : t('errors.invalid');
  }

  async function next() {
    const current = STEPS[step];
    if (!current) return;
    const valid = await trigger(current.fields);
    if (step === 1 && fileError) return;
    if (valid) setStep((s) => s + 1);
  }

  function onFilesChosen(chosen: FileList | null) {
    const combined = [...files, ...Array.from(chosen ?? [])];
    const problem = attachmentError(combined);
    setFileError(problem ? errorText(problem) : null);
    if (!problem) setFiles(combined);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(values)) {
        if (value !== undefined && value !== '') formData.append(key, String(value));
      }
      files.forEach((file) => formData.append('attachments', file));
      formData.append(HONEYPOT_FIELD, honeypotRef.current?.value ?? '');
      const { getAppCheckToken } = await import('@/lib/firebase/client');
      const token = await getAppCheckToken();
      if (token) formData.append('appCheckToken', token);

      const result = await submitQuote(formData);
      if (result.ok) {
        router.push(
          result.data.ref
            ? { pathname: '/quote/success', query: { ref: result.data.ref } }
            : '/quote/success',
        );
        return;
      }
      if (result.fieldErrors) {
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          if (field === 'attachments') setFileError(errorText(key));
          else setError(field as FieldName, { message: key });
        }
        const firstField = Object.keys(result.fieldErrors)[0];
        const target =
          firstField === 'attachments'
            ? 1
            : STEPS.findIndex((s) => s.fields.includes(firstField as FieldName));
        if (target >= 0) setStep(target);
      }
      setFormError(errorText(result.error));
    } catch {
      setFormError(t('errors.network'));
    } finally {
      setSubmitting(false);
    }
  });

  const currentStep = STEPS[step]?.id ?? 'service';
  const isLast = step === STEPS.length - 1;
  const optional = t('optional');

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <ol className="flex gap-2" aria-label={t('progressLabel')}>
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === step ? 'step' : undefined}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-border'}`}
          >
            <span className="sr-only">{t(`steps.${s.id}`)}</span>
          </li>
        ))}
      </ol>
      <div>
        <p className="text-sm text-muted-foreground">
          {t('stepOf', { current: step + 1, total: STEPS.length })}
        </p>
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold focus:outline-none">
          {t(`steps.${currentStep}`)}
        </h2>
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-danger p-3 text-danger">
          {formError}
        </p>
      )}

      {/* Step 1 — service and package */}
      <div hidden={currentStep !== 'service'} className="flex flex-col gap-5">
        <FormField id="serviceSlug" label={t('fields.service')} error={err('serviceSlug')}>
          <select
            id="serviceSlug"
            className={fieldClass}
            aria-invalid={!!errors.serviceSlug}
            aria-describedby={describedBy('serviceSlug', undefined, err('serviceSlug'))}
            {...register('serviceSlug')}
          >
            <option value="">{t('fields.chooseService')}</option>
            {Object.entries(categoryLabels).map(([category, label]) => {
              const options = visibleServices.filter((s) => s.category === category);
              if (options.length === 0) return null;
              return (
                <optgroup key={category} label={label}>
                  {options.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </FormField>
        <FormField
          id="packageId"
          label={t('fields.package')}
          optionalLabel={optional}
          error={err('packageId')}
        >
          <select
            id="packageId"
            className={fieldClass}
            aria-invalid={!!errors.packageId}
            aria-describedby={describedBy('packageId', undefined, err('packageId'))}
            {...register('packageId')}
          >
            <option value="">{t('fields.noPackage')}</option>
            {visiblePackages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Step 2 — project details and attachments */}
      <div hidden={currentStep !== 'details'} className="flex flex-col gap-5">
        <FormField
          id="description"
          label={t('fields.description')}
          hint={t('fields.descriptionHint')}
          error={err('description')}
        >
          <textarea
            id="description"
            rows={6}
            className={fieldClass}
            aria-invalid={!!errors.description}
            aria-describedby={describedBy(
              'description',
              t('fields.descriptionHint'),
              err('description'),
            )}
            {...register('description')}
          />
        </FormField>
        <FormField
          id="attachments"
          label={t('fields.attachments')}
          optionalLabel={optional}
          hint={t('fields.attachmentsHint', { max: MAX_ATTACHMENTS })}
          error={fileError ?? undefined}
        >
          <input
            id="attachments"
            type="file"
            multiple
            accept={ALLOWED_ATTACHMENT_TYPES.join(',')}
            disabled={files.length >= MAX_ATTACHMENTS}
            className={fieldClass}
            aria-invalid={!!fileError}
            aria-describedby={describedBy(
              'attachments',
              t('fields.attachmentsHint', { max: MAX_ATTACHMENTS }),
              fileError ?? undefined,
            )}
            onChange={(e) => {
              onFilesChosen(e.target.files);
              e.target.value = '';
            }}
          />
        </FormField>
        {files.length > 0 && (
          <ul className="flex flex-col gap-2 text-sm">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2">
                <span className="truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles(files.filter((_, j) => j !== i));
                    setFileError(null);
                  }}
                >
                  {t('removeFile', { name: file.name })}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Step 3 — budget and deadline */}
      <div hidden={currentStep !== 'budget'} className="flex flex-col gap-5">
        <FormField
          id="budgetRange"
          label={t('fields.budget')}
          optionalLabel={optional}
          error={err('budgetRange')}
        >
          <select id="budgetRange" className={fieldClass} {...register('budgetRange')}>
            <option value="">{t('budget.notSure')}</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {t(`budget.${range.id}`)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          id="deadline"
          label={t('fields.deadline')}
          optionalLabel={optional}
          error={err('deadline')}
        >
          <input
            id="deadline"
            type="date"
            min={today}
            className={fieldClass}
            aria-invalid={!!errors.deadline}
            aria-describedby={describedBy('deadline', undefined, err('deadline'))}
            {...register('deadline')}
          />
        </FormField>
      </div>

      {/* Step 4 — contact details */}
      <div hidden={currentStep !== 'contact'} className="flex flex-col gap-5">
        <FormField id="name" label={t('fields.name')} error={err('name')}>
          <input
            id="name"
            autoComplete="name"
            className={fieldClass}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy('name', undefined, err('name'))}
            {...register('name')}
          />
        </FormField>
        <FormField
          id="phone"
          label={t('fields.phone')}
          hint={t('fields.phoneHint')}
          error={err('phone')}
        >
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={fieldClass}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy('phone', t('fields.phoneHint'), err('phone'))}
            {...register('phone')}
          />
        </FormField>
        <FormField
          id="email"
          label={t('fields.email')}
          optionalLabel={optional}
          error={err('email')}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy('email', undefined, err('email'))}
            {...register('email')}
          />
        </FormField>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-medium">{t('fields.preferredContact')}</legend>
          {(['whatsapp', 'phone', 'email'] as const).map((method) => (
            <label key={method} className="flex items-center gap-2">
              <input
                type="radio"
                value={method}
                className="size-4"
                {...register('preferredContact')}
              />
              {t(`contactMethods.${method}`)}
            </label>
          ))}
        </fieldset>
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{t('privacy')}</p>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Website</label>
        <input
          ref={honeypotRef}
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            {t('back')}
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button type="submit" disabled={submitting}>
            {submitting ? t('sending') : t('submit')}
          </Button>
        ) : (
          <Button type="button" onClick={next}>
            {t('next')}
          </Button>
        )}
      </div>
    </form>
  );
}
