/**
 * Load SAMPLE data into the local Firebase emulators.
 *   1. pnpm emulators   (in one terminal)
 *   2. pnpm seed        (in another)
 *
 * Safety: this script ALWAYS targets the emulators and the `demo-wizzy` project.
 * `demo-` projects cannot reach real Firebase, so production data can never be touched.
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { z } from 'zod';
import {
  packageSchema,
  portfolioItemSchema,
  serviceSchema,
  siteSettingsSchema,
  testimonialSchema,
} from '@/lib/schemas/content';
import { leadSchema } from '@/lib/schemas/lead';
import {
  PLACEHOLDER_PNG,
  SAMPLE_PDF,
  sampleLeads,
  sampleRecentLeads,
  samplePackages,
  samplePortfolio,
  sampleServices,
  sampleSettings,
  sampleTestimonials,
} from './sample-data';

const PROJECT_ID = 'demo-wizzy';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

const app = initializeApp({ projectId: PROJECT_ID, storageBucket: `${PROJECT_ID}.appspot.com` });
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

/** Emulator-only test accounts (fake addresses, fake password). One admin, one not. */
const SAMPLE_PASSWORD = 'emulator-only-password';
const SAMPLE_ACCOUNTS = [
  { email: 'admin@example.test', admin: true },
  { email: 'not-admin@example.test', admin: false },
];

async function seedAccounts(): Promise<void> {
  const auth = getAuth(app);
  for (const account of SAMPLE_ACCOUNTS) {
    const user = await auth
      .getUserByEmail(account.email)
      .catch(() => auth.createUser({ email: account.email, password: SAMPLE_PASSWORD }));
    await auth.setCustomUserClaims(user.uid, account.admin ? { admin: true } : null);
  }
  console.log(
    `  auth accounts: ${SAMPLE_ACCOUNTS.map((a) => a.email).join(', ')} (password: ${SAMPLE_PASSWORD})`,
  );
}

/** Validate with the app's own schema, then store without the `id` field. */
function check<S extends z.ZodType>(schema: S, doc: { id: string }): Record<string, unknown> {
  const data = { ...(schema.parse(doc) as Record<string, unknown>) };
  delete data.id;
  return data;
}

async function seedCollection<S extends z.ZodType>(
  name: string,
  schema: S,
  docs: { id: string }[],
): Promise<void> {
  const batch = db.batch();
  for (const doc of docs) batch.set(db.collection(name).doc(doc.id), check(schema, doc));
  await batch.commit();
  console.log(`  ${name}: ${docs.length}`);
}

async function main(): Promise<void> {
  console.log(`Seeding SAMPLE data into emulator project "${PROJECT_ID}"...`);
  // Fresh rate-limit windows, so repeated local test runs are not blocked (emulator only).
  await db.recursiveDelete(db.collection('rateLimits'));
  console.log('  rateLimits: cleared');
  await seedCollection('services', serviceSchema, sampleServices);
  await seedCollection('packages', packageSchema, samplePackages);
  await seedCollection('portfolio', portfolioItemSchema, samplePortfolio);
  await seedCollection('testimonials', testimonialSchema, sampleTestimonials);
  await db.doc('settings/site').set(siteSettingsSchema.parse(sampleSettings));
  console.log('  settings/site: 1');

  for (const item of samplePortfolio) {
    await bucket.file(item.coverImage).save(PLACEHOLDER_PNG, { contentType: 'image/png' });
  }
  console.log(`  storage images: ${samplePortfolio.length}`);
  await seedAccounts();

  await seedCollection('leads', leadSchema, [...sampleLeads, ...sampleRecentLeads]);
  await bucket.file('quotes/sample-lead-quote/1-sample-brief.pdf').save(SAMPLE_PDF, {
    contentType: 'application/pdf',
  });
  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error instanceof Error ? error.message : error);
  console.error('Are the emulators running? Start them with `pnpm emulators`.');
  process.exit(1);
});
