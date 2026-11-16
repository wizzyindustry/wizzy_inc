'use client';

import { useTranslations } from 'next-intl';

// One continuous line forming the W (viewBox 0 0 100 100).
const W_PATH = 'M10 22 L30 80 L50 36 L70 80 L90 22';

/**
 * Brand loading animation: a big "W" drawn in the primary colour. Shown only while a page is
 * still loading (see app/[locale]/loading.tsx) — never as a forced splash screen.
 */
export function LoadingW() {
  const t = useTranslations('Loading');
  return (
    <div
      role="status"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="size-28 sm:size-36">
        {/* Faint track, so the shape of the W is visible from the start. */}
        <path
          d={W_PATH}
          pathLength={1}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-muted"
        />
        <path
          d={W_PATH}
          pathLength={1}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="loading-w-stroke stroke-primary"
        />
      </svg>
      <span className="sr-only">{t('label')}</span>
    </div>
  );
}
