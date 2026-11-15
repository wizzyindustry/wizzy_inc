'use client';

import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { hasAdminClaim } from '@/lib/security/admin-claims';
import { firebaseApp } from './client';

/**
 * Firebase Auth in the browser — admin panel only (no public sign-up).
 * For "demo-" projects (local emulators) it connects to the Auth emulator automatically.
 */
let auth: Auth | null = null;

export function adminAuthClient(): Auth {
  if (auth) return auth;
  auth = getAuth(firebaseApp());
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.startsWith('demo-')) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  return auth;
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(adminAuthClient(), email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(adminAuthClient(), new GoogleAuthProvider());
}

export function signOutAdmin() {
  return signOut(adminAuthClient());
}

/** Fresh check of the `admin` claim (forces a token refresh so a new claim is seen). */
export async function userIsAdmin(user: User): Promise<boolean> {
  const result = await user.getIdTokenResult(true);
  return hasAdminClaim(result.claims);
}
