'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const ITEMS = [
  { href: '/admin', key: 'dashboard' },
  { href: '/admin/leads', key: 'leads' },
  { href: '/admin/analytics', key: 'analytics' },
  { href: '/admin/content/services', key: 'services' },
  { href: '/admin/content/packages', key: 'packages' },
  { href: '/admin/content/portfolio', key: 'portfolio' },
  { href: '/admin/content/testimonials', key: 'testimonials' },
  { href: '/admin/settings', key: 'settings' },
] as const;

export function AdminNav() {
  const t = useTranslations('Admin.nav');
  const pathname = usePathname();
  return (
    <nav aria-label={t('label')}>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {ITEMS.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={active ? 'font-semibold text-primary' : 'hover:text-primary'}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
