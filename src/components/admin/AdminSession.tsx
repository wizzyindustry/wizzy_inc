'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { verifyAdminSession } from '@/app/admin/actions';
import { adminAuthClient, signOutAdmin, userIsAdmin } from '@/lib/firebase/client-auth';

type AdminSessionValue = {
  email: string | null;
  /** Fresh ID token to pass to admin Server Actions (they re-verify it). */
  getIdToken: () => Promise<string>;
};

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function useAdminSession(): AdminSessionValue {
  const value = useContext(AdminSessionContext);
  if (!value) throw new Error('useAdminSession must be used inside <AdminSession>');
  return value;
}

/**
 * Guard for every admin page except /admin/login. Shows nothing until the user is
 * signed in, has the `admin` claim AND the server has confirmed it. This is convenience
 * only — security rules and server checks are the real protection (ARCHITECTURE §6).
 */
export function AdminSession({ children }: { children: ReactNode }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [session, setSession] = useState<{ user: User; email: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(adminAuthClient(), async (user) => {
      if (!user) {
        setSession(null);
        router.replace('/admin/login');
        return;
      }
      try {
        const admin =
          (await userIsAdmin(user)) && (await verifyAdminSession(await user.getIdToken()));
        if (!active) return;
        if (admin && admin.ok) {
          setSession({ user, email: admin.data.email });
          return;
        }
      } catch {
        // fall through to sign-out
      }
      await signOutAdmin();
      router.replace('/admin/login?error=notAdmin');
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  if (!session) {
    return (
      <p role="status" className="p-8 text-muted-foreground">
        {t('checking')}
      </p>
    );
  }

  const value: AdminSessionValue = {
    email: session.email,
    getIdToken: () => session.user.getIdToken(),
  };
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}
