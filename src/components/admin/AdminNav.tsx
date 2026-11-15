'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const ITEMS = [
  { href: '/admin', key: 'dashboard' },
  { href: '/admin/leads', key: 'leads' },
] as const;

export function AdminNav() {
  const t = useTranslations('Admin.nav');
  const pathname = usePathname();
  return (
    <nav aria-label={t('label')}>
      <ul className="flex gap-4 text-sm">
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
