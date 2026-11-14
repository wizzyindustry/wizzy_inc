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
pnpm emulators   # terminal 1: Auth, Firestore, Storage + UI on http://localhost:4000
pnpm seed        # terminal 2: loads clearly-labelled SAMPLE data (never real content)
```

To make `pnpm dev` read the emulators, set these in `.env.local`
(see the note at the bottom of `.env.example`): `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-wizzy`,
`FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199`.

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
