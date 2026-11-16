'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { subscribe } from '@/app/[locale]/newsletter-actions';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';
import { Link } from '@/lib/i18n/navigation';
import { HONEYPOT_FIELD } from '@/lib/security/honeypot';

type Props = {
  source: 'home' | 'footer';
  /** Heading level and look: a card on the home page, compact in the footer. */
  variant?: 'card' | 'compact';
};

/**
 * "Stay updated": email + Subscribe button. The address is checked on the server (same
 * protections as the other forms); a welcome email with an unsubscribe link follows.
 */
export function SubscribeForm({ source, variant = 'card' }: Props) {
  const t = useTranslations('Subscribe');
  const locale = useLocale();
  const id = useId();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorText = (key: string) =>
    t.has(`errors.${key}`) ? t(`errors.${key}`) : t('errors.server');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('locale', locale);
      formData.append('source', source);
      formData.append(HONEYPOT_FIELD, honeypotRef.current?.value ?? '');
      const { getAppCheckToken } = await import('@/lib/firebase/client');
      const token = await getAppCheckToken();
      if (token) formData.append('appCheckToken', token);
      const result = await subscribe(formData);
      if (result.ok) {
        setDone(true);
        return;
      }
      setError(errorText(result.fieldErrors?.email ?? result.error));
    } catch {
      setError(t('errors.network'));
    } finally {
      setBusy(false);
    }
  }

  const compact = variant === 'compact';
  const headingId = `${id}-heading`;
  const errorId = `${id}-error`;
  const Heading = compact ? 'p' : 'h3';

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={`relative ${compact ? 'flex flex-col gap-2' : 'flex flex-col gap-3 rounded-lg bg-background p-6'}`}
    >
      <Heading
        id={headingId}
        className={
          compact ? 'text-sm font-semibold' : 'flex items-center gap-2 text-lg font-semibold'
        }
      >
        {!compact && <Mail aria-hidden="true" className="size-5 text-primary" />}
        {t('heading')}
      </Heading>
      {done ? (
        <p role="status" className="flex items-start gap-2 text-sm text-success">
          <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
          {t('success')}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
          {!compact && <p className="text-sm text-muted-foreground">{t('intro')}</p>}
          <label htmlFor={`${id}-email`} className="sr-only">
            {t('emailLabel')}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder={t('placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`${fieldClass} min-w-0 flex-1`}
            />
            <Button type="submit" disabled={busy} size={compact ? 'sm' : 'md'}>
              {busy ? t('sending') : t('button')}
            </Button>
          </div>
          {/* Honeypot: hidden from people and screen readers. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={`${id}-${HONEYPOT_FIELD}`}>Website</label>
            <input
              ref={honeypotRef}
              id={`${id}-${HONEYPOT_FIELD}`}
              name={HONEYPOT_FIELD}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>
          {error && (
            <p id={errorId} role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {t.rich('consent', {
              link: (chunks) => (
                <Link href="/privacy" className="underline underline-offset-2 hover:text-primary">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </form>
      )}
    </div>
  );
}
