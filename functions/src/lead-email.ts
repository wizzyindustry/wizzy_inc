/**
 * Builds the "new lead" email sent to the owner (A3, FR-5).
 *
 * Pure code — no Firebase imports — so it can be unit-tested from the main test suite
 * (tests/unit/lead-email.test.ts). The lead shape mirrors `leadSchema` in
 * src/lib/schemas/lead.ts and what `createLead` writes; keep them in sync.
 *
 * Everything the visitor typed is untrusted: it is HTML-escaped in the HTML body and
 * line breaks are removed from the subject.
 */

const TIME_ZONE = 'Africa/Dar_es_Salaam';

export type LeadEmailInput = {
  id: string;
  ref: string;
  name: string;
  phone: string;
  email?: string;
  preferredContact: string;
  locale: string;
  serviceSlug: string;
  packageId?: string;
  description: string;
  budgetRangeTZS?: { min: number; max?: number };
  deadline?: Date;
  attachments: { name: string; size: number }[];
  createdAt?: Date;
};

export type LeadEmail = { subject: string; text: string; html: string; replyTo?: string };

// ---- Reading the Firestore document safely ----

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/** Firestore Timestamp (or Date) -> Date, without importing firebase-admin. */
function date(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    const d = (value as { toDate: () => unknown }).toDate();
    return d instanceof Date ? d : undefined;
  }
  return undefined;
}

function budget(value: unknown): LeadEmailInput['budgetRangeTZS'] {
  if (!value || typeof value !== 'object') return undefined;
  const { min, max } = value as { min?: unknown; max?: unknown };
  if (typeof min !== 'number') return undefined;
  return typeof max === 'number' ? { min, max } : { min };
}

/**
 * Turn raw document data into email input. Returns null when the document is missing
 * the fields every lead must have (then there is nothing sensible to send).
 */
export function toLeadEmailInput(id: string, data: Record<string, unknown>): LeadEmailInput | null {
  const ref = str(data.ref);
  const name = str(data.name);
  const phone = str(data.phone);
  const serviceSlug = str(data.serviceSlug);
  const description = str(data.description);
  if (!ref || !name || !phone || !serviceSlug || !description) return null;

  const attachments = Array.isArray(data.attachments)
    ? data.attachments.flatMap((a: unknown) => {
        const file = a as { name?: unknown; size?: unknown } | null;
        const fileName = str(file?.name);
        return fileName
          ? [{ name: fileName, size: typeof file?.size === 'number' ? file.size : 0 }]
          : [];
      })
    : [];

  return {
    id,
    ref,
    name,
    phone,
    email: str(data.email),
    preferredContact: str(data.preferredContact) ?? 'whatsapp',
    locale: str(data.locale) ?? 'en',
    serviceSlug,
    packageId: str(data.packageId),
    description,
    budgetRangeTZS: budget(data.budgetRangeTZS),
    deadline: date(data.deadline),
    attachments,
    createdAt: date(data.createdAt),
  };
}

// ---- Formatting ----

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** No line breaks or control characters in a subject line. */
function oneLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
}

const tsh = (amount: number) => `TSh ${amount.toLocaleString('en-US')}`;

export function formatBudget(range: LeadEmailInput['budgetRangeTZS']): string {
  if (!range) return 'Not sure yet';
  if (range.max === undefined) return `Over ${tsh(range.min)}`;
  if (range.min === 0) return `Under ${tsh(range.max)}`;
  return `${tsh(range.min)} – ${range.max.toLocaleString('en-US')}`;
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: TIME_ZONE });
const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  phone: 'Phone call',
  email: 'Email',
};
const LANGUAGE_LABELS: Record<string, string> = { en: 'English', sw: 'Swahili' };

/** +255712345678 -> 255712345678 (wa.me wants the number without "+"). */
const waNumber = (phone: string) => phone.replace(/\D/g, '');

// ---- The email ----

export function buildLeadEmail(lead: LeadEmailInput, siteUrl: string): LeadEmail {
  const adminUrl = `${siteUrl.replace(/\/+$/, '')}/admin/leads/${encodeURIComponent(lead.id)}`;
  const contact = CONTACT_LABELS[lead.preferredContact] ?? lead.preferredContact;
  const language = LANGUAGE_LABELS[lead.locale] ?? lead.locale;

  // [label, plain-text value, HTML value]
  const rows: [string, string, string][] = [
    ['Reference', lead.ref, `<strong>${escapeHtml(lead.ref)}</strong>`],
    ['Service', lead.serviceSlug, escapeHtml(lead.serviceSlug)],
    ['Package', lead.packageId ?? '—', escapeHtml(lead.packageId ?? '—')],
    ['Budget', formatBudget(lead.budgetRangeTZS), escapeHtml(formatBudget(lead.budgetRangeTZS))],
    [
      'Deadline',
      lead.deadline ? dateFmt.format(lead.deadline) : 'Not given',
      lead.deadline ? dateFmt.format(lead.deadline) : 'Not given',
    ],
    ['Name', lead.name, escapeHtml(lead.name)],
    [
      'Phone',
      lead.phone,
      `<a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a> · ` +
        `<a href="https://wa.me/${waNumber(lead.phone)}">WhatsApp</a>`,
    ],
    [
      'Email',
      lead.email ?? '—',
      lead.email ? `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>` : '—',
    ],
    ['Preferred contact', contact, escapeHtml(contact)],
    ['Language', language, escapeHtml(language)],
  ];
  if (lead.createdAt) {
    const sent = dateTimeFmt.format(lead.createdAt);
    rows.push(['Sent', sent, sent]);
  }

  const files = lead.attachments.map((f) => `${f.name} (${formatSize(f.size)})`);

  const subject = oneLine(`New quote request ${lead.ref}: ${lead.serviceSlug} — ${lead.name}`);

  const text = [
    `New quote request ${lead.ref}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Project description:',
    lead.description,
    '',
    `Attachments: ${files.length ? files.join(', ') : 'none'}`,
    '',
    `Open in admin: ${adminUrl}`,
  ].join('\n');

  // Email clients ignore stylesheets, so this HTML uses inline styles (unlike the website,
  // which uses Tailwind tokens). Kept deliberately plain.
  const cell = 'padding:6px 12px 6px 0;vertical-align:top';
  const html = `<!doctype html>
<html><body style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h1 style="font-size:20px;margin:0 0 16px">New quote request ${escapeHtml(lead.ref)}</h1>
<table role="presentation" style="border-collapse:collapse">
${rows
  .map(
    ([label, , value]) =>
      `<tr><th align="left" style="${cell};color:#555;font-weight:normal">${escapeHtml(label)}</th><td style="${cell}">${value}</td></tr>`,
  )
  .join('\n')}
</table>
<h2 style="font-size:16px;margin:20px 0 8px">Project description</h2>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.description)}</p>
<h2 style="font-size:16px;margin:20px 0 8px">Attachments</h2>
${
  files.length
    ? `<ul style="margin:0;padding-left:20px">${files.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
<p style="margin:8px 0 0;color:#555">Download them from the admin panel.</p>`
    : '<p style="margin:0">None</p>'
}
<p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl)}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open in admin</a></p>
</body></html>`;

  return { subject, text, html, ...(lead.email && { replyTo: lead.email }) };
}
