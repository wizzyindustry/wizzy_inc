'use server';

import { createContactLead } from '@/lib/data/create-lead';
import { emailOwnerAboutLead } from '@/lib/email/notify';
import { contactInputSchema } from '@/lib/schemas/contact-input';
import { guardPublicForm } from '@/lib/security/guard';
import { HONEYPOT_FIELD } from '@/lib/security/honeypot';
import { zodFieldErrors, type ActionResult } from '@/lib/utils/action-result';

const FIELDS = ['name', 'phone', 'email', 'preferredContact', 'message', 'locale'] as const;

function text(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/**
 * Contact page message (F9). Same pattern as submitQuote: guard (honeypot, App Check,
 * rate limit) -> same Zod schema as the client -> store as a lead (kind "contact").
 * Personal data is never logged.
 */
export async function submitContact(formData: FormData): Promise<ActionResult<{ ref: string }>> {
  try {
    const guard = await guardPublicForm({
      action: 'contact',
      honeypot: formData.get(HONEYPOT_FIELD),
      appCheckToken: text(formData.get('appCheckToken')),
    });
    if (!guard.ok) {
      // Bots get a normal-looking success with no reference; nothing is stored.
      if (guard.reason === 'spam') return { ok: true, data: { ref: '' } };
      return { ok: false, error: guard.reason };
    }

    const parsed = contactInputSchema.safeParse(
      Object.fromEntries(FIELDS.map((f) => [f, text(formData.get(f))])),
    );
    if (!parsed.success) {
      return { ok: false, error: 'validation', fieldErrors: zodFieldErrors(parsed.error) };
    }

    const { id, ref } = await createContactLead(parsed.data);
    emailOwnerAboutLead(id);
    return { ok: true, data: { ref } };
  } catch (error) {
    console.error('[contact] submit failed:', error instanceof Error ? error.message : 'unknown');
    return { ok: false, error: 'server' };
  }
}
