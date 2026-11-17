import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { emailConfigured, parseSender } = await import('@/lib/email/brevo');

describe('brevo sender', () => {
  it('reads "Name <email>" and a bare email', () => {
    expect(parseSender('Wizzy Inc <hello@example.com>')).toEqual({
      name: 'Wizzy Inc',
      email: 'hello@example.com',
    });
    expect(parseSender('"Wizzy" <a@b.co>')).toEqual({ name: 'Wizzy', email: 'a@b.co' });
    expect(parseSender('a@b.co')).toEqual({ name: 'Wizzy Inc', email: 'a@b.co' });
    expect(parseSender('not an email')).toBeNull();
  });

  it('is only enabled with both the API key and a valid sender', () => {
    expect(emailConfigured({ BREVO_API_KEY: 'k', EMAIL_FROM: 'a@b.co' })).toBe(true);
    expect(emailConfigured({ EMAIL_FROM: 'a@b.co' })).toBe(false);
    expect(emailConfigured({ BREVO_API_KEY: 'k', EMAIL_FROM: 'nope' })).toBe(false);
  });
});
