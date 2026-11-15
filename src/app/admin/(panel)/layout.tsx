import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminSession } from '@/components/admin/AdminSession';
import { SignOutButton } from '@/components/admin/SignOutButton';

/** Every admin page except /admin/login: nothing renders until the admin check passes. */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('Admin');
  return (
    <AdminSession>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="font-display font-bold">{t('title')}</p>
            <AdminNav />
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </AdminSession>
  );
}
