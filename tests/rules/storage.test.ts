import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

const small = new Uint8Array([1, 2, 3]);
const tooBig = new Uint8Array(5 * 1024 * 1024 + 1);

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wizzy',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(ref(ctx.storage(), 'portfolio/p1/cover.png'), small, {
      contentType: 'image/png',
    });
    await uploadBytes(ref(ctx.storage(), 'site/hero/bg.webp'), small, {
      contentType: 'image/webp',
    });
    await uploadBytes(ref(ctx.storage(), 'quotes/lead1/brief.pdf'), small, {
      contentType: 'application/pdf',
    });
  });
});

const publicStorage = () => env.unauthenticatedContext().storage();
const userStorage = () => env.authenticatedContext('user1').storage();
const adminStorage = () => env.authenticatedContext('admin1', { admin: true }).storage();

describe('portfolio/**', () => {
  it('is publicly readable', async () => {
    await assertSucceeds(getBytes(ref(publicStorage(), 'portfolio/p1/cover.png')));
  });

  it('only admins can upload allowed image types up to 5 MB', async () => {
    const png = { contentType: 'image/png' };
    await assertFails(uploadBytes(ref(publicStorage(), 'portfolio/p2/a.png'), small, png));
    await assertFails(uploadBytes(ref(userStorage(), 'portfolio/p2/a.png'), small, png));
    await assertSucceeds(uploadBytes(ref(adminStorage(), 'portfolio/p2/a.png'), small, png));
    await assertFails(
      uploadBytes(ref(adminStorage(), 'portfolio/p2/a.exe'), small, {
        contentType: 'application/octet-stream',
      }),
    );
    await assertFails(uploadBytes(ref(adminStorage(), 'portfolio/p2/big.png'), tooBig, png));
  });
});

describe('site/**', () => {
  it('is publicly readable', async () => {
    await assertSucceeds(getBytes(ref(publicStorage(), 'site/hero/bg.webp')));
  });

  it('only admins can upload images (incl. SVG logos) up to 5 MB', async () => {
    const svg = { contentType: 'image/svg+xml' };
    await assertFails(uploadBytes(ref(publicStorage(), 'site/tools/a.svg'), small, svg));
    await assertFails(uploadBytes(ref(userStorage(), 'site/tools/a.svg'), small, svg));
    await assertSucceeds(uploadBytes(ref(adminStorage(), 'site/tools/a.svg'), small, svg));
    await assertFails(
      uploadBytes(ref(adminStorage(), 'site/tools/page.html'), small, { contentType: 'text/html' }),
    );
    await assertFails(
      uploadBytes(ref(adminStorage(), 'site/hero/big.png'), tooBig, { contentType: 'image/png' }),
    );
  });

  it('only admins can delete', async () => {
    await assertFails(deleteObject(ref(publicStorage(), 'site/hero/bg.webp')));
    await assertFails(deleteObject(ref(userStorage(), 'site/hero/bg.webp')));
    await assertSucceeds(deleteObject(ref(adminStorage(), 'site/hero/bg.webp')));
  });
});

describe('quotes/**', () => {
  it('is readable by admins only', async () => {
    await assertFails(getBytes(ref(publicStorage(), 'quotes/lead1/brief.pdf')));
    await assertFails(getBytes(ref(userStorage(), 'quotes/lead1/brief.pdf')));
    await assertSucceeds(getBytes(ref(adminStorage(), 'quotes/lead1/brief.pdf')));
  });

  it('no client can upload (server writes only)', async () => {
    const pdf = { contentType: 'application/pdf' };
    await assertFails(uploadBytes(ref(publicStorage(), 'quotes/lead2/x.pdf'), small, pdf));
    await assertFails(uploadBytes(ref(adminStorage(), 'quotes/lead2/x.pdf'), small, pdf));
  });
});

describe('unknown paths', () => {
  it('are denied by default', async () => {
    await assertFails(
      uploadBytes(ref(adminStorage(), 'other/x.png'), small, { contentType: 'image/png' }),
    );
  });
});
