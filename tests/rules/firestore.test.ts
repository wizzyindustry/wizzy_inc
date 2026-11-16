import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wizzy',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'services/published'), { published: true });
    await setDoc(doc(db, 'services/draft'), { published: false });
    await setDoc(doc(db, 'leads/lead1'), { name: 'Test', status: 'new' });
    await setDoc(doc(db, 'counters/leads'), { year: 2026, value: 1 });
    await setDoc(doc(db, 'settings/site'), { email: 'placeholder' });
  });
});

const publicDb = () => env.unauthenticatedContext().firestore();
const userDb = () => env.authenticatedContext('user1').firestore();
const adminDb = () => env.authenticatedContext('admin1', { admin: true }).firestore();

describe('public content collections', () => {
  for (const col of ['services', 'packages', 'portfolio', 'testimonials']) {
    it(`${col}: public can read published docs only`, async () => {
      await env.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), `${col}/p`), { published: true });
        await setDoc(doc(ctx.firestore(), `${col}/d`), { published: false });
      });
      await assertSucceeds(getDoc(doc(publicDb(), `${col}/p`)));
      await assertFails(getDoc(doc(publicDb(), `${col}/d`)));
    });

    it(`${col}: only admins can write`, async () => {
      await assertFails(setDoc(doc(publicDb(), `${col}/x`), { published: true }));
      await assertFails(setDoc(doc(userDb(), `${col}/x`), { published: true }));
      await assertSucceeds(setDoc(doc(adminDb(), `${col}/x`), { published: false }));
    });
  }

  it('admins can read unpublished drafts', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), 'services/draft')));
  });
});

describe('settings', () => {
  it('is publicly readable but only admin-writable', async () => {
    await assertSucceeds(getDoc(doc(publicDb(), 'settings/site')));
    await assertFails(setDoc(doc(userDb(), 'settings/site'), { email: 'x' }));
    await assertSucceeds(setDoc(doc(adminDb(), 'settings/site'), { email: 'y' }));
  });
});

describe('leads (private)', () => {
  it('unauthenticated users cannot read, create, update or delete leads', async () => {
    await assertFails(getDoc(doc(publicDb(), 'leads/lead1')));
    await assertFails(setDoc(doc(publicDb(), 'leads/new'), { name: 'Spam' }));
    await assertFails(updateDoc(doc(publicDb(), 'leads/lead1'), { status: 'won' }));
    await assertFails(deleteDoc(doc(publicDb(), 'leads/lead1')));
  });

  it('signed-in non-admins cannot read or create leads', async () => {
    await assertFails(getDoc(doc(userDb(), 'leads/lead1')));
    await assertFails(setDoc(doc(userDb(), 'leads/new'), { name: 'Spam' }));
  });

  it('admins can read and update but not create or delete', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), 'leads/lead1')));
    await assertSucceeds(updateDoc(doc(adminDb(), 'leads/lead1'), { status: 'contacted' }));
    await assertFails(setDoc(doc(adminDb(), 'leads/new'), { name: 'X' }));
    await assertFails(deleteDoc(doc(adminDb(), 'leads/lead1')));
  });
});

describe('subscribers (private)', () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'subscribers/s1'), { email: 'a@example.test' });
    });
  });

  it('public and signed-in non-admins cannot read, create or delete subscribers', async () => {
    for (const db of [publicDb(), userDb()]) {
      await assertFails(getDoc(doc(db, 'subscribers/s1')));
      await assertFails(setDoc(doc(db, 'subscribers/s2'), { email: 'b@example.test' }));
      await assertFails(deleteDoc(doc(db, 'subscribers/s1')));
    }
  });

  it('admins can read but not write (the server adds and removes subscribers)', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), 'subscribers/s1')));
    await assertFails(setDoc(doc(adminDb(), 'subscribers/s2'), { email: 'b@example.test' }));
    await assertFails(updateDoc(doc(adminDb(), 'subscribers/s1'), { email: 'c@example.test' }));
    await assertFails(deleteDoc(doc(adminDb(), 'subscribers/s1')));
  });
});

describe('counters and unknown collections', () => {
  it('counters are closed to every client, including admins', async () => {
    await assertFails(getDoc(doc(publicDb(), 'counters/leads')));
    await assertFails(getDoc(doc(adminDb(), 'counters/leads')));
    await assertFails(setDoc(doc(adminDb(), 'counters/leads'), { value: 99 }));
  });

  it('rateLimits (server-only) are closed to every client', async () => {
    await assertFails(getDoc(doc(publicDb(), 'rateLimits/abc')));
    await assertFails(setDoc(doc(publicDb(), 'rateLimits/abc'), { count: 0 }));
    await assertFails(getDoc(doc(adminDb(), 'rateLimits/abc')));
    await assertFails(setDoc(doc(adminDb(), 'rateLimits/abc'), { count: 0 }));
  });

  it('unknown collections are denied by default', async () => {
    await assertFails(getDoc(doc(adminDb(), 'anything/else')));
    await assertFails(setDoc(doc(adminDb(), 'anything/else'), { a: 1 }));
  });
});
