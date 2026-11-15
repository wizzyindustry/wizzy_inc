import { getLocale, getTranslations } from 'next-intl/server';
import { localized } from '@/lib/i18n/localized';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { SiteSettings } from '@/lib/schemas/content';
import { formatPhone } from '@/lib/utils/format-phone';
import { ALL_NAV_ITEMS } from './nav-items';

/** Contact details come from Firestore `settings/site`; nothing is shown until the owner sets them. */
export async function Footer({ settings }: { settings: SiteSettings | null }) {
  const t = await getTranslations('Footer');
  const tNav = await getTranslations('Nav');
  const locale = (await getLocale()) as Locale;
  const socials = Object.entries(settings?.socialLinks ?? {});

  return (
    <footer className="mt-16 border-t border-border bg-muted">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">{tNav('brand')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('tagline')}</p>
        </div>

        <nav aria-label={t('linksLabel')}>
          <ul className="space-y-2 text-sm">
            {ALL_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-foreground hover:text-primary">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/quote" className="text-foreground hover:text-primary">
                {tNav('requestQuote')}
              </Link>
            </li>
          </ul>
        </nav>

        {settings && (
          <address className="space-y-2 text-sm not-italic">
            <p className="font-semibold">{t('contactHeading')}</p>
            <p>{localized(settings.location, locale)}</p>
            <p>
              <a href={`tel:${settings.phone}`} className="hover:text-primary">
                {formatPhone(settings.phone)}
              </a>
            </p>
            <p>
              <a href={`mailto:${settings.email}`} className="hover:text-primary">
                {settings.email}
              </a>
            </p>
            <p className="text-muted-foreground">{localized(settings.workingHours, locale)}</p>
            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-3 pt-1">
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
            )}
          </address>
        )}
      </div>
      <p className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        {t('copyright', { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}
