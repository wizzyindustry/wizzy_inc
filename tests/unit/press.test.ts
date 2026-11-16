import { describe, expect, it } from 'vitest';
import { CONTENT_FIELDS } from '@/components/admin/content/fields';
import { toFormValues, toSaveData } from '@/components/admin/content/form-values';
import { pressInputSchema } from '@/lib/schemas/content-admin';
import { hexToRgb } from '@/lib/utils/color';

describe('press page', () => {
  it('works out RGB from a HEX colour', () => {
    expect(hexToRgb('#1D4ED8')).toBe('rgb(29, 78, 216)');
    expect(hexToRgb('#ffffff')).toBe('rgb(255, 255, 255)');
  });

  it('accepts only #RRGGBB colours and stores them in capitals', () => {
    const ok = pressInputSchema.parse({ colors: [{ name: 'Blue', hex: '#1d4ed8' }] });
    expect(ok.colors[0]?.hex).toBe('#1D4ED8');
    expect(pressInputSchema.safeParse({ colors: [{ name: 'Blue', hex: 'blue' }] }).success).toBe(
      false,
    );
  });

  it('media files must be in site/press (PDF allowed) and links must be web links', () => {
    const doc = { title: { en: 'Licence', sw: '' }, kind: 'document' };
    expect(
      pressInputSchema.safeParse({ media: [{ ...doc, file: 'site/press/licence.pdf' }] }).success,
    ).toBe(true);
    expect(
      pressInputSchema.safeParse({ media: [{ ...doc, file: 'quotes/lead/brief.pdf' }] }).success,
    ).toBe(false);
    const person = { name: 'A', role: { en: 'CEO', sw: '' } };
    expect(
      pressInputSchema.safeParse({ leaders: [{ ...person, pinterest: 'javascript:alert(1)' }] })
        .success,
    ).toBe(false);
  });

  it('leaves out empty social links when saving', () => {
    const fields = CONTENT_FIELDS.press;
    const values = toFormValues(fields, {
      leaders: [{ name: 'A', role: { en: 'CEO', sw: '' }, linkedin: 'https://example.com/a' }],
    });
    const saved = toSaveData(fields, values) as { leaders: Record<string, unknown>[] };
    expect(saved.leaders[0]).toEqual({
      name: 'A',
      role: { en: 'CEO', sw: '' },
      linkedin: 'https://example.com/a',
    });
    expect(pressInputSchema.safeParse(saved).success).toBe(true);
  });
});
