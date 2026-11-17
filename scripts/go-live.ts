/**
 * Guided one-command setup of the REAL Firebase project (owner only):
 *
 *   pnpm go-live
 *
 * 1. Finds the service-account key you downloaded (Downloads folder) — read from disk only,
 *    never printed or copied.
 * 2. Uploads the security rules and indexes (firestore.rules, storage.rules).
 * 3. Copies your locally edited content (.production-copy/, from `pnpm content:copy export`),
 *    after showing a practice run and asking "yes".
 * 4. Makes your email the admin (creates the account if needed and prints a link to set
 *    the password).
 *
 * Every step can be re-run safely: nothing existing is overwritten.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { getStorage } from 'firebase-admin/storage';
import { cloudinaryConfig } from '../src/lib/media/cloudinary';

const rl = createInterface({ input: stdin, output: stdout });
const ask = async (question: string) => (await rl.question(question)).trim();
// Optional answers up front: `pnpm go-live --yes --email you@example.com`.
const cliArgs = process.argv.slice(2);
const autoYes = cliArgs.includes('--yes');
const cliEmail = cliArgs[cliArgs.indexOf('--email') + 1];
const yes = async (question: string) => {
  if (autoYes) {
    console.log(`${question} (yes/no) yes`);
    return true;
  }
  return /^(y|yes|ndio)$/i.test(await ask(`${question} (yes/no) `));
};

function stop(message: string): never {
  console.error(`\n✖ ${message}\n`);
  rl.close();
  process.exit(1);
}

function step(n: number, title: string) {
  console.log(`\n── Step ${n}: ${title} ──`);
}

/** Newest Firebase key file in Downloads, or a path the owner types. */
async function findKeyFile(): Promise<string> {
  const downloads = join(homedir(), 'Downloads');
  const candidates = existsSync(downloads)
    ? readdirSync(downloads)
        .filter((f) => /firebase-adminsdk.*\.json$|^key\.json$/i.test(f))
        .map((f) => join(downloads, f))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
    : [];
  if (candidates[0] && (await yes(`Use the key file ${candidates[0]}?`))) return candidates[0];
  const typed = (await ask('Full path of your key file (.json): ')).replace(/^"|"$/g, '');
  if (!existsSync(typed)) stop('That file does not exist.');
  return typed;
}

async function main(): Promise<void> {
  console.log('\nWizzy Inc — put the website live on your real Firebase project\n');

  // ---- Key file and project ----
  step(1, 'Your Firebase key file');
  const keyPath = await findKeyFile();
  let key: { project_id?: string; client_email?: string; private_key?: string };
  try {
    key = JSON.parse(readFileSync(keyPath, 'utf8'));
  } catch {
    stop('That is not a Firebase key file (it must be the .json from "Generate new private key").');
  }
  const projectId = key.project_id;
  if (!projectId || !key.private_key || projectId.startsWith('demo-')) {
    stop('This key does not belong to a real Firebase project.');
  }
  console.log(`  ✔ Project: ${projectId}`);

  // Never touch the local emulators from here.
  for (const name of [
    'FIRESTORE_EMULATOR_HOST',
    'FIREBASE_STORAGE_EMULATOR_HOST',
    'FIREBASE_AUTH_EMULATOR_HOST',
  ]) {
    delete process.env[name];
  }
  const app = initializeApp({
    credential: cert({ projectId, clientEmail: key.client_email, privateKey: key.private_key }),
  });

  // ---- Storage bucket (found automatically) ----
  let bucket = '';
  for (const name of [`${projectId}.firebasestorage.app`, `${projectId}.appspot.com`]) {
    try {
      if ((await getStorage(app).bucket(name).exists())[0]) {
        bucket = name;
        break;
      }
    } catch {
      // try the next name
    }
  }
  // Free (Spark) plan: no Storage. Pictures go to Cloudinary when CLOUDINARY_URL is set;
  // otherwise go live with the text now and add pictures later.
  const cloudinary = bucket ? null : cloudinaryConfig();
  if (bucket) {
    console.log(`  ✔ Storage: ${bucket}`);
  } else if (cloudinary) {
    console.log(`  ✔ Pictures: Cloudinary (${cloudinary.cloudName})`);
  } else {
    console.log(
      '  ! No Storage (free plan): going live with text only — no pictures or files yet.',
    );
    console.log(
      '    Later: set CLOUDINARY_URL (free) or turn on Storage, then run `pnpm go-live` again.',
    );
  }

  // ---- Security rules ----
  step(2, 'Upload the security rules');
  // Uploaded with the key itself (the Firebase CLI needs extra Google Cloud permissions).
  const credential = cert({
    projectId,
    clientEmail: key.client_email,
    privateKey: key.private_key,
  });
  try {
    const rules = getSecurityRules(app);
    await rules.releaseFirestoreRulesetFromSource(readFileSync('firestore.rules', 'utf8'));
    if (bucket) {
      await rules.releaseStorageRulesetFromSource(readFileSync('storage.rules', 'utf8'), bucket);
    }
  } catch (error) {
    stop(
      `The rules could not be uploaded (${error instanceof Error ? error.message : 'unknown error'}). Check that "Firestore Database" is created in the Firebase console, then run \`pnpm go-live\` again.`,
    );
  }
  console.log('  ✔ Rules uploaded');

  // Indexes the site's lists need (from firestore.indexes.json). Existing ones are kept.
  const { access_token: token } = await credential.getAccessToken();
  const { indexes } = JSON.parse(readFileSync('firestore.indexes.json', 'utf8')) as {
    indexes: { collectionGroup: string; queryScope: string; fields: unknown[] }[];
  };
  let indexesFailed = 0;
  for (const { collectionGroup, ...index } of indexes) {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${collectionGroup}/indexes`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(index),
      },
    );
    if (!res.ok && res.status !== 409) indexesFailed++;
  }
  if (indexesFailed) {
    console.log(`  ! ${indexesFailed} indexes could not be created: the key is not allowed to.`);
    console.log('    Google Cloud console → IAM → the "firebase-adminsdk" account → add the role');
    console.log('    "Cloud Datastore Index Admin", then run `pnpm go-live` again.');
  } else {
    console.log(`  ✔ Indexes requested (${indexes.length}; Google builds them in a few minutes)`);
  }

  // ---- Content ----
  step(3, 'Copy your content');
  if (!existsSync(join('.production-copy', 'content.json'))) {
    console.log('  (No exported content found — skipping. To copy later: start `pnpm emulators`,');
    console.log('   run `pnpm content:copy export`, then `pnpm go-live` again.)');
  } else {
    const copy = (confirm: boolean) =>
      spawnSync(
        'pnpm',
        [
          'content:copy',
          'import',
          '--key',
          `"${keyPath}"`,
          ...(bucket ? ['--bucket', bucket] : cloudinary ? ['--cloudinary'] : ['--text-only']),
          ...(confirm ? ['--confirm'] : []),
        ],
        { stdio: 'inherit', shell: true },
      );
    if (copy(false).status !== 0) stop('The practice run failed (see the message above).');
    if (await yes('Copy this content to the live site now?')) {
      if (copy(true).status !== 0) stop('Copying failed (see the message above).');
      console.log('  ✔ Content copied');
    } else {
      console.log('  Skipped. Run `pnpm go-live` again when you are ready.');
    }
  }

  // ---- Admin account ----
  step(4, 'Make yourself the admin');
  const email = (
    cliArgs.includes('--email') && cliEmail
      ? cliEmail
      : await ask('Your email for signing in to the admin panel: ')
  ).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) stop('That does not look like an email address.');
  const auth = getAuth(app);
  let user = await auth.getUserByEmail(email).catch(() => null);
  let newAccount = false;
  if (!user) {
    try {
      user = await auth.createUser({ email });
      newAccount = true;
    } catch {
      stop(
        'Could not create the account. In the Firebase console open "Authentication" → Get started → enable Email/Password, then run `pnpm go-live` again.',
      );
    }
  }
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin: true });
  console.log(`  ✔ ${email} is now the admin`);
  if (newAccount) {
    const link = await auth.generatePasswordResetLink(email);
    console.log('\n  Open this link once to choose your password (it is only for you):');
    console.log(`  ${link}`);
  }

  // ---- Last things (one click each, in the browser) ----
  console.log('\n── Almost done — 2 clicks in the browser ──');
  console.log('  1. Firebase console → Authentication → Settings → Authorised domains →');
  console.log('     Add domain → your Vercel address (e.g. your-project.vercel.app).');
  console.log('  2. Open https://<your-site>/admin, sign in, and press Save on Settings.');
  console.log('     The public pages then show your content.');
  console.log('\n  Then delete the key file from Downloads and the .production-copy folder.\n');
  rl.close();
}

main().catch((error: unknown) => {
  stop(error instanceof Error ? error.message : 'Something went wrong.');
});
