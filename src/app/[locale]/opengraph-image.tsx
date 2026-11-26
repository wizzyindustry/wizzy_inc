import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { toLocale } from '@/lib/i18n/metadata';
import { OG_COLORS } from '@/lib/seo/og-colors';
import { SITE_URL } from '@/lib/seo/site-url';

/*
 * Default share image (FR-11) for every public page in a locale, e.g. when a link is sent on
 * WhatsApp. Pages with their own picture (portfolio case studies) set openGraph.images instead.
 * Generated at build time by Next.js (no extra dependency).
 */

export const alt = 'Wizzy Inc';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: string }> };

export default async function OpengraphImage({ params }: Props) {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Seo.ogImage' });

  // ImageResponse only understands inline styles (not Tailwind classes).
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: OG_COLORS.primary,
        color: OG_COLORS.primaryForeground,
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 700 }}>Wizzy Inc</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{t('headline')}</div>
        <div style={{ fontSize: 36, opacity: 0.9 }}>{t('subline')}</div>
      </div>
      {/* The address, so people know where the link goes before they open it. */}
      <div style={{ fontSize: 30, opacity: 0.85 }}>{new URL(SITE_URL).host}</div>
    </div>,
    size,
  );
}
