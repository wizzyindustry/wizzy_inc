'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';

/** EN ⇄ SW switch (F10). The choice is remembered for a year in the NEXT_LOCALE cookie (routing.ts). */
export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')}>
      <ul className="flex items-center rounded-md border border-border text-sm">
        {routing.locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? 'true' : undefined}
                title={t(locale)}
                className={cn(
                  'inline-flex h-9 min-w-9 items-center justify-center px-2 font-medium uppercase',
                  active ? 'bg-foreground text-background' : 'text-foreground hover:bg-muted',
                )}
              >
                {locale}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
