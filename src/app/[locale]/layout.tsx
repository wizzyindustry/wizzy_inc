import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { NavigationLoader } from '@/components/layout/NavigationLoader';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { getSiteSettings } from '@/lib/data/settings';
import { routing } from '@/lib/i18n/routing';
import { resolveWhatsAppNumber } from '@/lib/utils/whatsapp';
import '@/styles/globals.css';

// ISR fallback: refresh at least hourly; admin saves trigger /api/revalidate sooner.
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations('Layout');
  // Only ship the namespaces client components use, to keep public-page JS small.
  const { Nav, LanguageSwitcher, Loading } = await getMessages();
  const clientMessages = { Nav, LanguageSwitcher, Loading };
  const settings = await getSiteSettings();
  const whatsappNumber = resolveWhatsAppNumber(
    settings?.whatsappNumber,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={clientMessages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2"
          >
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer settings={settings} />
          <NavigationLoader />
          {whatsappNumber && <WhatsAppButton number={whatsappNumber} />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
