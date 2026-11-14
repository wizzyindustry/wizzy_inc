import 'server-only';
import { adminAppCheck } from '@/lib/firebase/admin';

/**
 * Verify the Firebase App Check token sent with a public form.
 * App Check tokens cannot be issued for the local emulators, so verification is skipped
 * ONLY when FIRESTORE_EMULATOR_HOST is set (local development). Production never sets it.
 */
export async function verifyAppCheck(token: string | null | undefined): Promise<boolean> {
  if (process.env.FIRESTORE_EMULATOR_HOST) return true;
  if (!token) return false;
  try {
    await adminAppCheck().verifyToken(token);
    return true;
  } catch {
    return false;
  }
}
