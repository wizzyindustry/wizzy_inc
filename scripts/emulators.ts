/**
 * `pnpm emulators` — start the Firebase emulators for local development.
 * Saved data in ./.emulator-data is loaded when present and written back on exit.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const DATA_DIR = './.emulator-data';
// TODO(slice 10): add `functions` once the functions/ package exists.
const ONLY = 'auth,firestore,storage';
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
