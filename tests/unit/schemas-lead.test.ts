import { describe, expect, it } from 'vitest';
import { attachmentSchema, formatLeadRef, quoteInputSchema } from '@/lib/schemas/lead';

const valid = {
  serviceSlug: 'logo-design',
  description: 'I need a logo for my salon in Dodoma.',
  name: 'Test Client',
  phone: '0712 345 678',
  locale: 'sw',
};

describe('quoteInputSchema (FR-2)', () => {
  it('accepts the required fields and normalises the phone to +255', () => {
    const result = quoteInputSchema.parse(valid);
    expect(result.phone).toBe('+255712345678');
    expect(result.preferredContact).toBe('whatsapp');
    expect(result.email).toBeUndefined();
  });

  it('treats an empty email as not provided', () => {
    expect(quoteInputSchema.parse({ ...valid, email: '' }).email).toBeUndefined();
  });

  it.each([
    ['name', { name: '' }],
    ['phone', { phone: '12345' }],
    ['serviceSlug', { serviceSlug: '' }],
    ['description', { description: 'too short' }],
    ['email', { email: 'not-an-email' }],
    ['deadline', { deadline: '14/11/2026' }],
    ['budgetRangeTZS', { budgetRangeTZS: { min: 200000, max: 100000 } }],
  ])('rejects invalid %s', (field, override) => {
    const result = quoteInputSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path[0]).toBe(field);
  });
});

describe('attachmentSchema (FR-3)', () => {
  const file = {
    path: 'quotes/l1/a.pdf',
    name: 'a.pdf',
    size: 1000,
    contentType: 'application/pdf',
  };

  it('accepts allowed types up to 5 MB', () => {
    expect(attachmentSchema.safeParse(file).success).toBe(true);
    expect(attachmentSchema.safeParse({ ...file, size: 5 * 1024 * 1024 }).success).toBe(true);
  });

  it('rejects files over 5 MB or with other types', () => {
    expect(attachmentSchema.safeParse({ ...file, size: 5 * 1024 * 1024 + 1 }).success).toBe(false);
    expect(attachmentSchema.safeParse({ ...file, contentType: 'application/zip' }).success).toBe(
      false,
    );
  });
});

describe('formatLeadRef (FR-4)', () => {
  it('pads to four digits', () => {
    expect(formatLeadRef(2026, 42)).toBe('WZ-2026-0042');
    expect(formatLeadRef(2026, 12345)).toBe('WZ-2026-12345');
  });
});
