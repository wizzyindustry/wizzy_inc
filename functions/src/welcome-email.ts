/**
 * Builds the "thanks for subscribing" email sent to a new newsletter subscriber.
 *
 * Pure code — no Firebase imports — so it can be unit-tested from the main test suite
 * (tests/unit/welcome-email.test.ts). The subscriber shape mirrors `subscriberSchema` in
 * src/lib/schemas/subscriber.ts; keep them in sync.
 */
import { escapeHtml } from './lead-email.js';

export type WelcomeEmailInput = {
  id: string;
  email: string;
  locale: 'en' | 'sw';
  unsubscribeToken: string;
};

export type WelcomeEmail = { subject: string; text: string; html: string; unsubscribeUrl: string };

const TOKEN = /^[A-Za-z0-9_-]{32}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Read the Firestore document safely; null when something required is missing. */
export function toWelcomeEmailInput(
  id: string,
  data: Record<string, unknown>,
): WelcomeEmailInput | null {
  const { email, locale, unsubscribeToken } = data;
  if (typeof email !== 'string' || !EMAIL.test(email)) return null;
  if (typeof unsubscribeToken !== 'string' || !TOKEN.test(unsubscribeToken)) return null;
  return { id, email, locale: locale === 'sw' ? 'sw' : 'en', unsubscribeToken };
}

const TEXT = {
  en: {
    subject: 'Welcome to Wizzy Inc updates',
    hello: 'Hello,',
    body: 'Thank you for subscribing to updates from Wizzy Inc. We will send you occasional news about our graphic design and web development work — no spam.',
    unsubscribe: 'Changed your mind? Unsubscribe here:',
    unsubscribeLink: 'Unsubscribe',
    signoff: 'The Wizzy Inc team',
  },
  sw: {
    subject: 'Karibu kwenye taarifa za Wizzy Inc',
    hello: 'Habari,',
    body: 'Asante kwa kujiandikisha kupokea taarifa kutoka Wizzy Inc. Tutakutumia habari mara kwa mara kuhusu kazi zetu za usanifu wa michoro na utengenezaji wa tovuti — bila barua taka.',
    unsubscribe: 'Umebadilisha nia? Jiondoe hapa:',
    unsubscribeLink: 'Jiondoe',
    signoff: 'Timu ya Wizzy Inc',
  },
} as const;

export function buildWelcomeEmail(input: WelcomeEmailInput, siteUrl: string): WelcomeEmail {
  const t = TEXT[input.locale];
  const base = siteUrl.replace(/\/+$/, '');
  const unsubscribeUrl = `${base}/${input.locale}/unsubscribe?t=${encodeURIComponent(input.unsubscribeToken)}`;
  const text = [t.hello, '', t.body, '', `${t.unsubscribe} ${unsubscribeUrl}`, '', t.signoff].join(
    '\n',
  );
  const html = [
    `<p>${escapeHtml(t.hello)}</p>`,
    `<p>${escapeHtml(t.body)}</p>`,
    `<p>${escapeHtml(t.unsubscribe)} <a href="${escapeHtml(unsubscribeUrl)}">${escapeHtml(t.unsubscribeLink)}</a></p>`,
    `<p>${escapeHtml(t.signoff)}</p>`,
  ].join('\n');
  return { subject: t.subject, text, html, unsubscribeUrl };
}
