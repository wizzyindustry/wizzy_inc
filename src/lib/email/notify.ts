import 'server-only';
import { after } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { buildLeadEmail, toLeadEmailInput } from '../../../functions/src/lead-email';
import { buildWelcomeEmail, toWelcomeEmailInput } from '../../../functions/src/welcome-email';
import { emailConfigured, sendEmail } from './brevo';

/*
 * Emails sent by the website server itself (free Firebase plan: no Cloud Functions).
 * Same templates as the Cloud Functions (functions/src/*-email.ts). Only when Brevo is
 * configured — with Cloud Functions deployed instead, leave BREVO_API_KEY unset so nothing
 * is sent twice. Runs after the visitor's answer (`after`), so a slow or failing email
 * never breaks a form. Logs never contain names, emails or messages (ids only).
 * Local development / emulators: nothing is sent.
 */

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const enabled = () => !process.env.FIRESTORE_EMULATOR_HOST && emailConfigured();

/** New quote request or contact message -> email to the owner. */
export function emailOwnerAboutLead(leadId: string): void {
  const to = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!enabled() || !to) return;
  after(async () => {
    try {
      const snap = await adminDb().collection('leads').doc(leadId).get();
      const lead = snap.exists ? toLeadEmailInput(leadId, snap.data() ?? {}) : null;
      if (!lead) {
        console.error('[email] lead email skipped: missing fields', { leadId });
        return;
      }
      const email = buildLeadEmail(lead, siteUrl());
      await sendEmail({ to, ...email });
    } catch (error) {
      console.error('[email] lead email failed', {
        leadId,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  });
}

/** New newsletter subscriber -> welcome email with the unsubscribe link. */
export function emailWelcome(subscriberId: string): void {
  if (!enabled()) return;
  after(async () => {
    try {
      const snap = await adminDb().collection('subscribers').doc(subscriberId).get();
      const subscriber = snap.exists ? toWelcomeEmailInput(subscriberId, snap.data() ?? {}) : null;
      if (!subscriber) {
        console.error('[email] welcome email skipped: missing fields', { subscriberId });
        return;
      }
      const { unsubscribeUrl, ...email } = buildWelcomeEmail(subscriber, siteUrl());
      await sendEmail({
        to: subscriber.email,
        ...email,
        // One-click unsubscribe in mail apps that support it.
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
      });
    } catch (error) {
      console.error('[email] welcome email failed', {
        subscriberId,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  });
}
