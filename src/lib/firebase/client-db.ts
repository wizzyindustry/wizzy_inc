'use client';

import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseApp } from './client';

/**
 * Firestore in the browser — ADMIN PANEL ONLY (ARCHITECTURE §3: admin pages read with the
 * signed-in admin's token and security rules enforce access). Public pages never use this.
 */
let db: Firestore | null = null;

export function adminDbClient(): Firestore {
  if (db) return db;
  db = getFirestore(firebaseApp());
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.startsWith('demo-')) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  return db;
}
