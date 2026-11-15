import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Firebase Admin SDK — SERVER ONLY. Never import from a client component.
 * Credentials: FIREBASE_SERVICE_ACCOUNT_KEY (base64 JSON) when set; otherwise Application
 * Default Credentials (App Hosting) or the emulators (FIRESTORE_EMULATOR_HOST etc.).
 */
function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-wizzy';
  // "demo-" projects only exist in the emulators, so verify sign-ins against the Auth
  // emulator there (its tokens are unsigned and must never be accepted in production).
  if (projectId.startsWith('demo-')) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099';
  }
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) {
    const serviceAccount = JSON.parse(Buffer.from(key, 'base64').toString('utf8'));
    return initializeApp({ credential: cert(serviceAccount), storageBucket });
  }
  return initializeApp({ projectId, storageBucket });
}

export const adminDb = () => getFirestore(adminApp());
export const adminAuth = () => getAuth(adminApp());
export const adminStorage = () => getStorage(adminApp());
export const adminAppCheck = () => getAppCheck(adminApp());
