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
