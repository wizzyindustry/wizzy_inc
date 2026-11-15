'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * False in the server HTML and until React has taken over the page, then true.
 * Use it to keep submit buttons disabled until JavaScript is ready — otherwise a quick
 * tap on a slow phone submits the form natively (page reload, typed data lost or put
 * in the URL).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
