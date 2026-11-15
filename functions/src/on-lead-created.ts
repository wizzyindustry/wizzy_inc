import { logger } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { Resend } from 'resend';
import { EMAIL_FROM, OWNER_EMAIL, REGION, RESEND_API_KEY, SITE_URL } from './config.js';
import { buildLeadEmail, toLeadEmailInput } from './lead-email.js';

/** Events older than this are dropped instead of retried (avoids days-late emails). */
const MAX_EVENT_AGE_MS = 60 * 60 * 1000;

/**
 * A3 / FR-5 — email the owner when a new lead is created.
 *
 * Privacy: logs contain only the lead id and reference number, never personal details.
 * Retries: on failure the event is retried; the Resend idempotency key makes sure a retry
 * never sends the same email twice.
 * Emulator: the email is built but not sent (dry run).
 */
export const onLeadCreated = onDocumentCreated(
  {
    document: 'leads/{leadId}',
    region: REGION,
    secrets: [RESEND_API_KEY],
    retry: true,
    maxInstances: 5,
    timeoutSeconds: 60,
  },
  async (event) => {
    const leadId = event.params.leadId;
    const ageMs = Date.now() - Date.parse(event.time);
    if (ageMs > MAX_EVENT_AGE_MS) {
      logger.error('Lead email dropped: event too old', { leadId, ageMs });
      return;
    }

    const data = event.data?.data();
    const lead = data ? toLeadEmailInput(leadId, data) : null;
    if (!lead) {
      // Not retried: the document will not get better by trying again.
      logger.error('Lead email skipped: document missing required fields', { leadId });
      return;
    }

    const email = buildLeadEmail(lead, SITE_URL.value());

    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      logger.info('Lead email (emulator dry run, not sent)', { leadId, ref: lead.ref });
      return;
    }

    const resend = new Resend(RESEND_API_KEY.value());
    const { error } = await resend.emails.send(
      {
        from: EMAIL_FROM.value(),
        to: OWNER_EMAIL.value(),
        subject: email.subject,
        text: email.text,
        html: email.html,
        ...(email.replyTo && { replyTo: email.replyTo }),
      },
      { idempotencyKey: `lead-created/${leadId}` },
    );
    if (error) {
      // Throwing makes Cloud Functions retry the event. Resend error messages do not
      // contain the email body.
      logger.error('Lead email failed', { leadId, ref: lead.ref, error: error.name });
      throw new Error(`Resend error: ${error.name}`);
    }
    logger.info('Lead email sent', { leadId, ref: lead.ref });
  },
);
