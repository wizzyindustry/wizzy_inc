import { z } from 'zod';
import { localeSchema } from './common';

/** Where the "Stay updated" form was used. */
export const subscribeSourceSchema = z.enum(['home', 'footer']);

/** What the subscribe form sends (validated in the browser and again on the server). */
export const subscribeInputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('invalidEmail').max(254, 'invalidEmail')),
  locale: localeSchema,
  source: subscribeSourceSchema,
});
export type SubscribeInput = z.infer<typeof subscribeInputSchema>;

/** Random token in each subscriber's "unsubscribe" link (no account needed). */
export const unsubscribeTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);

/** Firestore `subscribers/{id}` (id = hash of the email, so one entry per address). */
export const subscriberSchema = subscribeInputSchema.extend({
  id: z.string(),
  unsubscribeToken: unsubscribeTokenSchema,
  createdAt: z.date(),
});
export type Subscriber = z.infer<typeof subscriberSchema>;
