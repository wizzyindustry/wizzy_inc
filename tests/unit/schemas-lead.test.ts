import { describe, expect, it } from 'vitest';
import {
  attachmentError,
  attachmentSchema,
  budgetRangeById,
  formatLeadRef,
  nextLeadNumber,
  quoteInputSchema,
} from '@/lib/schemas/lead';
import { zodFieldErrors } from '@/lib/utils/action-result';

const valid = {
  serviceSlug: 'logo-design',
  description: 'I need a logo for my salon in Dodoma.',
  name: 'Test Client',
  phone: '0712 345 678',
  preferredContact: 'whatsapp',
  locale: 'sw',
};

describe('quoteInputSchema (FR-2)', () => {
  it('accepts the required fields and normalises the phone to +255', () => {
    const result = quoteInputSchema.parse(valid);
    expect(result.phone).toBe('+255712345678');
    expect(result.email).toBeUndefined();
  });

  it('treats empty optional inputs as not provided', () => {
    const result = quoteInputSchema.parse({
      ...valid,
      email: '',
      packageId: '',
      budgetRange: '',
      deadline: '',
    });
    expect(result).not.toHaveProperty('email', '');
    expect(result.packageId).toBeUndefined();
    expect(result.budgetRange).toBeUndefined();
    expect(result.deadline).toBeUndefined();
  });

  it.each([
    ['name', { name: '' }, 'nameRequired'],
    ['phone', { phone: '12345' }, 'invalidPhone'],
    ['serviceSlug', { serviceSlug: '' }, 'serviceRequired'],
    ['description', { description: 'too short' }, 'descriptionTooShort'],
    ['email', { email: 'not-an-email' }, 'invalidEmail'],
    ['deadline', { deadline: '14/11/2026' }, 'invalidDate'],
    ['budgetRange', { budgetRange: 'a-million-dollars' }, 'invalid'],
    ['preferredContact', { preferredContact: 'pigeon' }, 'invalid'],
  ])('rejects invalid %s with i18n key %s', (field, override, key) => {
    const result = quoteInputSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(zodFieldErrors(result.error!)[field]).toBe(key);
  });
});

describe('budget ranges', () => {
  it('maps ids to TZS ranges', () => {
    expect(budgetRangeById('100k-300k')).toEqual({ min: 100000, max: 300000 });
    expect(budgetRangeById('over-1m')).toEqual({ min: 1000000 });
  });
});

describe('attachments (FR-3)', () => {
  const file = {
    path: 'quotes/l1/a.pdf',
    name: 'a.pdf',
    size: 1000,
    contentType: 'application/pdf',
  };

  it('attachmentSchema accepts allowed types up to 5 MB', () => {
    expect(attachmentSchema.safeParse(file).success).toBe(true);
    expect(attachmentSchema.safeParse({ ...file, size: 5 * 1024 * 1024 + 1 }).success).toBe(false);
    expect(attachmentSchema.safeParse({ ...file, contentType: 'application/zip' }).success).toBe(
      false,
    );
  });

  it('attachmentError checks count, size and type', () => {
    const ok = { name: 'a.png', size: 10, type: 'image/png' };
    expect(attachmentError([])).toBeNull();
    expect(attachmentError([ok, ok, ok])).toBeNull();
    expect(attachmentError([ok, ok, ok, ok])).toBe('tooManyFiles');
    expect(attachmentError([{ ...ok, size: 5 * 1024 * 1024 + 1 }])).toBe('fileTooLarge');
    expect(attachmentError([{ ...ok, type: 'application/x-msdownload' }])).toBe('fileType');
  });
});

describe('reference numbers (FR-4)', () => {
  it('formats with four-digit padding', () => {
    expect(formatLeadRef(2026, 42)).toBe('WZ-2026-0042');
    expect(formatLeadRef(2026, 12345)).toBe('WZ-2026-12345');
  });

  it('increments within a year and restarts at 1 in a new year', () => {
    expect(nextLeadNumber(null, 2026)).toEqual({ year: 2026, value: 1 });
    expect(nextLeadNumber({ year: 2026, value: 41 }, 2026)).toEqual({ year: 2026, value: 42 });
    expect(nextLeadNumber({ year: 2026, value: 99 }, 2027)).toEqual({ year: 2027, value: 1 });
  });
});
