'use server';

import { getPublishedPackages } from '@/lib/data/packages';
import { getServiceBySlug } from '@/lib/data/services';
import { attachmentError, quoteInputSchema } from '@/lib/schemas/lead';
import { contentMatchesType } from '@/lib/security/file-type';
import { guardPublicForm } from '@/lib/security/guard';
import { HONEYPOT_FIELD } from '@/lib/security/honeypot';
import { zodFieldErrors, type ActionResult } from '@/lib/utils/action-result';
import { todayInTanzania } from '@/lib/utils/format-date';
import { createQuoteLead } from '@/lib/data/create-lead';
import { emailOwnerAboutLead } from '@/lib/email/notify';

const FIELDS = [
  'serviceSlug',
  'packageId',
  'description',
  'budgetRange',
  'deadline',
  'name',
  'phone',
  'email',
  'preferredContact',
  'locale',
] as const;

function text(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/**
 * Quote request (F6, FR-2 – FR-4). Flow per ARCHITECTURE §4.4:
 * guard (honeypot, App Check, rate limit) -> same Zod schema as the client -> attachment
 * checks -> service/package exist -> upload + create lead -> return reference number.
 * Personal data is never logged.
 */
export async function submitQuote(formData: FormData): Promise<ActionResult<{ ref: string }>> {
  try {
    const guard = await guardPublicForm({
      action: 'quote',
      honeypot: formData.get(HONEYPOT_FIELD),
      appCheckToken: text(formData.get('appCheckToken')),
    });
    if (!guard.ok) {
      // Bots get a normal-looking success with no reference; nothing is stored.
      if (guard.reason === 'spam') return { ok: true, data: { ref: '' } };
      return { ok: false, error: guard.reason };
    }

    const parsed = quoteInputSchema.safeParse(
      Object.fromEntries(FIELDS.map((f) => [f, text(formData.get(f))])),
    );
    if (!parsed.success) {
      return { ok: false, error: 'validation', fieldErrors: zodFieldErrors(parsed.error) };
    }
    const data = parsed.data;

    if (data.deadline && data.deadline < todayInTanzania()) {
      return { ok: false, error: 'validation', fieldErrors: { deadline: 'deadlinePast' } };
    }

    const files = formData
      .getAll('attachments')
      .filter((f): f is File => f instanceof File && f.size > 0);
    const fileProblem = attachmentError(files);
    if (fileProblem) {
      return { ok: false, error: 'validation', fieldErrors: { attachments: fileProblem } };
    }
    const uploads = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        bytes: Buffer.from(await f.arrayBuffer()),
      })),
    );
    if (uploads.some((f) => !contentMatchesType(f.bytes, f.type))) {
      return { ok: false, error: 'validation', fieldErrors: { attachments: 'fileType' } };
    }

    const service = await getServiceBySlug(data.serviceSlug);
    if (!service) {
      return { ok: false, error: 'validation', fieldErrors: { serviceSlug: 'serviceRequired' } };
    }
    if (data.packageId) {
      const packages = await getPublishedPackages(service.category);
      if (!packages.some((p) => p.id === data.packageId)) {
        return { ok: false, error: 'validation', fieldErrors: { packageId: 'invalidPackage' } };
      }
    }

    const { id, ref } = await createQuoteLead(data, uploads);
    emailOwnerAboutLead(id);
    return { ok: true, data: { ref } };
  } catch (error) {
    console.error('[quote] submit failed:', error instanceof Error ? error.message : 'unknown');
    return { ok: false, error: 'server' };
  }
}
