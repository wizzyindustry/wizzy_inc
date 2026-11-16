import type { ReactNode } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';
import { buildWhatsAppLink } from '@/lib/utils/whatsapp';

type Props = {
  phone?: string;
  email?: string;
  whatsappNumber?: string | null;
  location?: string;
  workingHours?: string;
  /** "Stay updated" subscribe form, placed beside the contact details. */
  children?: ReactNode;
};

type Channel = { key: string; Icon: LucideIcon; value: string; href?: string; external?: boolean };

/** Home page "Get in touch": every way to reach us, quote and contact buttons. */
export async function GetInTouch({
  phone,
  email,
  whatsappNumber,
  location,
  workingHours,
  children,
}: Props) {
  const t = await getTranslations('HomePage.contact');
  const channels: Channel[] = [];
  if (phone)
    channels.push({
      key: 'phone',
      Icon: Phone,
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
    });
  if (email) channels.push({ key: 'email', Icon: Mail, value: email, href: `mailto:${email}` });
  if (whatsappNumber) {
    channels.push({
      key: 'whatsapp',
      Icon: MessageCircle,
      value: t('whatsappValue'),
      href: buildWhatsAppLink(whatsappNumber, t('whatsappMessage')),
      external: true,
    });
  }
  if (location) channels.push({ key: 'location', Icon: MapPin, value: location });
  if (workingHours) channels.push({ key: 'hours', Icon: Clock, value: workingHours });

  return (
    <section aria-labelledby="contact-heading" className="bg-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div>
            <h2 id="contact-heading" className="font-display text-2xl font-bold sm:text-3xl">
              {t('heading')}
            </h2>
            <p className="mt-2 text-muted-foreground">{t('intro')}</p>
          </div>
          {channels.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {channels.map(({ key, Icon, value, href, external }) => (
                <li key={key} className="flex items-start gap-3 rounded-lg bg-background p-4">
                  <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{t(`channels.${key}`)}</p>
                    {href ? (
                      <a
                        href={href}
                        className="font-medium break-words hover:text-primary"
                        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/quote">{t('quote')}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">{t('message')}</Link>
            </Button>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
