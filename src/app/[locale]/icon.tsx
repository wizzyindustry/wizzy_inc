import { ImageResponse } from 'next/og';
import { OG_COLORS } from '@/lib/seo/og-colors';

/** Placeholder favicon: "W" monogram in the primary colour. TODO: real content (brand logo). */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        background: OG_COLORS.primary,
        color: OG_COLORS.primaryForeground,
        fontSize: 24,
        fontWeight: 700,
      }}
    >
      W
    </div>,
    size,
  );
}
