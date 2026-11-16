'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingW } from './LoadingW';

const SHOW_AFTER_MS = 250; // fast page changes never flash the animation
const GIVE_UP_MS = 20_000; // never cover the page forever (e.g. connection lost)

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

/**
 * Shows the big "W" over the page while the next page is loading (slow connections). Pages
 * are prepared in advance, so Next.js's own loading screen rarely appears; this covers the
 * gap between tapping a link and the new page arriving. It hides as soon as the address
 * changes, because it only belongs to the page it was started on.
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const [loadingFrom, setLoadingFrom] = useState<string | null>(null);

  useEffect(() => {
    let show: ReturnType<typeof setTimeout> | undefined;
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    const onClick = (event: MouseEvent) => {
      if (!internalPageClick(event, pathname)) return;
      clearTimeout(show);
      clearTimeout(giveUp);
      show = setTimeout(() => setLoadingFrom(pathname), SHOW_AFTER_MS);
      giveUp = setTimeout(() => setLoadingFrom(null), GIVE_UP_MS);
    };
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      clearTimeout(show); // the page changed before the delay: no animation
      clearTimeout(giveUp);
      setLoadingFrom(null); // arrived: never reappear when coming back to this page
    };
  }, [pathname]);

  if (loadingFrom !== pathname) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <LoadingW />
    </div>
  );
}
