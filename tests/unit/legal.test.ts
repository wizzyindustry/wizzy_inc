import { describe, expect, it } from 'vitest';
import { LEGAL_DRAFT_DATE, LEGAL_DRAFTS } from '@/lib/legal/drafts';
import { legalInputSchema } from '@/lib/schemas/content-admin';
import { LEGAL_PAGES } from '@/lib/schemas/content';
import { STATIC_PATHS } from '@/lib/seo/sitemap';

describe('legal pages', () => {
  it('drafts are valid and clearly marked as drafts', () => {
    const parsed = legalInputSchema.parse({ ...LEGAL_DRAFTS, lastUpdated: LEGAL_DRAFT_DATE });
    for (const page of LEGAL_PAGES) {
      expect(parsed[page].en).toContain('DRAFT – review before launch');
      expect(parsed[page].en).toMatch(/\[TODO|Cookie/); // owner decisions are left open
    }
  });

  it('privacy draft names the Tanzanian law and the services that handle data', () => {
    const text = LEGAL_DRAFTS.privacy.en;
    for (const words of ['Personal Data Protection Act, 2022', 'Firebase', 'Resend', 'PDPC']) {
      expect(text).toContain(words);
    }
  });

  it('cookie draft lists the cookies the site really sets', () => {
    expect(LEGAL_DRAFTS.cookies.en).toContain('NEXT_LOCALE');
    expect(LEGAL_DRAFTS.cookies.en).toContain('wz_cookie_consent');
  });

  it('every legal page is in the sitemap', () => {
    for (const page of LEGAL_PAGES) expect(STATIC_PATHS).toContain(`/${page}`);
  });

  it('needs a real date', () => {
    expect(legalInputSchema.safeParse({ ...LEGAL_DRAFTS, lastUpdated: '16/11/2026' }).success).toBe(
      false,
    );
  });
});
