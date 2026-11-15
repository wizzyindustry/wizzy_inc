# Wizzy Inc Services Website

Bilingual (English / Kiswahili) website for Panta-wizzy's Graphic Design and Web Development services.

- **What & why:** [PRD.md](PRD.md)
- **How it works:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Binding rules for AI tools:** [ARCHITECTURE-ESSENTIAL.md](ARCHITECTURE-ESSENTIAL.md), [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md)

## Quick start

Needs Node 20+, pnpm 10 and Java 21+ (for the Firebase emulators).

```bash
pnpm install
cp .env.example .env.local   # fill in values; never commit this file
pnpm dev                     # http://localhost:3000 -> redirects to /en
```

## Local data (emulators)

```bash
pnpm emulators   # terminal 1: Auth, Firestore, Storage, Functions + UI on http://localhost:4000
pnpm seed        # terminal 2: loads clearly-labelled SAMPLE data (never real content)
```

To make `pnpm dev` read the emulators, set these in `.env.local`
(see the note at the bottom of `.env.example`): `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-wizzy`,
`FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199`.

## Lead emails (Cloud Function)

`functions/` holds the Cloud Functions (separate pnpm package). `onLeadCreated` emails the owner
when a new quote request is saved (PRD A3 / FR-5), using [Resend](https://resend.com).

- **Locally** the email is built but **never sent** (dry run); the emulator log shows the reference
  number. `pnpm emulators` creates `functions/.env.local` with fake values the first time.
- **Before the first deploy** (owner):
  1. Create a Resend account, verify the sending domain, create an API key.
  2. `firebase functions:secrets:set RESEND_API_KEY`
  3. Put `OWNER_EMAIL`, `EMAIL_FROM` and `SITE_URL` in `functions/.env.<project-id>`
     (git-ignored), or answer the prompts during deploy.
  4. Check `REGION` in `functions/src/config.ts` matches the Firestore location.

## Quality checks

```bash
pnpm check        # lint + typecheck + unit tests
pnpm test:rules   # Firestore/Storage security-rules tests (starts emulators)
pnpm test:e2e     # Playwright smoke tests (run `pnpm exec playwright install chromium` once)
pnpm build
```

## Status

Phase 0 (setup) — placeholder home page only. Brand colours and fonts in
`src/styles/tokens.css` are placeholders (`TODO: real content`).
