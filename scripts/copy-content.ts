/**
 * One-time copy of the content you edited locally (emulators) to the REAL Firebase project.
 *
 *   Step 1 (emulators running: `pnpm emulators`):
 *     pnpm content:copy export
 *       -> writes .production-copy/ (content.json + files/), nothing leaves your computer
 *
 *   Step 2 (emulators may be stopped):
 *     pnpm content:copy import --key <service-account.json> --bucket <bucket>
 *       -> DRY RUN: shows what would be copied, writes nothing
 *     pnpm content:copy import --key <service-account.json> --bucket <bucket> --confirm
 *       -> copies to the real project
 *
 * What is copied: site documents (settings/…), services, packages, portfolio, testimonials,
 * blog posts, and the images/files they use. What is NOT copied: items whose title/name is
 * still "SAMPLE: …", leads, subscribers, counters, rate limits and the emulator test accounts.
 * Leftover sample text inside copied items is listed so the owner can fix it in the admin.
 * Documents that already exist in the real project are never overwritten.
 *
 * Safety: the key file is only read from disk (never printed or copied); "demo-" projects
 * are refused for import. Owner-run only (CLAUDE.md: production changes need the owner).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { z } from 'zod';
import {
  aboutPageSchema,
  blogPostSchema,
  companySchema,
  legalPagesSchema,
  packageSchema,
  portfolioItemSchema,
  pressPageSchema,
  serviceSchema,
  siteSettingsSchema,
  supportPageSchema,
  testimonialSchema,
} from '@/lib/schemas/content';

const OUT_DIR = '.production-copy';
const COLLECTIONS: Record<string, z.ZodType> = {
  services: serviceSchema,
  packages: packageSchema,
  portfolio: portfolioItemSchema,
  testimonials: testimonialSchema,
  posts: blogPostSchema,
};
const SITE_DOCS: Record<string, z.ZodType> = {
  site: siteSettingsSchema,
  about: aboutPageSchema,
  legal: legalPagesSchema,
  company: companySchema,
  support: supportPageSchema,
  press: pressPageSchema,
};
/** Storage paths inside documents (images, logos, PDFs). */
const FILE_PATH = /^(portfolio|site)\/[A-Za-z0-9._/-]+$/;

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type DocEntry = { path: string; data: Json };
type FileEntry = { path: string; contentType: string };
type Manifest = { docs: DocEntry[]; files: FileEntry[]; skipped: string[]; warnings: string[] };

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

// ---- Firestore values <-> JSON (Timestamps kept as tagged ISO strings) ----

function toJson(value: unknown): Json {
  if (value instanceof Timestamp) return { __timestamp: value.toDate().toISOString() };
  if (Array.isArray(value)) return value.map(toJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toJson(v)]));
  }
  return value as Json;
}

function fromJson(value: Json): unknown {
  if (Array.isArray(value)) return value.map(fromJson);
  if (value && typeof value === 'object') {
    if (typeof value.__timestamp === 'string')
      return Timestamp.fromDate(new Date(value.__timestamp));
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fromJson(v)]));
  }
  return value;
}

/** Same shape the app reads (Timestamps -> Dates), for checking with the app's schemas. */
function forSchema(value: Json): unknown {
  if (Array.isArray(value)) return value.map(forSchema);
  if (value && typeof value === 'object') {
    if (typeof value.__timestamp === 'string') return new Date(value.__timestamp);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, forSchema(v)]));
  }
  return value;
}

function filePaths(value: Json, found = new Set<string>()): Set<string> {
  if (typeof value === 'string' && FILE_PATH.test(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach((v) => filePaths(v, found));
  else if (value && typeof value === 'object')
    Object.values(value).forEach((v) => filePaths(v, found));
  return found;
}

/** Text left over from `pnpm seed` (SAMPLE labels and placeholder wording). */
const SAMPLE_TEXT =
  /SAMPLE|placeholder|Example (question|answer)|Short summary for|Muhtasari wa|mfano|example\.(com|test)/i;

/** Field paths ("faq.0.q.en") whose text still looks like sample data. */
function leftovers(value: Json, path = '', found: string[] = []): string[] {
  if (typeof value === 'string' && SAMPLE_TEXT.test(value)) found.push(path || '(text)');
  else if (Array.isArray(value))
    value.forEach((v, i) => leftovers(v, path ? `${path}.${i}` : `${i}`, found));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) leftovers(v, path ? `${path}.${k}` : k, found);
  }
  return found;
}

// ---- Step 1: export from the emulators ----

async function exportFromEmulators(): Promise<void> {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
  const app = initializeApp({ projectId: 'demo-wizzy', storageBucket: 'demo-wizzy.appspot.com' });
  const db = getFirestore(app);
  const bucket = getStorage(app).bucket();

  const manifest: Manifest = { docs: [], files: [], skipped: [], warnings: [] };
  const keep = (path: string, data: Json, schema: z.ZodType, id: string) => {
    // An item whose own title/name is still "SAMPLE: …" was never made real: leave it out.
    const record = data as { title?: { en?: string }; name?: string | { en?: string } };
    const name =
      record.title?.en ?? (typeof record.name === 'string' ? record.name : record.name?.en) ?? '';
    if (!path.startsWith('settings/') && name.startsWith('SAMPLE:')) {
      manifest.skipped.push(`${path} (sample item)`);
      return;
    }
    const check = schema.safeParse(
      path.startsWith('settings/') ? forSchema(data) : { ...(forSchema(data) as object), id },
    );
    if (!check.success) {
      manifest.skipped.push(
        `${path} (does not match the app's rules: ${check.error.issues[0]?.path.join('.')})`,
      );
      return;
    }
    manifest.docs.push({ path, data });
    // Edited items can still hold bits of sample text: copy them, but list where to fix.
    for (const field of leftovers(data)) manifest.warnings.push(`${path} → ${field}`);
  };

  try {
    for (const [id, schema] of Object.entries(SITE_DOCS)) {
      const snap = await db.doc(`settings/${id}`).get();
      if (snap.exists) keep(`settings/${id}`, toJson(snap.data()), schema, id);
    }
    for (const [name, schema] of Object.entries(COLLECTIONS)) {
      for (const doc of (await db.collection(name).get()).docs) {
        keep(`${name}/${doc.id}`, toJson(doc.data()), schema, doc.id);
      }
    }
  } catch {
    fail(
      'Could not read the emulators. Start them first with `pnpm emulators`, then run this again.',
    );
  }

  rmSync(OUT_DIR, { recursive: true, force: true });
  const paths = new Set<string>();
  manifest.docs.forEach((d) => filePaths(d.data, paths));
  for (const path of paths) {
    const file = bucket.file(path);
    const [exists] = await file.exists();
    if (!exists) {
      manifest.skipped.push(`file ${path} (missing in local storage)`);
      continue;
    }
    const [bytes] = await file.download();
    const [meta] = await file.getMetadata();
    const target = join(OUT_DIR, 'files', path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
    manifest.files.push({
      path,
      contentType: String(meta.contentType ?? 'application/octet-stream'),
    });
  }
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'content.json'), JSON.stringify(manifest, null, 2));

  console.log(`\nExported to ${OUT_DIR}/ (on this computer only):`);
  console.log(`  documents: ${manifest.docs.length}`);
  manifest.docs.forEach((d) => console.log(`    + ${d.path}`));
  console.log(`  files: ${manifest.files.length}`);
  if (manifest.skipped.length) {
    console.log(`  skipped: ${manifest.skipped.length}`);
    manifest.skipped.forEach((s) => console.log(`    - ${s}`));
  }
  if (manifest.warnings.length) {
    console.log(
      `  still sample text (copied anyway, fix in the live admin): ${manifest.warnings.length}`,
    );
    manifest.warnings.forEach((w) => console.log(`    ! ${w}`));
  }
  console.log('\nNext: pnpm content:copy import --key <service-account.json> --bucket <bucket>\n');
}

// ---- Step 2: import into the real project ----

async function importToProduction(): Promise<void> {
  // Never talk to the emulators in this step.
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

  const keyPath = flag('--key');
  const bucketName = flag('--bucket');
  const confirm = args.includes('--confirm');
  // Free (Spark) plan has no Storage: copy only the text, upload the files later.
  const textOnly = args.includes('--text-only');
  if (!keyPath || !existsSync(keyPath))
    fail('Give the service-account key file: --key <path/to/key.json>');
  if (!bucketName && !textOnly)
    fail(
      'Give the Storage bucket: --bucket <name> (Firebase console → Storage, e.g. my-project.firebasestorage.app)',
    );
  if (!existsSync(join(OUT_DIR, 'content.json'))) fail('Run `pnpm content:copy export` first.');

  let key: { project_id?: string; client_email?: string; private_key?: string };
  try {
    key = JSON.parse(readFileSync(keyPath, 'utf8'));
  } catch {
    fail('The key file is not valid JSON.');
  }
  const projectId = key.project_id;
  if (!projectId || projectId.startsWith('demo-'))
    fail('The key must belong to your real Firebase project.');

  const app = initializeApp({
    credential: cert({ projectId, clientEmail: key.client_email, privateKey: key.private_key }),
    ...(bucketName ? { storageBucket: bucketName } : {}),
  });
  const db = getFirestore(app);
  const manifest = JSON.parse(readFileSync(join(OUT_DIR, 'content.json'), 'utf8')) as Manifest;

  console.log(
    `\n${confirm ? 'COPYING' : 'DRY RUN (nothing is written)'} → project "${projectId}", ${textOnly ? 'text only (no Storage)' : `bucket "${bucketName}"`}\n`,
  );
  let written = 0;
  let kept = 0;
  for (const doc of manifest.docs) {
    const ref = db.doc(doc.path);
    if ((await ref.get()).exists) {
      console.log(`  = ${doc.path} (already in the real project: left as it is)`);
      kept++;
      continue;
    }
    console.log(`  + ${doc.path}`);
    if (confirm) await ref.set(fromJson(doc.data) as Record<string, unknown>);
    written++;
  }
  let uploaded = 0;
  for (const entry of textOnly ? [] : manifest.files) {
    const file = getStorage(app).bucket().file(entry.path);
    if ((await file.exists())[0]) continue;
    if (confirm) {
      await file.save(readFileSync(join(OUT_DIR, 'files', entry.path)), {
        contentType: entry.contentType,
        resumable: false,
        metadata: { cacheControl: 'public, max-age=31536000, immutable' },
      });
    }
    uploaded++;
  }

  console.log(
    `\n  documents ${confirm ? 'copied' : 'to copy'}: ${written}, already there: ${kept}`,
  );
  console.log(
    textOnly
      ? `  files: ${manifest.files.length} skipped (no Storage yet — run again without --text-only later)`
      : `  files ${confirm ? 'uploaded' : 'to upload'}: ${uploaded}`,
  );
  console.log(
    confirm
      ? '\nDone. Refresh the live pages: sign in at <your-site>/admin and press Save on any page (or redeploy on Vercel).\nThen delete the .production-copy folder.\n'
      : '\nLooks right? Run the same command again with --confirm.\n',
  );
}

const mode = args[0];
if (mode === 'export') await exportFromEmulators();
else if (mode === 'import') await importToProduction();
else
  fail(
    'Usage: pnpm content:copy export | import --key <key.json> (--bucket <bucket> | --text-only) [--confirm]',
  );
process.exit(0);
