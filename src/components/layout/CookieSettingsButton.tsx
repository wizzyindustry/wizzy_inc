'use client';

import { useTranslations } from 'next-intl';
import { CONSENT_REOPEN } from '@/lib/cookies/consent';

/** Footer link that reopens the cookie banner to change the choice. */
export function CookieSettingsButton() {
  const t = useTranslations('CookieBanner');
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_REOPEN))}
      className="underline-offset-4 hover:text-primary hover:underline"
    >
      {t('settings')}
    </button>
  );
}
