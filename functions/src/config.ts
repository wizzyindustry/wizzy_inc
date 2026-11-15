import { defineSecret, defineString } from 'firebase-functions/params';

/**
 * Deploy-time settings. Values are never committed:
 * - RESEND_API_KEY is a secret: `firebase functions:secrets:set RESEND_API_KEY`
 * - The others go in functions/.env.<project-id> (git-ignored); `firebase deploy` asks
 *   for any that are missing.
 */
export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

export const OWNER_EMAIL = defineString('OWNER_EMAIL', {
  description: 'Where new-lead emails are sent (the owner inbox).',
});

export const EMAIL_FROM = defineString('EMAIL_FROM', {
  description:
    'Sender, e.g. "Wizzy Inc <leads@your-domain>" — the domain must be verified in Resend.',
});

export const SITE_URL = defineString('SITE_URL', {
  description: 'Public site URL used for the admin link, e.g. https://example.com',
});

/**
 * TODO(owner): must match the Firestore database location chosen when the Firebase project
 * is created (e.g. africa-south1 or europe-west1). Firestore triggers run in that region.
 */
export const REGION = 'europe-west1';
