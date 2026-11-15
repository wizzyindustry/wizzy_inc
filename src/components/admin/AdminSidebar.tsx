'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ExternalLink, Menu, X } from 'lucide-react';
import { AdminNav } from './AdminNav';
import { useAdminSession } from './AdminSession';
import { SignOutButton } from './SignOutButton';

/**
 * Admin sidebar: always visible on wide screens; on phones a "Menu" button opens it.
 * The menu closes by itself after moving to another page (it is open only for the page
 * it was opened on).
 */
export function AdminSidebar() {
  const t = useTranslations('Admin');
  const { email } = useAdminSession();
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <aside className="border-b border-border bg-background lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:py-5">
        <p className="font-display font-bold">{t('title')}</p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="admin-sidebar-menu"
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          {open ? (
            <X aria-hidden="true" className="size-4" />
          ) : (
            <Menu aria-hidden="true" className="size-4" />
          )}
          {t('menu')}
        </button>
      </div>

      <div
        id="admin-sidebar-menu"
        className={`${open ? 'flex' : 'hidden'} flex-1 flex-col justify-between gap-6 overflow-y-auto px-3 pb-4 lg:flex`}
      >
        <AdminNav />
        <div className="flex flex-col gap-3 border-t border-border px-3 pt-4">
          <a
            href="/en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            {t('viewSite')}
          </a>
          {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
          <div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
