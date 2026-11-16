import type { ReactNode } from 'react';

/*
 * Simple line icons for social networks, drawn in the same style as the lucide icons used
 * everywhere else (24×24, 2px stroke, round ends). Lucide 1.x no longer ships brand logos,
 * and these avoid adding an icon package. They are decorative: links carry their own label.
 */

export const SOCIAL_NETWORKS = [
  'website',
  'linkedin',
  'x',
  'instagram',
  'facebook',
  'tiktok',
  'youtube',
  'pinterest',
  'behance',
  'dribbble',
  'github',
] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number] | 'email';

const PATHS: Record<SocialNetwork, ReactNode> = {
  email: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  x: (
    <>
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </>
  ),
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  tiktok: <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5" />,
  youtube: (
    <>
      <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M11 13l-2 8" />
      <path d="M9.5 14.5c3.5 1 6.5-.5 6.5-4a4 4 0 0 0-8 0c0 1 .3 1.8.8 2.3" />
    </>
  ),
  behance: (
    <>
      <path d="M2 6h5a3 3 0 0 1 0 6H2z" />
      <path d="M2 12h6a3 3 0 0 1 0 6H2z" />
      <path d="M14 14.5h8a4 4 0 1 0-1.2 2.9" />
      <path d="M15 7h5" />
    </>
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
      <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
      <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </>
  ),
  github: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
};

export function SocialIcon({
  network,
  className = 'size-5',
}: {
  network: SocialNetwork;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[network]}
    </svg>
  );
}
