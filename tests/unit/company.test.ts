import { describe, expect, it } from 'vitest';
import { CONTENT_FIELDS, fieldTextKey } from '@/components/admin/content/fields';
import { toFormValues, toSaveData } from '@/components/admin/content/form-values';
import { missingSwahili } from '@/components/admin/content/translation-status';
import { osmEmbedUrl, osmPageUrl } from '@/lib/maps/openstreetmap';
import { companyInputSchema } from '@/lib/schemas/content-admin';
import { splitNumber } from '@/lib/utils/split-number';
import en from '../../messages/en.json';
import sw from '../../messages/sw.json';

const fields = CONTENT_FIELDS.company;
const office = {
  name: { en: 'Main office', sw: 'Ofisi kuu' },
  address: { en: 'Street 1, Dodoma', sw: 'Mtaa 1, Dodoma' },
  latitude: -6.163,
  longitude: 35.7516,
};

describe('company info editor (list fields)', () => {
  it('round-trips lists of records through the editor values', () => {
    const stored = {
      impact: [{ value: '25+', label: { en: 'Clients', sw: 'Wateja' } }],
      offices: [office],
    };
    const values = toFormValues(fields, stored);
    // Numbers are strings while editing, optional fields blank.
    expect(values.offices).toEqual([
      { ...office, latitude: '-6.163', longitude: '35.7516', hours: { en: '', sw: '' }, phone: '' },
    ]);
    const saved = toSaveData(fields, values);
    expect(saved.offices).toEqual([office]); // empty optional parts dropped, numbers back
    expect(saved.impact).toEqual(stored.impact);
    expect(saved).not.toHaveProperty('foundedYear');
    expect(companyInputSchema.safeParse(saved).success).toBe(true);
  });

  it('rejects impossible map coordinates and partner links that are not web links', () => {
    expect(companyInputSchema.safeParse({ offices: [{ ...office, latitude: 120 }] }).success).toBe(
      false,
    );
    const partner = { name: 'A', url: 'javascript:alert(1)' };
    expect(companyInputSchema.safeParse({ partners: [partner] }).success).toBe(false);
    expect(
      companyInputSchema.safeParse({ partners: [{ name: 'A', logo: 'quotes/x.pdf' }] }).success,
    ).toBe(false);
  });

  it('flags list items that still need Swahili', () => {
    const data = { impact: [{ value: '5', label: { en: 'Projects', sw: '' } }] };
    expect(missingSwahili(fields, data)).toEqual(['impact']);
  });

  it('has labels for every list item field in both languages', () => {
    for (const messages of [en, sw]) {
      const content = messages.Admin.content as unknown as {
        fields: Record<string, string>;
        hints: Record<string, string>;
        listItem: Record<string, string>;
      };
      for (const list of Object.values(CONTENT_FIELDS)
        .flat()
        .filter((f) => f.type === 'list')) {
        const listKey = fieldTextKey(list);
        expect(content.listItem, listKey).toHaveProperty(listKey);
        for (const sub of list.itemFields ?? []) {
          const key = `${listKey}_${sub.path}`;
          expect(content.fields, key).toHaveProperty(key);
          if (sub.hint) expect(content.hints, key).toHaveProperty(key);
        }
      }
    }
  });
});

describe('impact numbers', () => {
  it('splits a value into the counting number and its text', () => {
    expect(splitNumber('120+')).toEqual({ before: '', number: 120, decimals: 0, after: '+' });
    expect(splitNumber('99.9%')).toEqual({ before: '', number: 99.9, decimals: 1, after: '%' });
    expect(splitNumber('TZS 5M')).toEqual({ before: 'TZS ', number: 5, decimals: 0, after: 'M' });
    expect(splitNumber('Many')).toBeNull();
  });
});

describe('OpenStreetMap links', () => {
  it('centres the map on the office with a marker', () => {
    const url = new URL(osmEmbedUrl(-6.163, 35.7516));
    expect(url.hostname).toBe('www.openstreetmap.org');
    expect(url.searchParams.get('marker')).toBe('-6.16300,35.75160');
    expect(url.searchParams.get('bbox')).toBe('35.74560,-6.16900,35.75760,-6.15700');
    expect(osmPageUrl(-6.163, 35.7516)).toContain('mlat=-6.16300&mlon=35.75160');
  });
});
