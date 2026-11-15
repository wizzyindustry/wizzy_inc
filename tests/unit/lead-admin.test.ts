import { describe, expect, it } from 'vitest';
import { formatBudget, formatFileSize } from '@/components/admin/lead-format';
import {
  LEAD_PIPELINE,
  leadMatches,
  leadNoteInputSchema,
  leadStatusInputSchema,
  parseLeadDoc,
} from '@/lib/schemas/lead-admin';

const ts = (iso: string) => ({ toDate: () => new Date(iso) }); // Firestore Timestamp stand-in

const doc = {
  ref: 'WZ-2026-0007',
  kind: 'quote',
  name: 'Test Client',
  phone: '+255712345678',
  email: 'client@example.test',
  preferredContact: 'whatsapp',
  locale: 'sw',
  serviceSlug: 'logo-design',
  description: 'A logo for a salon.',
  attachments: [],
  status: 'contacted',
  statusHistory: [
    { status: 'new', at: ts('2026-11-01T08:00:00Z') },
    { status: 'contacted', at: ts('2026-11-02T08:00:00Z') },
  ],
  notes: [{ text: 'Called, wants blue.', at: ts('2026-11-02T08:05:00Z') }],
  createdAt: ts('2026-11-01T08:00:00Z'),
};

describe('parseLeadDoc', () => {
  it('turns Timestamps into Dates and keeps the id', () => {
    const lead = parseLeadDoc('abc', doc);
    expect(lead?.id).toBe('abc');
    expect(lead?.createdAt.toISOString()).toBe('2026-11-01T08:00:00.000Z');
    expect(lead?.statusHistory[1]?.at).toBeInstanceOf(Date);
  });

  it('returns null for a malformed document', () => {
    expect(parseLeadDoc('abc', { ...doc, status: 'archived' })).toBeNull();
    expect(parseLeadDoc('abc', null)).toBeNull();
  });
});

describe('leadMatches (A2 search)', () => {
  const lead = parseLeadDoc('abc', doc)!;
  it.each([
    ['', true],
    ['wz-2026-0007', true],
    ['test cli', true],
    ['CLIENT@EXAMPLE', true],
    ['0712 345', true], // local format matches the stored +255 number
    ['712345678', true],
    ['someone else', false],
    ['99', false],
  ])('"%s" -> %s', (q, expected) => {
    expect(leadMatches(lead, q)).toBe(expected);
  });
});

describe('admin inputs', () => {
  it('pipeline order follows FR-10', () => {
    expect(LEAD_PIPELINE).toEqual(['new', 'contacted', 'quoted', 'won', 'lost']);
  });

  it('accepts valid status changes and rejects unknown statuses or ids', () => {
    expect(leadStatusInputSchema.safeParse({ leadId: 'abc', status: 'won' }).success).toBe(true);
    expect(leadStatusInputSchema.safeParse({ leadId: 'abc', status: 'deleted' }).success).toBe(
      false,
    );
    expect(leadStatusInputSchema.safeParse({ leadId: '../x', status: 'won' }).success).toBe(false);
  });

  it('notes are trimmed, required and at most 2,000 characters', () => {
    expect(leadNoteInputSchema.parse({ leadId: 'abc', text: '  hi  ' }).text).toBe('hi');
    expect(leadNoteInputSchema.safeParse({ leadId: 'abc', text: '   ' }).success).toBe(false);
    expect(leadNoteInputSchema.safeParse({ leadId: 'abc', text: 'a'.repeat(2001) }).success).toBe(
      false,
    );
  });
});

describe('admin formatting', () => {
  it('formats budgets and file sizes', () => {
    expect(formatBudget(undefined)).toBeNull();
    expect(formatBudget({ min: 1_000_000 })).toMatch(/1,000,000\+$/);
    expect(formatBudget({ min: 100_000, max: 300_000 })).toMatch(/100,000 – .*300,000/);
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});
