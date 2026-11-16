'use client';

import { useEffect, useId, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { COMPANY_ITEMS, NAV_ITEMS, SECONDARY_NAV_ITEMS, type ServiceMenuLink } from './nav-items';

const linkClass = 'block py-2.5 text-base font-medium text-foreground hover:text-primary';

/**
 * Collapsible menu for small screens: Services (with each service) and Company as groups,
 * then the other pages. Closes after navigation or on Escape.
 */
export function MobileNav({ services }: { services: ServiceMenuLink[] }) {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const item = (href: string, label: string, nested = false) => (
    <li key={href}>
      <Link
        href={href}
        aria-current={pathname === href ? 'page' : undefined}
        className={nested ? `${linkClass} pl-3 text-sm font-normal` : linkClass}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? t('closeMenu') : t('openMenu')}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      <nav
        id={menuId}
        aria-label={t('mainNav')}
        hidden={!open}
        className="dropdown-enter absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background shadow-md"
      >
        <div className="flex flex-col gap-2 px-4 py-3">
          <section aria-labelledby={`${menuId}-services`}>
            <p
              id={`${menuId}-services`}
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {t('services')}
            </p>
            <ul>
              {item('/services', t('allServices'))}
              {services.map((s) => item(s.href, s.title, true))}
            </ul>
          </section>
          <section aria-labelledby={`${menuId}-company`} className="border-t border-border pt-2">
            <p
              id={`${menuId}-company`}
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {t('company')}
            </p>
            <ul>{COMPANY_ITEMS.map((link) => item(link.href, t(link.key)))}</ul>
          </section>
          <ul className="border-t border-border pt-2">
            {[...NAV_ITEMS, ...SECONDARY_NAV_ITEMS].map((link) => item(link.href, t(link.key)))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
