import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { getSiteSettings } from '@/lib/data/settings';
import { toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';
import { buildWhatsAppLink, resolveWhatsAppNumber } from '@/lib/utils/whatsapp';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string | string[] }>;
};

const REF_PATTERN = /^WZ-\d{4}-\d{4,}$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'QuoteSuccess' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

/** Confirmation after a quote request (FR-4): reference number + WhatsApp follow-up. */
export default async function QuoteSuccessPage({ params, searchParams }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('QuoteSuccess');
  const raw = (await searchParams).ref;
  const ref = typeof raw === 'string' && REF_PATTERN.test(raw) ? raw : null;

  const settings = await getSiteSettings();
  const whatsapp = resolveWhatsAppNumber(
    settings?.whatsappNumber,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );
  const message = ref ? t('whatsappMessageWithRef', { ref }) : t('whatsappMessage');

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 px-4 py-16">
      <CheckCircle2 aria-hidden="true" className="size-12 text-success" />
      <h1 className="font-display text-3xl font-bold">{t('title')}</h1>
      <p className="text-lg">{t('body')}</p>

      {ref && (
        <div className="w-full rounded-lg border border-border bg-muted p-5">
          <p className="text-sm text-muted-foreground">{t('refLabel')}</p>
          <p className="font-mono text-2xl font-bold tracking-wide">{ref}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('refHint')}</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {whatsapp && (
          <Button asChild>
            <a
              href={buildWhatsAppLink(whatsapp, message)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('whatsappButton')}
            </a>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </div>
  );
}
