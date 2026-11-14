import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';

/**
 * Browser Firebase SDK. Public visitors never read/write Firestore from the browser
 * (ARCHITECTURE-ESSENTIAL §3.3); on public pages this is used ONLY for App Check tokens.
 * Import it dynamically (`await import(...)`) so it is not in the initial page bundle.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function firebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(config);
}

let appCheck: AppCheck | null = null;

/**
 * App Check token to send with a public form, or null when App Check isn't configured
 * (local development). The server rejects missing tokens outside the emulators.
 */
export async function getAppCheckToken(): Promise<string | null> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || !config.apiKey || !config.appId) return null;
  try {
    appCheck ??= initializeAppCheck(firebaseApp(), {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: false,
    });
    return (await getToken(appCheck, false)).token;
  } catch {
    return null;
  }
}
