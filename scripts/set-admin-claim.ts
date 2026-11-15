/**
 * Grant or remove admin rights (the `admin: true` custom claim) — A1, ARCHITECTURE §6.
 *
 *   pnpm admin:claim <email>              emulator (default, safe)
 *   pnpm admin:claim <email> --revoke     remove admin rights (also signs the user out)
 *   pnpm admin:claim <email> --prod       REAL project — owner only, needs credentials
 *
 * The account must already exist (sign in once at /admin/login, or create it in the
 * Firebase console). There is deliberately no web endpoint for this.
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const args = process.argv.slice(2);
const email = args
  .find((a) => !a.startsWith('--'))
  ?.trim()
  .toLowerCase();
const prod = args.includes('--prod');
const revoke = args.includes('--revoke');

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fail('Usage: pnpm admin:claim <email> [--revoke] [--prod]');
}

let projectId = 'demo-wizzy';
if (prod) {
  projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '';
  if (!projectId || projectId.startsWith('demo-')) {
    fail('--prod needs NEXT_PUBLIC_FIREBASE_PROJECT_ID set to the real project id.');
  }
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    fail('--prod refused: FIREBASE_AUTH_EMULATOR_HOST is set. Unset it first.');
  }
  // Credentials: Application Default Credentials (`gcloud auth application-default login`)
  // or GOOGLE_APPLICATION_CREDENTIALS pointing to a service-account file (never committed).
} else {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

async function main(): Promise<void> {
  const auth = getAuth(initializeApp({ projectId }));
  const target = prod ? `PRODUCTION project "${projectId}"` : `emulator project "${projectId}"`;

  let user;
  try {
    user = await auth.getUserByEmail(email!);
  } catch {
    fail(`No account with that email in the ${target}. Sign in once first, then re-run.`);
  }

  const claims = { ...(user.customClaims ?? {}) };
  if (revoke) delete claims.admin;
  else claims.admin = true;
  await auth.setCustomUserClaims(user.uid, claims);

  if (revoke) {
    // Ends existing sessions; the server rejects revoked tokens (verifyIdToken checkRevoked).
    await auth.revokeRefreshTokens(user.uid);
    console.log(`Removed admin rights from ${email} in the ${target} and signed them out.`);
  } else {
    console.log(`Granted admin rights to ${email} in the ${target}.`);
    console.log('If they are already signed in, they should sign out and in again.');
  }
}

main().catch((error: unknown) => {
  fail(`Failed: ${error instanceof Error ? error.message : 'unknown error'}`);
});
