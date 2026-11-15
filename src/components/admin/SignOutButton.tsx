'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { signOutAdmin } from '@/lib/firebase/client-auth';

/** Signing out triggers AdminSession, which sends the user to /admin/login. */
export function SignOutButton() {
  const t = useTranslations('Admin');
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void signOutAdmin()}>
      {t('signOut')}
    </Button>
  );
}
