'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { submitContact } from '@/app/[locale]/contact/actions';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { ContactData, ContactInput } from '@/lib/schemas/contact-input';
import { HONEYPOT_FIELD } from '@/lib/security/honeypot';
import { useHydrated } from '@/lib/utils/use-hydrated';
import { buildWhatsAppLink } from '@/lib/utils/whatsapp';
import { describedBy, FormField } from './FormField';

/** Validation code is loaded on demand (performance budget), prefetched on mount. */
const loadValidation = () =>
  Promise.all([import('@hookform/resolvers/zod'), import('@/lib/schemas/contact-input')]);

const lazyZodResolver: Resolver<ContactInput, unknown, ContactData> = async (
  values,
  context,
  options,
) => {
  const [{ zodResolver }, { contactInputSchema }] = await loadValidation();
  return zodResolver(contactInputSchema)(values, context, options);
};

type FieldName = keyof ContactInput;
type Props = { locale: Locale; whatsappNumber: string | null };

/** Contact page form (F9). Same Zod schema as the server (validate twice). */
export function ContactForm({ locale, whatsappNumber }: Props) {
  const t = useTranslations('ContactForm');
  const hydrated = useHydrated();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: lazyZodResolver,
    mode: 'onTouched',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      preferredContact: 'whatsapp',
      message: '',
      locale,
    },
  });

  useEffect(() => {
    void loadValidation();
  }, []);

  // Move focus to the confirmation so screen-reader users hear it.
  useEffect(() => {
    if (sentRef !== null) successRef.current?.focus();
  }, [sentRef]);

  function errorText(key: string): string {
    return t.has(`errors.${key}`) ? t(`errors.${key}`) : t('errors.invalid');
  }
  const err = (field: FieldName) => {
    const key = errors[field]?.message;
    return key ? errorText(key) : undefined;
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(values)) {
        if (value !== undefined && value !== '') formData.append(key, String(value));
      }
      formData.append(HONEYPOT_FIELD, honeypotRef.current?.value ?? '');
      const { getAppCheckToken } = await import('@/lib/firebase/client');
      const token = await getAppCheckToken();
      if (token) formData.append('appCheckToken', token);

      const result = await submitContact(formData);
      if (result.ok) {
        reset();
        setSentRef(result.data.ref);
        return;
      }
      for (const [field, key] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as FieldName, { message: key });
      }
      setFormError(errorText(result.error));
    } catch {
      setFormError(t('errors.network'));
    } finally {
      setSubmitting(false);
    }
  });

  if (sentRef !== null) {
    const message = sentRef
      ? t('success.whatsappMessageWithRef', { ref: sentRef })
      : t('success.whatsappMessage');
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-3 rounded-lg border border-border p-6 focus:outline-none"
      >
        <h2 className="text-xl font-semibold">{t('success.title')}</h2>
        <p>{t('success.body')}</p>
        {sentRef && (
          <p>
            {t('success.refLabel')}: <strong className="font-mono">{sentRef}</strong>
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {whatsappNumber && (
            <Button asChild variant="accent">
              <a
                href={buildWhatsAppLink(whatsappNumber, message)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('success.whatsappButton')}
              </a>
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => setSentRef(null)}>
            {t('success.another')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <p role="alert" className="rounded-md border border-danger p-3 text-danger">
          {formError}
        </p>
      )}

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
        optionalLabel={t('optional')}
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

      <FormField id="message" label={t('fields.message')} error={err('message')}>
        <textarea
          id="message"
          rows={5}
          className={fieldClass}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy('message', undefined, err('message'))}
          {...register('message')}
        />
      </FormField>

      <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        {t.rich('privacy', {
          link: (chunks) => (
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>

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

      <Button type="submit" disabled={submitting || !hydrated} className="self-start">
        {submitting ? t('sending') : t('submit')}
      </Button>
    </form>
  );
}
