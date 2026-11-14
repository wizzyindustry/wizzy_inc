import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';
import { NAV_ITEMS } from './nav-items';

export async function Header() {
  const t = await getTranslations('Nav');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="font-display text-lg font-bold text-foreground">
          {t('brand')}
        </Link>

        <nav aria-label={t('mainNav')} className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <Button asChild size="sm">
            <Link href="/quote">
              <span className="sm:hidden">{t('requestQuoteShort')}</span>
              <span className="hidden sm:inline">{t('requestQuote')}</span>
            </Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
