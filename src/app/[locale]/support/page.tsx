import type { Metadata } from 'next';
import {
  CircleHelp,
  FileImage,
  MessagesSquare,
  MonitorCog,
  PenLine,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GetInTouch } from '@/components/sections/GetInTouch';
import { Button } from '@/components/ui/Button';
import { getSiteSettings } from '@/lib/data/settings';
import { getSupportPage } from '@/lib/data/support';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';
import { resolveWhatsAppNumber } from '@/lib/utils/whatsapp';

const ICONS: LucideIcon[] = [MessagesSquare, PenLine, MonitorCog, FileImage, ReceiptText];
const DEFAULT_TOPICS = ['project', 'changes', 'website', 'files'] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Support.meta' });
  return pageMetadata({
    locale,
    path: '/support',
    title: t('title'),
    description: t('description'),
  });
}

/**
 * Support (Company menu): what we can help with, how to reach us, and the FAQ. Text and
 * topics are edited in Admin → Support page; until then built-in topics are shown.
 */
export default async function SupportPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Support');
  const [support, settings] = await Promise.all([getSupportPage(), getSiteSettings()]);

  const intro = (support?.intro && localized(support.intro, locale)) || t('intro');
  const topics = support?.topics.length
    ? support.topics.map((topic) => ({
        title: localized(topic.title, locale),
        text: localized(topic.text, locale),
      }))
    : DEFAULT_TOPICS.map((key) => ({
        title: t(`defaults.${key}.title`),
        text: t(`defaults.${key}.text`),
      }));
  const text = (value: { en: string; sw: string } | undefined) =>
    value ? localized(value, locale) || undefined : undefined;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
        <p className="mt-3 max-w-2xl text-lg whitespace-pre-line text-muted-foreground">{intro}</p>

        <section aria-labelledby="topics-heading" className="mt-10">
          <h2 id="topics-heading" className="font-display text-2xl font-bold">
            {t('topicsHeading')}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic, i) => {
              const Icon = ICONS[i % ICONS.length]!;
              return (
                <li key={i} className="lift rounded-lg border border-border p-6">
                  <Icon aria-hidden="true" className="size-8 text-primary" />
                  <h3 className="mt-4 font-semibold">{topic.title}</h3>
                  <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
                    {topic.text}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="faq-link-heading"
          className="mt-10 flex flex-col items-start gap-4 rounded-lg bg-muted p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <CircleHelp aria-hidden="true" className="size-6 shrink-0 text-primary" />
            <div>
              <h2 id="faq-link-heading" className="font-semibold">
                {t('faqHeading')}
              </h2>
              <p className="text-sm text-muted-foreground">{t('faqText')}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/faq">{t('faqButton')}</Link>
          </Button>
        </section>
      </div>

      <GetInTouch
        phone={settings?.phone || undefined}
        email={settings?.email || undefined}
        whatsappNumber={resolveWhatsAppNumber(
          settings?.whatsappNumber,
          process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        )}
        location={text(settings?.location)}
        workingHours={text(settings?.workingHours)}
      />
    </>
  );
}
