import 'server-only';

/*
 * Send one email through Brevo (free plan: 300 emails a day, no own domain needed — the
 * sender address is verified in Brevo). Owner decision 2026-11-17: the free Firebase plan
 * has no Cloud Functions, so the website server sends the emails itself.
 * Plain fetch to the Brevo REST API — no extra package. Settings (server only):
 *   BREVO_API_KEY             Brevo → SMTP & API → API keys
 *   EMAIL_FROM                the verified sender, e.g. "Wizzy Inc <you@gmail.com>"
 */

export type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

/** "Name <email>" or just "email". */
export function parseSender(from: string): { name: string; email: string } | null {
  const match = /^\s*(?:(.*?)\s*<\s*([^<>\s]+@[^<>\s]+)\s*>|([^<>\s]+@[^<>\s]+))\s*$/.exec(from);
  if (!match) return null;
  const email = (match[2] ?? match[3])!;
  return { name: match[1]?.replace(/^"|"$/g, '') || 'Wizzy Inc', email };
}

export function emailConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.BREVO_API_KEY && env.EMAIL_FROM && parseSender(env.EMAIL_FROM));
}

/** Throws on failure. The error message never contains the email content. */
export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = parseSender(process.env.EMAIL_FROM ?? '');
  if (!apiKey || !sender) throw new Error('Email is not configured (BREVO_API_KEY, EMAIL_FROM)');

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender,
      to: [{ email: email.to }],
      subject: email.subject,
      textContent: email.text,
      htmlContent: email.html,
      ...(email.replyTo && { replyTo: { email: email.replyTo } }),
      ...(email.headers && { headers: email.headers }),
    }),
  });
  if (!res.ok) {
    let code = '';
    try {
      code = ((await res.json()) as { code?: string }).code ?? '';
    } catch {
      // no JSON body
    }
    throw new Error(`Brevo send failed (HTTP ${res.status}${code ? `, ${code}` : ''})`);
  }
}
