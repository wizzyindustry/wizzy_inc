'use server';

import { addSubscriber, removeSubscriberByToken } from '@/lib/data/subscribers';
import { emailWelcome } from '@/lib/email/notify';
import { subscribeInputSchema, unsubscribeTokenSchema } from '@/lib/schemas/subscriber';
import { guardPublicForm } from '@/lib/security/guard';
import { HONEYPOT_FIELD } from '@/lib/security/honeypot';
import { zodFieldErrors, type ActionResult } from '@/lib/utils/action-result';

function text(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/**
 * "Stay updated" sign-up (home page and footer). Same protections as the other public
 * forms: honeypot, App Check, rate limit, then the shared Zod schema. Emails are never logged.
 */
export async function subscribe(formData: FormData): Promise<ActionResult<null>> {
  try {
    const guard = await guardPublicForm({
      action: 'subscribe',
      honeypot: formData.get(HONEYPOT_FIELD),
      appCheckToken: text(formData.get('appCheckToken')),
    });
    if (!guard.ok) {
      if (guard.reason === 'spam') return { ok: true, data: null };
      return { ok: false, error: guard.reason };
    }
    const parsed = subscribeInputSchema.safeParse({
      email: text(formData.get('email')),
      locale: text(formData.get('locale')),
      source: text(formData.get('source')),
    });
    if (!parsed.success) {
      return { ok: false, error: 'validation', fieldErrors: zodFieldErrors(parsed.error) };
    }
    const newId = await addSubscriber(parsed.data);
    if (newId) emailWelcome(newId);
    return { ok: true, data: null };
  } catch (error) {
    console.error('[subscribe] failed:', error instanceof Error ? error.message : 'unknown');
    return { ok: false, error: 'server' };
  }
}

/** The button on the unsubscribe page (the link in every newsletter email). */
export async function unsubscribe(formData: FormData): Promise<ActionResult<null>> {
  try {
    const guard = await guardPublicForm({
      action: 'unsubscribe',
      honeypot: undefined,
      appCheckToken: text(formData.get('appCheckToken')),
    });
    if (!guard.ok) return { ok: false, error: guard.reason === 'spam' ? 'server' : guard.reason };
    const token = unsubscribeTokenSchema.safeParse(text(formData.get('token')));
    if (!token.success) return { ok: false, error: 'notFound' };
    const removed = await removeSubscriberByToken(token.data);
    return removed ? { ok: true, data: null } : { ok: false, error: 'notFound' };
  } catch (error) {
    console.error('[unsubscribe] failed:', error instanceof Error ? error.message : 'unknown');
    return { ok: false, error: 'server' };
  }
}
