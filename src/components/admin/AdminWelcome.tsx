'use client';

import { useTranslations } from 'next-intl';
import { useAdminSession } from './AdminSession';

/** Shows which account is signed in (email confirmed by the server). */
export function AdminWelcome() {
  const t = useTranslations('Admin.dashboard');
  const { email } = useAdminSession();
  return <p>{t('signedInAs', { email: email ?? '—' })}</p>;
}
