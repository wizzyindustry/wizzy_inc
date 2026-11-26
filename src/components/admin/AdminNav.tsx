'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  Building2,
  Briefcase,
  FileText,
  FolderGit2,
  Images,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Mail,
  Newspaper,
  MessageSquareQuote,
  Package,
  Pin,
  Scale,
  Settings,
  Tags,
  type LucideIcon,
} from 'lucide-react';

type Item = { href: string; key: string; icon: LucideIcon };

/** Sidebar menu, grouped: day-to-day work, website content, site-wide settings. */
const GROUPS: { key: string; items: Item[] }[] = [
  {
    key: 'work',
    items: [
      { href: '/admin', key: 'dashboard', icon: LayoutDashboard },
      { href: '/admin/leads', key: 'leads', icon: Inbox },
      { href: '/admin/analytics', key: 'analytics', icon: BarChart3 },
      { href: '/admin/subscribers', key: 'subscribers', icon: Mail },
    ],
  },
  {
    key: 'content',
    items: [
      { href: '/admin/content/services', key: 'services', icon: Briefcase },
      { href: '/admin/content/packages', key: 'packages', icon: Package },
      { href: '/admin/content/portfolio', key: 'portfolio', icon: Images },
      { href: '/admin/categories', key: 'categories', icon: Tags },
      { href: '/admin/github', key: 'github', icon: FolderGit2 },
      { href: '/admin/pinterest', key: 'pinterest', icon: Pin },
      { href: '/admin/content/testimonials', key: 'testimonials', icon: MessageSquareQuote },
      { href: '/admin/content/posts', key: 'posts', icon: Newspaper },
      { href: '/admin/about', key: 'about', icon: FileText },
      { href: '/admin/company', key: 'company', icon: Building2 },
      { href: '/admin/support', key: 'support', icon: LifeBuoy },
      { href: '/admin/press', key: 'press', icon: Megaphone },
    ],
  },
  {
    key: 'site',
    items: [
      { href: '/admin/settings', key: 'settings', icon: Settings },
      { href: '/admin/legal', key: 'legal', icon: Scale },
    ],
  },
];

export function AdminNav() {
  const t = useTranslations('Admin.nav');
  const pathname = usePathname();
  return (
    <nav aria-label={t('label')} className="flex flex-col gap-6">
      {GROUPS.map((group) => (
        <div key={group.key} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t(`groups.${group.key}`)}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ href, key, icon: Icon }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring ${
                      active
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'hover:bg-muted hover:text-primary'
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {t(key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
