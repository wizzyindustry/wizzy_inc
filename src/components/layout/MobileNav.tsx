'use client';

import { useEffect, useId, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { NAV_ITEMS } from './nav-items';

/** Collapsible menu for small screens. Closes after navigation or on Escape. */
export function MobileNav() {
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
        className="absolute inset-x-0 top-full border-b border-border bg-background shadow-md"
      >
        <ul className="flex flex-col px-4 py-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className="block py-3 text-base font-medium text-foreground hover:text-primary"
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
