# CLAUDE.md
Project-specific instructions for Claude (Claude Code) working on the **Wizzy Inc Services Website** — a bilingual (English/Swahili) site for Panta-wizzy's Graphic Design and Web Development services, with an admin panel for leads and content.

## Read first
1. `ARCHITECTURE-ESSENTIAL.md` — binding rules. If anything below conflicts, that file wins.
2. `AGENTS.md` — your role boundaries and what you may modify.
3. `PRD.md` (what/why) and `ARCHITECTURE.md` (how) when you need detail.

## Stack at a glance
Next.js 15 (App Router) · TypeScript strict · Tailwind + shadcn/ui · React Hook Form + Zod · next-intl (`en`, `sw`) · Firebase (Firestore, Storage, Auth, App Check, Cloud Functions) · Firebase App Hosting · pnpm · Vitest · Playwright.

## Commands
```bash
# setup
pnpm install
cp .env.example .env.local          # then fill values (never commit)

# develop
pnpm dev                            # Next.js on http://localhost:3000
pnpm emulators                      # Firebase emulators (Auth, Firestore, Storage, Functions) + UI on :4000
pnpm dev:all                        # dev + emulators together
pnpm seed                           # load sample data into the emulator (scripts/seed)

# quality
pnpm lint                           # ESLint
pnpm lint:fix
pnpm format                         # Prettier
pnpm typecheck                      # tsc --noEmit
pnpm test                           # Vitest unit tests
pnpm test:watch
pnpm test:rules                     # Firestore/Storage rules tests (needs emulator)
pnpm test:e2e                       # Playwright
pnpm check                          # lint + typecheck + test (run before finishing)

# build
pnpm build
pnpm start

# functions (in /functions)
pnpm --filter functions build
pnpm --filter functions serve       # functions in emulator

# admin
pnpm admin:claim <email>            # grant admin custom claim (emulator by default; --prod needs owner)
```
Deploys are done by CI or by the owner. **Do not run `firebase deploy` yourself.**

## Project structure
```
.
├── PRD.md · ARCHITECTURE.md · ARCHITECTURE-ESSENTIAL.md · AGENTS.md · CLAUDE.md
├── messages/                 en.json, sw.json (UI strings)
├── public/                   static assets, favicons, og images
├── src/
│   ├── app/
│   │   ├── [locale]/         public pages: home, services, portfolio, pricing, about, contact, faq, quote
│   │   ├── admin/            login, dashboard, leads, services, packages, portfolio, testimonials
│   │   ├── api/revalidate/   on-demand ISR
│   │   ├── sitemap.ts · robots.ts
│   ├── components/
│   │   ├── ui/               shadcn primitives (no business logic)
│   │   ├── layout/ sections/ portfolio/ pricing/ forms/ admin/
│   ├── lib/
│   │   ├── firebase/         client.ts (browser), admin.ts (server-only)
│   │   ├── data/             server read functions per collection
│   │   ├── schemas/          Zod schemas = source of truth for types
│   │   ├── security/         App Check verify, rate limit, honeypot
│   │   ├── i18n/             locale helpers, `localized()` fallback to en
│   │   └── utils/            formatTZS, formatPhone, slugify
│   ├── styles/               globals.css, tokens.css
│   └── middleware.ts         locale routing
├── functions/src/            onLeadCreated, setAdminClaim, cleanupOrphanUploads
├── scripts/                  seed/, set-admin-claim.ts
├── tests/                    unit/, rules/, e2e/
├── firestore.rules · storage.rules · firestore.indexes.json · firebase.json · apphosting.yaml
└── .env.example
```

## Conventions
- **Files:** components `PascalCase.tsx`; everything else `kebab-case.ts`. One component per file.
- **Exports:** named exports (default export only where Next.js requires it: `page.tsx`, `layout.tsx`, etc.).
- **Imports:** use the `@/` alias for `src/`.
- **Types:** derive from Zod (`type Lead = z.infer<typeof leadSchema>`). No duplicate interfaces.
- **Server vs client:** Server Components by default; `"use client"` only where needed. `admin.ts` imports `server-only`.
- **Data:** public pages read via `src/lib/data/*`; no Firestore calls from public client components.
- **Strings:** never hard-code UI text — use `useTranslations` / `getTranslations` and add keys to both locale files.
- **Bilingual DB fields:** `{ en, sw }`; read with `localized(field, locale)`.
- **Money:** integer TZS; display with `formatTZS()`.
- **Styling:** Tailwind classes using token-based theme values; no raw hex, no inline styles.
- **Images:** `next/image` with `sizes` and meaningful `alt`.
- **Errors:** Server Actions return `{ ok: true, data } | { ok: false, error }`; never throw raw errors to the client.

## Common tasks — how to do them here
**Add a public page**
1. Create `src/app/[locale]/<name>/page.tsx` (Server Component) with `generateMetadata`.
2. Add strings to `messages/en.json` and `messages/sw.json`.
3. Add the route to `sitemap.ts` and the nav (if needed).
4. Add a Playwright smoke test in `tests/e2e/`.

**Add a field to a collection**
1. Update the Zod schema in `src/lib/schemas/`.
2. Update `src/lib/data/<collection>.ts`, admin form, and seed data.
3. If it affects access, hand off to Security (rules + rules tests).
4. Update the collection section in `ARCHITECTURE.md`.

**Change the quote form**
- Schema: `src/lib/schemas/lead.ts` · UI: `src/components/forms/quote-form/` · Action: `src/app/[locale]/quote/actions.ts` · Email: `functions/src/on-lead-created.ts`. Keep all four in sync.

## Gotchas
- Swahili locale code is `sw` (not `sw-TZ`) in routes; use `sw-TZ` only for `Intl` formatting.
- Phone validation accepts `+255XXXXXXXXX` and `0XXXXXXXXX`; normalise to `+255` before saving.
- WhatsApp links: `https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=<encoded message>` — number without `+`.
- After admin edits, public pages update only after `/api/revalidate` is called.
- Emulator data is wiped on restart unless you run `pnpm emulators` (which imports/exports `./.emulator-data`).

## Working style for Claude
- Start non-trivial tasks with a short plan; confirm with the owner before large or risky changes.
- Keep diffs focused; don't reformat untouched files.
- Run `pnpm check` (and `pnpm test:rules` if relevant) before saying a task is done, and report actual output.
- Never invent testimonials, client names, prices or portfolio items — use `TODO: real content`.
- Ask before: adding dependencies, editing protected files (see `AGENTS.md` §4), touching security rules, or anything involving production.
- Explain changes simply; the owner is a Multimedia Technology & Animation student, so short "why" notes in PRs are welcome.
