'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';
import {
  CONSENT_CHANGED,
  CONSENT_REOPEN,
  readConsent,
  saveConsent,
  type Consent,
} from '@/lib/cookies/consent';

const subscribe = (onChange: () => void) => {
  window.addEventListener(CONSENT_CHANGED, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED, onChange);
};
const NOT_IN_BROWSER = 'server'; // pages are pre-rendered: decide only in the browser

/**
 * Cookie consent banner: shown until the visitor chooses, and again from "Cookie settings"
 * in the footer. Both choices are equally easy. It does not block the page.
 */
export function CookieBanner() {
  const t = useTranslations('CookieBanner');
  const consent = useSyncExternalStore(subscribe, readConsent, () => NOT_IN_BROWSER);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(CONSENT_REOPEN, open);
    return () => window.removeEventListener(CONSENT_REOPEN, open);
  }, []);

  if (consent === NOT_IN_BROWSER || (consent !== null && !reopened)) return null;

  const choose = (choice: Consent) => {
    saveConsent(choice);
    setReopened(false);
  };

  return (
    <section
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md sm:rounded-lg sm:border"
    >
      <h2 className="font-semibold">{t('heading')}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('text')}{' '}
        <Link href="/cookies" className="text-primary underline underline-offset-4">
          {t('policyLink')}
        </Link>
      </p>
      {consent && <p className="mt-2 text-sm">{t(`current.${consent}`)}</p>}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="sm:flex-1" onClick={() => choose('all')}>
          {t('acceptAll')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="sm:flex-1"
          onClick={() => choose('essential')}
        >
          {t('essentialOnly')}
        </Button>
      </div>
    </section>
  );
}
