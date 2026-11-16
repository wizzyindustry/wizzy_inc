import { getTranslations } from 'next-intl/server';
import {
  Building2,
  Code,
  LifeBuoy,
  MapPin,
  Megaphone,
  Newspaper,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';
import { NavDropdown } from './NavDropdown';
import { COMPANY_ITEMS, NAV_ITEMS, type ServiceMenuLink } from './nav-items';

const CATEGORIES = [
  { id: 'graphic-design', Icon: Palette },
  { id: 'web-development', Icon: Code },
] as const;

const COMPANY_ICONS: Record<(typeof COMPANY_ITEMS)[number]['key'], LucideIcon> = {
  about: Building2,
  blog: Newspaper,
  support: LifeBuoy,
  offices: MapPin,
  press: Megaphone,
};

const linkClass = 'text-sm font-medium text-foreground hover:text-primary';

/** Site header: Services and Company dropdowns on wide screens, a menu button on phones. */
export async function Header({ services }: { services: ServiceMenuLink[] }) {
  const t = await getTranslations('Nav');
  const tCat = await getTranslations('Categories');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="font-display text-lg font-bold text-foreground">
          {t('brand')}
        </Link>

        <nav aria-label={t('mainNav')} className="hidden md:block">
          <ul className="flex items-center gap-6">
            <NavDropdown label={t('services')} wide>
              <div className="grid gap-6 sm:grid-cols-2">
                {CATEGORIES.map(({ id, Icon }) => {
                  const items = services.filter((s) => s.category === id);
                  return (
                    <div key={id}>
                      <Link
                        href={`/services#${id}`}
                        className="flex items-center gap-2 font-semibold hover:text-primary"
                      >
                        <Icon aria-hidden="true" className="size-5 text-primary" />
                        {tCat(`${id}.title`)}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tCat(`${id}.description`)}
                      </p>
                      {items.length > 0 && (
                        <ul className="mt-3 grid gap-1">
                          {items.map((s) => (
                            <li key={s.href}>
                              <Link
                                href={s.href}
                                className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted hover:text-primary"
                              >
                                {s.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-sm font-medium">
                <Link href="/services" className="text-primary hover:underline">
                  {t('allServices')}
                </Link>
                <Link href="/pricing" className="text-primary hover:underline">
                  {t('seePrices')}
                </Link>
              </div>
            </NavDropdown>
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <NavDropdown label={t('company')}>
              <ul className="grid gap-1">
                {COMPANY_ITEMS.map((item) => {
                  const Icon = COMPANY_ICONS[item.key];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 rounded-md p-2 hover:bg-muted"
                      >
                        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span>
                          <span className="block text-sm font-semibold">{t(item.key)}</span>
                          <span className="block text-xs text-muted-foreground">
                            {t(`descriptions.${item.key}`)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </NavDropdown>
            {NAV_ITEMS.slice(2).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
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
          <MobileNav services={services} />
        </div>
      </div>
    </header>
  );
}
