import { logger } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { Resend } from 'resend';
import { EMAIL_FROM, REGION, RESEND_API_KEY, SITE_URL } from './config.js';
import { buildWelcomeEmail, toWelcomeEmailInput } from './welcome-email.js';

/** Events older than this are dropped instead of retried (no days-late welcome emails). */
const MAX_EVENT_AGE_MS = 60 * 60 * 1000;

/**
 * Newsletter: send the "thanks for subscribing" email (with an unsubscribe link) when a
 * subscriber is added. Same mail setup as onLeadCreated (Resend).
 *
 * Privacy: logs contain only the subscriber document id, never the email address.
 * Emulator: the email is built but not sent (dry run).
 */
export const onSubscriberCreated = onDocumentCreated(
  {
    document: 'subscribers/{subscriberId}',
    region: REGION,
    secrets: [RESEND_API_KEY],
    retry: true,
    maxInstances: 5,
    timeoutSeconds: 60,
  },
  async (event) => {
    const subscriberId = event.params.subscriberId;
    const ageMs = Date.now() - Date.parse(event.time);
    if (ageMs > MAX_EVENT_AGE_MS) {
      logger.error('Welcome email dropped: event too old', { subscriberId, ageMs });
      return;
    }

    const data = event.data?.data();
    const subscriber = data ? toWelcomeEmailInput(subscriberId, data) : null;
    if (!subscriber) {
      logger.error('Welcome email skipped: document missing required fields', { subscriberId });
      return;
    }

    const email = buildWelcomeEmail(subscriber, SITE_URL.value());
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      logger.info('Welcome email (emulator dry run, not sent)', { subscriberId });
      return;
    }

    const resend = new Resend(RESEND_API_KEY.value());
    const { error } = await resend.emails.send(
      {
        from: EMAIL_FROM.value(),
        to: subscriber.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
        // One-click unsubscribe in mail apps that support it.
        headers: { 'List-Unsubscribe': `<${email.unsubscribeUrl}>` },
      },
      { idempotencyKey: `subscriber-created/${subscriberId}` },
    );
    if (error) {
      logger.error('Welcome email failed', { subscriberId, error: error.name });
      throw new Error(`Resend error: ${error.name}`);
    }
    logger.info('Welcome email sent', { subscriberId });
  },
);
