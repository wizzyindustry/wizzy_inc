import { describe, expect, it } from 'vitest';
import { subscribeInputSchema, unsubscribeTokenSchema } from '@/lib/schemas/subscriber';
import { csvCell, subscribersCsv } from '@/lib/utils/csv';
import { buildWelcomeEmail, toWelcomeEmailInput } from '../../functions/src/welcome-email';

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

describe('subscribe form input', () => {
  it('accepts an email, normalised to lower case', () => {
    const parsed = subscribeInputSchema.parse({
      email: '  Juma@Example.TEST ',
      locale: 'sw',
      source: 'footer',
    });
    expect(parsed.email).toBe('juma@example.test');
  });

  it('rejects a bad email with the shared error key', () => {
    const result = subscribeInputSchema.safeParse({ email: 'nope', locale: 'en', source: 'home' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('invalidEmail');
  });

  it('unsubscribe tokens have a fixed shape', () => {
    expect(unsubscribeTokenSchema.safeParse(TOKEN).success).toBe(true);
    expect(unsubscribeTokenSchema.safeParse('short').success).toBe(false);
    expect(unsubscribeTokenSchema.safeParse(`${TOKEN.slice(1)}/`).success).toBe(false);
  });
});

describe('subscribers CSV', () => {
  it('quotes cells and defuses spreadsheet formulas', () => {
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    const csv = subscribersCsv([
      {
        email: 'a@example.test',
        locale: 'en',
        source: 'home',
        createdAt: new Date('2026-11-16T08:00:00Z'),
      },
    ]);
    expect(csv).toBe(
      'email,language,signed_up_from,date\r\n"a@example.test","en","home","2026-11-16T08:00:00.000Z"\r\n',
    );
  });
});

describe('welcome email', () => {
  it('reads only complete subscriber documents', () => {
    expect(toWelcomeEmailInput('s1', { email: 'a@example.test', unsubscribeToken: TOKEN })).toEqual(
      { id: 's1', email: 'a@example.test', locale: 'en', unsubscribeToken: TOKEN },
    );
    expect(toWelcomeEmailInput('s1', { email: 'a@example.test' })).toBeNull();
    expect(toWelcomeEmailInput('s1', { email: 'x', unsubscribeToken: TOKEN })).toBeNull();
  });

  it('is written in the subscriber language and links to unsubscribe', () => {
    const email = buildWelcomeEmail(
      { id: 's1', email: 'a@example.test', locale: 'sw', unsubscribeToken: TOKEN },
      'https://example.com/',
    );
    expect(email.subject).toBe('Karibu kwenye taarifa za Wizzy Inc');
    expect(email.unsubscribeUrl).toBe(`https://example.com/sw/unsubscribe?t=${TOKEN}`);
    expect(email.text).toContain(email.unsubscribeUrl);
    expect(email.html).toContain(`href="https://example.com/sw/unsubscribe?t=${TOKEN}"`);
  });
});
