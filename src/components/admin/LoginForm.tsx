'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FirebaseError } from 'firebase/app';
import { describedBy, FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';
import {
  signInWithEmail,
  signInWithGoogle,
  signOutAdmin,
  userIsAdmin,
} from '@/lib/firebase/client-auth';
import type { UserCredential } from 'firebase/auth';
import { useHydrated } from '@/lib/utils/use-hydrated';

/** Firebase error codes -> message keys (never show raw Firebase errors). */
function errorKey(error: unknown): string {
  if (!(error instanceof FirebaseError)) return 'generic';
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'invalidCredentials';
    case 'auth/too-many-requests':
      return 'tooManyAttempts';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'popupClosed';
    case 'auth/network-request-failed':
      return 'network';
    default:
      return 'generic';
  }
}

/** Admin sign-in (A1): email/password or Google. Only accounts with the admin claim get in. */
export function LoginForm() {
  const t = useTranslations('Admin.login');
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  // Uncontrolled (read on submit): text typed before the page finished loading is kept.
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') === 'notAdmin' ? 'notAdmin' : null,
  );

  async function finish(signIn: () => Promise<UserCredential>) {
    setBusy(true);
    setError(null);
    try {
      const { user } = await signIn();
      if (!(await userIsAdmin(user))) {
        await signOutAdmin();
        setError('notAdmin');
        return;
      }
      router.replace('/admin');
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const email = emailRef.current?.value.trim() ?? '';
    const password = passwordRef.current?.value ?? '';
    void finish(() => signInWithEmail(email, password));
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p role="alert" className="rounded-md border border-danger p-3 text-danger">
          {t(`errors.${error}`)}
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormField id="email" label={t('email')}>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            ref={emailRef}
            className={fieldClass}
            aria-describedby={describedBy('email')}
          />
        </FormField>
        <FormField id="password" label={t('password')}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            ref={passwordRef}
            className={fieldClass}
          />
        </FormField>
        {/* Disabled until React is ready, so the form never submits natively. */}
        <Button type="submit" disabled={busy || !hydrated}>
          {busy ? t('signingIn') : t('submit')}
        </Button>
      </form>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t('or')}
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={busy || !hydrated}
        onClick={() => void finish(signInWithGoogle)}
      >
        {t('google')}
      </Button>
    </div>
  );
}
