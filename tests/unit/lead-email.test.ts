import { describe, expect, it } from 'vitest';
import { BUDGET_RANGES, budgetRangeById } from '@/lib/schemas/lead';
import {
  buildLeadEmail,
  escapeHtml,
  formatBudget,
  toLeadEmailInput,
} from '../../functions/src/lead-email';

/** Shaped like what createLead writes (Timestamps faked with a toDate() method). */
function leadDoc(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ref: 'WZ-2026-0042',
    name: 'Test Client',
    phone: '+255712345678',
    email: 'client@example.test',
    preferredContact: 'whatsapp',
    locale: 'sw',
    serviceSlug: 'logo-design',
    packageId: 'graphic-design-basic',
    description: 'A logo for a small salon in Dodoma.\nBlue and gold.',
    budgetRangeTZS: { min: 100_000, max: 300_000 },
    deadline: { toDate: () => new Date('2026-12-01T09:00:00Z') },
    attachments: [{ path: 'quotes/abc/1-brief.pdf', name: 'brief.pdf', size: 2048 }],
    status: 'new',
    createdAt: { toDate: () => new Date('2026-11-15T07:30:00Z') },
    ...overrides,
  };
}

const SITE = 'https://example.test/';

describe('toLeadEmailInput', () => {
  it('reads a full lead document', () => {
    const lead = toLeadEmailInput('abc', leadDoc());
    expect(lead).toMatchObject({
      id: 'abc',
      ref: 'WZ-2026-0042',
      budgetRangeTZS: { min: 100_000, max: 300_000 },
      attachments: [{ name: 'brief.pdf', size: 2048 }],
    });
    expect(lead?.deadline?.toISOString()).toBe('2026-12-01T09:00:00.000Z');
  });

  it('returns null when required fields are missing', () => {
    expect(toLeadEmailInput('abc', leadDoc({ ref: undefined }))).toBeNull();
    expect(toLeadEmailInput('abc', leadDoc({ phone: '' }))).toBeNull();
  });

  it('treats optional fields as absent', () => {
    const lead = toLeadEmailInput(
      'abc',
      leadDoc({
        email: undefined,
        packageId: undefined,
        budgetRangeTZS: undefined,
        deadline: undefined,
      }),
    );
    expect(lead?.email).toBeUndefined();
    expect(lead?.budgetRangeTZS).toBeUndefined();
    expect(lead?.deadline).toBeUndefined();
  });
});

describe('formatBudget', () => {
  it('has a readable label for every budget range in the quote form', () => {
    expect(BUDGET_RANGES.map((r) => formatBudget(budgetRangeById(r.id)))).toEqual([
      'Under TSh 100,000',
      'TSh 100,000 – 300,000',
      'TSh 300,000 – 1,000,000',
      'Over TSh 1,000,000',
    ]);
    expect(formatBudget(undefined)).toBe('Not sure yet');
  });
});

describe('buildLeadEmail (FR-5)', () => {
  const lead = toLeadEmailInput('abc', leadDoc())!;
  const email = buildLeadEmail(lead, SITE);

  it('contains every request detail and the admin link', () => {
    for (const part of [
      'WZ-2026-0042',
      'logo-design',
      'graphic-design-basic',
      'TSh 100,000 – 300,000',
      '1 December 2026',
      'Test Client',
      '+255712345678',
      'client@example.test',
      'WhatsApp',
      'Swahili',
      'Blue and gold.',
      'brief.pdf (2 KB)',
      'https://example.test/admin/leads/abc',
    ]) {
      expect(email.text, part).toContain(part);
      expect(email.html, part).toContain(part);
    }
    expect(email.html).toContain('href="https://wa.me/255712345678"');
    expect(email.subject).toBe('New quote request WZ-2026-0042: logo-design — Test Client');
  });

  it('sets reply-to only when the client gave an email', () => {
    expect(email.replyTo).toBe('client@example.test');
    const noEmail = toLeadEmailInput('abc', leadDoc({ email: undefined }))!;
    expect(buildLeadEmail(noEmail, SITE).replyTo).toBeUndefined();
  });

  it('escapes visitor text in HTML and keeps the subject on one line', () => {
    const evil = toLeadEmailInput(
      'abc',
      leadDoc({
        name: 'Eve\r\nBcc: someone@example.test',
        description: '<script>alert(1)</script> and <a href="x">link</a> for the shop',
      }),
    )!;
    const out = buildLeadEmail(evil, SITE);
    expect(out.html).not.toContain('<script>');
    expect(out.html).not.toContain('<a href="x">');
    expect(out.html).toContain('&lt;script&gt;');
    expect(out.subject).not.toMatch(/[\r\n]/);
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });
});
