import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/admin/LoginForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.login');
  return { title: t('heading') };
}

/** Admin sign-in (A1). No sign-up: accounts get admin rights only via `pnpm admin:claim`. */
export default async function AdminLoginPage() {
  const t = await getTranslations('Admin.login');
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
      <div className="rounded-lg bg-background p-6 shadow-sm">
        <h1 className="mb-6 font-display text-2xl font-bold">{t('heading')}</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
