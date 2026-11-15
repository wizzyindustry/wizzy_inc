import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '@/styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin');
  return {
    title: { template: `%s | ${t('title')}`, default: t('title') },
    robots: { index: false, follow: false }, // private: never in search results
  };
}

/**
 * Root layout for the admin panel (separate from the public [locale] layout).
 * The admin UI is in English for now; strings still live in messages/*.json.
 */
export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const { Admin } = await getMessages();
  return (
    <html lang="en">
      <body className="min-h-dvh bg-muted text-foreground antialiased">
        <NextIntlClientProvider messages={{ Admin }}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
