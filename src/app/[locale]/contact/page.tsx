import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/forms/ContactForm';
import { Button } from '@/components/ui/Button';
import { getSiteSettings } from '@/lib/data/settings';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { formatPhone } from '@/lib/utils/format-phone';
import { buildWhatsAppLink, resolveWhatsAppNumber } from '@/lib/utils/whatsapp';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Contact.meta' });
  return pageMetadata({
    locale,
    path: '/contact',
    title: t('title'),
    description: t('description'),
  });
}

/**
 * Contact (F9): form, WhatsApp, phone, email, location, working hours and social links.
 * Contact details come from `settings/site` (owner content), never hard-coded.
 */
export default async function ContactPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Contact');
  const tWhatsApp = await getTranslations('WhatsApp');
  const messages = await getMessages();
  const settings = await getSiteSettings();
  const whatsappNumber = resolveWhatsAppNumber(
    settings?.whatsappNumber,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );
  const socials = Object.entries(settings?.socialLinks ?? {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="form-heading">
          <h2 id="form-heading" className="mb-6 font-display text-2xl font-bold">
            {t('formHeading')}
          </h2>
          <NextIntlClientProvider messages={{ ContactForm: messages.ContactForm }}>
            <ContactForm locale={locale} whatsappNumber={whatsappNumber} />
          </NextIntlClientProvider>
        </section>

        <section aria-labelledby="details-heading" className="flex flex-col gap-6">
          <h2 id="details-heading" className="font-display text-2xl font-bold">
            {t('detailsHeading')}
          </h2>

          {whatsappNumber && (
            <Button asChild variant="accent" className="self-start">
              <a
                href={buildWhatsAppLink(whatsappNumber, tWhatsApp('prefilledMessage'))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden="true" className="size-5" />
                {t('whatsappButton')}
              </a>
            </Button>
          )}

          {settings ? (
            <address className="flex flex-col gap-4 not-italic">
              <p className="flex items-start gap-3">
                <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="sr-only">{t('phone')}: </span>
                  <a href={`tel:${settings.phone}`} className="hover:text-primary">
                    {formatPhone(settings.phone)}
                  </a>
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="sr-only">{t('email')}: </span>
                  <a href={`mailto:${settings.email}`} className="break-all hover:text-primary">
                    {settings.email}
                  </a>
                </span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="sr-only">{t('location')}: </span>
                  {localized(settings.location, locale)}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="sr-only">{t('workingHours')}: </span>
                  {localized(settings.workingHours, locale)}
                </span>
              </p>
              {socials.length > 0 && (
                <div>
                  <p className="font-semibold">{t('social')}</p>
                  <ul className="mt-2 flex flex-wrap gap-3">
                    {socials.map(([network, url]) => (
                      <li key={network}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="capitalize hover:text-primary"
                        >
                          {network}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </address>
          ) : (
            <p className="rounded-md bg-muted p-4 text-sm">{t('detailsMissing')}</p>
          )}
        </section>
      </div>
    </div>
  );
}
