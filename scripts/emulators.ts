/**
 * `pnpm emulators` — build the Cloud Functions, then start the Firebase emulators.
 * Saved data in ./.emulator-data is loaded when present and written back on exit.
 * In the emulator, onLeadCreated builds the owner email but does not send it (dry run).
 */
import { execSync, spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const DATA_DIR = './.emulator-data';
const ONLY = 'auth,firestore,storage,functions';

// Emulator-only settings for Cloud Functions (approved by the owner). Fake values, no secrets;
// git-ignored. Production values are set at deploy time (see functions/src/config.ts).
const FUNCTIONS_ENV = './functions/.env.local';
if (!existsSync(FUNCTIONS_ENV)) {
  writeFileSync(
    FUNCTIONS_ENV,
    [
      '# Created by `pnpm emulators` — emulator only, fake values. Never put real secrets here.',
      'OWNER_EMAIL=owner@example.test',
      'EMAIL_FROM=Wizzy Inc (emulator) <noreply@example.test>',
      'SITE_URL=http://localhost:3000',
      '',
    ].join('\n'),
  );
}

execSync('pnpm --filter functions build', { stdio: 'inherit' });

const args = [
  'emulators:start',
  '--only',
  ONLY,
  '--project',
  'demo-wizzy',
  '--export-on-exit',
  DATA_DIR,
];
if (existsSync(`${DATA_DIR}/firebase-export-metadata.json`)) args.push('--import', DATA_DIR);

const child = spawn('firebase', args, { stdio: 'inherit', shell: process.platform === 'win32' });
child.on('exit', (code) => process.exit(code ?? 0));
