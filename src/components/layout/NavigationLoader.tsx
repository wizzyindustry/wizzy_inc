'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoadingW } from './LoadingW';

const MIN_VISIBLE_MS = 600; // owner's choice: the W always shows for a moment
const FADE_MS = 200; // matches the overlay's opacity transition
const GIVE_UP_MS = 15_000; // never cover the page forever (e.g. connection lost)

/** True for a plain left click on a link to another page of this site. */
function internalPageClick(event: MouseEvent, currentPath: string): boolean {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const link = (event.target as Element | null)?.closest?.('a');
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) {
    return false;
  }
  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin && url.pathname !== currentPath;
}

type Loader = { from: string; since: number; leaving: boolean };

/**
 * Shows the big "W" over the page on every page change: from the click until the new page
 * has arrived, and at least MIN_VISIBLE_MS, then fades out.
 */
export function NavigationLoader() {
  const t = useTranslations('Loading');
  const pathname = usePathname();
  const [loader, setLoader] = useState<Loader | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (internalPageClick(event, pathname)) {
        setLoader({ from: pathname, since: Date.now(), leaving: false });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname]);

  // Arrived (address changed) or waited too long: fade out, then remove.
  useEffect(() => {
    if (!loader) return;
    if (loader.leaving) {
      const done = setTimeout(() => setLoader(null), FADE_MS);
      return () => clearTimeout(done);
    }
    const leave = () => setLoader((l) => (l ? { ...l, leaving: true } : l));
    const waited = Date.now() - loader.since;
    const wait = loader.from !== pathname ? Math.max(0, MIN_VISIBLE_MS - waited) : GIVE_UP_MS;
    const timer = setTimeout(leave, wait);
    return () => clearTimeout(timer);
  }, [loader, pathname]);

  if (!loader) return null;
  return (
    <div
      className={`loading-overlay fixed inset-0 z-40 flex items-center justify-center bg-background transition-opacity duration-200 ${loader.leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <LoadingW label={t('label')} />
    </div>
  );
}
