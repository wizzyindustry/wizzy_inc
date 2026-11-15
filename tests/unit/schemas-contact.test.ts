import { describe, expect, it } from 'vitest';
import { contactInputSchema } from '@/lib/schemas/contact-input';
import { leadSchema } from '@/lib/schemas/lead';
import { zodFieldErrors } from '@/lib/utils/action-result';

const valid = {
  name: 'Test Client',
  phone: '0712 345 678',
  email: '',
  preferredContact: 'whatsapp',
  message: 'Do you also print business cards?',
  locale: 'en',
};

describe('contactInputSchema (F9)', () => {
  it('accepts a valid message and normalises the phone', () => {
    const result = contactInputSchema.parse(valid);
    expect(result.phone).toBe('+255712345678');
    expect(result.email).toBeUndefined();
  });

  it('returns translatable error keys', () => {
    const result = contactInputSchema.safeParse({
      ...valid,
      name: ' ',
      phone: '12345',
      email: 'not-an-email',
      message: 'Hi',
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(zodFieldErrors(result.error)).toEqual({
      name: 'nameRequired',
      phone: 'invalidPhone',
      email: 'invalidEmail',
      message: 'messageTooShort',
    });
  });

  it('rejects messages over 2,000 characters', () => {
    const result = contactInputSchema.safeParse({ ...valid, message: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(zodFieldErrors(result.error)).toEqual({ message: 'messageTooLong' });
  });
});

describe('leadSchema kinds', () => {
  const base = {
    id: 'abc',
    ref: 'WZ-2026-0001',
    name: 'Test Client',
    phone: '+255712345678',
    preferredContact: 'whatsapp',
    locale: 'en',
    description: 'Do you also print business cards?',
    attachments: [],
    status: 'new',
    statusHistory: [],
    notes: [],
    createdAt: new Date(),
  };

  it('accepts a contact lead without a service', () => {
    expect(leadSchema.parse({ ...base, kind: 'contact' }).kind).toBe('contact');
  });

  it('treats older leads without a kind as quotes', () => {
    expect(leadSchema.parse({ ...base, serviceSlug: 'logo-design' }).kind).toBe('quote');
  });
});
