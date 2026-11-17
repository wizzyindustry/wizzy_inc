# Wizzy Inc Services Website

A bilingual (English / Kiswahili) business website for **Wizzy Inc**: Panta-wizzy's graphic
design and web development studio in Tanzania. Visitors can browse services, prices and past
work, request a quote, and contact the business. The owner manages everything from a private
admin panel: leads, page content, blog posts and newsletter subscribers.

> **Status:** feature-complete for launch (Phases 1 – 1.3). Remaining before going live:
> real business content (texts, photos, numbers), legal review of the Privacy Policy and Terms,
> and the production Firebase setup described in [Deployment](#deployment).

---

## Contents

- [What the site does](#what-the-site-does)
- [Tech stack](#tech-stack)
- [Getting started (local)](#getting-started-local)
- [Everyday commands](#everyday-commands)
- [Project structure](#project-structure)
- [How content works](#how-content-works)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Testing](#testing)
- [Security and privacy](#security-and-privacy)
- [Conventions for contributors](#conventions-for-contributors)
- [More documentation](#more-documentation)

---

## What the site does

### Public website (`/en/…` and `/sw/…`)

| Page | What's on it |
|---|---|
| **Home** | Hero, our story with fact cards, services as flip cards, partner logos, impact numbers, why choose us, featured work, process, testimonials, FAQ, office map, contact options and newsletter sign-up |
| **Services** | All services by category; one page per service with prices, what's included and FAQ |
| **Portfolio** | Case studies with "View project", "View Git repo" or "View design" links |
| **Pricing** | Packages (Basic / Standard / Premium) in TZS |
| **Quote** | Multi-step quote request with file uploads; returns a reference such as `WZ-2026-0042` |
| **Contact** | Contact form, WhatsApp, phone and email |
| **Company menu** | About, Blog, Support, Offices (with OpenStreetMap maps), Press (leadership, media downloads, brand colours) |
| **FAQ, Privacy, Terms, Cookies** | Information and legal pages (the legal texts are drafts until reviewed) |

Also included: a cookie consent banner, a "Stay updated" email newsletter with welcome email and
one-click unsubscribe, a WhatsApp button, SEO metadata and sitemap, a loading animation, and
scroll animations that switch off when the visitor's device is set to "reduce motion".

### Admin panel (`/admin`)

Only for accounts with an `admin` claim (there is no public sign-up).

- **Work:** dashboard, leads inbox (status, notes, attachments), analytics, newsletter subscribers
  (list, CSV download, remove).
- **Website content:** services, packages, portfolio, testimonials, blog posts, About page, company
  info (story, partners, impact numbers, offices), Support page, Press page.
- **Site:** settings (contact details, hero image, FAQ, "Why choose us"), legal pages.

Every text has an English and a Swahili version. The admin flags anything that is still
missing its Swahili text, and the site shows English until the Swahili is added.

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Server Components, ISR), React 19, TypeScript (strict) |
| Styling | Tailwind CSS with design tokens (`src/styles/tokens.css`), shadcn/ui-style primitives, lucide icons |
| Forms & validation | React Hook Form + [Zod](https://zod.dev). Zod schemas are the single source of truth for types |
| Languages | [next-intl](https://next-intl.dev): `en` and `sw`, strings in `messages/*.json` |
| Backend | Firebase: Firestore (data), Storage (files), Auth (admin sign-in), App Check (spam protection), Cloud Functions (emails) |
| Email | [Resend](https://resend.com) (lead notifications and newsletter welcome emails) |
| Tests | Vitest (unit and security rules), Playwright (end-to-end) |
| Package manager | pnpm (workspace: the app plus `functions/`) |

---

## Getting started (local)

Everything runs on your computer against the **Firebase emulators**: no real Firebase project
or internet services needed, and nothing you do locally can touch production data.

### 1. Requirements

- **Node.js 20 or newer** (22 recommended)
- **pnpm 10**: `npm install -g pnpm` (or `corepack enable`)
- **Java 21 or newer**: needed by the Firebase emulators
- **Firebase CLI** comes with the project (`pnpm exec firebase …`)

### 2. Install and configure

```bash
pnpm install
cp .env.example .env.local
```

For local work, set these in `.env.local` (the other values can stay empty):

```bash
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-wizzy
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

`demo-wizzy` is an emulator-only project, so it can never reach real Firebase.
**Never commit `.env.local`.**

### 3. Run it

Use two terminals:

```bash
# Terminal 1: Firebase emulators (Auth, Firestore, Storage, Functions) + UI at http://localhost:4000
pnpm emulators

# Terminal 2: first time only: load clearly labelled SAMPLE data and test accounts
pnpm seed
# then start the website at http://localhost:3000
pnpm dev
```

### 4. Sign in to the admin panel

Open <http://localhost:3000/admin> and use the emulator-only account created by `pnpm seed`:

| Email | Password | Role |
|---|---|---|
| `admin@example.test` | `emulator-only-password` | admin |
| `not-admin@example.test` | `emulator-only-password` | signed in, no admin rights (for testing) |

### Keeping your local edits

`pnpm emulators` loads saved data from `./.emulator-data` and saves it when it shuts down
normally (Ctrl+C). If you stop it any other way, save first:

```bash
pnpm exec firebase emulators:export ./.emulator-data --force --project demo-wizzy
```

Running `pnpm seed` again **replaces** content with fresh sample data.

---

## Everyday commands

| Command | What it does |
|---|---|
| `pnpm dev` | Website in development mode (<http://localhost:3000>) |
| `pnpm emulators` | Firebase emulators with saved local data |
| `pnpm seed` | Load SAMPLE data and test accounts into the emulators |
| `pnpm check` | Lint + type check + unit tests (**run before every commit**) |
| `pnpm test:rules` | Firestore and Storage security-rules tests (starts its own emulators) |
| `pnpm test:e2e` | Playwright browser tests (builds and starts the site) |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm format` | Format with Prettier |
| `pnpm admin:claim <email>` | Give an account admin rights (emulator; `--prod` for the real project, owner only; `--revoke` to remove) |
| `pnpm --filter functions build` | Build the Cloud Functions |

---

## Project structure

```
.
├── messages/               en.json, sw.json: every UI text, in both languages
├── public/                 static files
├── src/
│   ├── app/
│   │   ├── [locale]/       public pages (home, services, portfolio, pricing, quote, contact,
│   │   │                   about, blog, support, offices, press, faq, legal, unsubscribe)
│   │   ├── admin/          admin panel pages and Server Actions
│   │   ├── api/revalidate/ refreshes cached pages after admin edits
│   │   └── sitemap.ts, robots.ts
│   ├── components/         ui/ (primitives), layout/, sections/, forms/, admin/, blog/, press/ …
│   ├── lib/
│   │   ├── data/           server-side reads, one file per collection
│   │   ├── schemas/        Zod schemas (source of truth for all data shapes)
│   │   ├── security/       App Check, rate limiting, honeypot, admin check, file checks
│   │   ├── firebase/       client.ts (browser) and admin.ts (server only)
│   │   ├── i18n/           locale routing and helpers
│   │   └── utils/          formatting (TZS, phone, dates), CSV, colours …
│   └── styles/             globals.css, tokens.css (colours, radius, fonts)
├── functions/src/          Cloud Functions: lead email, newsletter welcome email
├── scripts/                emulators launcher, seed data, admin-claim tool
├── tests/                  unit/, rules/, e2e/
├── firestore.rules, storage.rules, firestore.indexes.json, firebase.json, apphosting.yaml
└── docs/                   decisions (ADRs), task notes per phase, Swahili glossary
```

---

## How content works

- **All business content lives in Firestore** and is edited in `/admin`. The code contains no
  real business texts, prices or client names: sample data is always labelled `SAMPLE:`, and
  missing real content is marked `TODO: real content`.
- **Bilingual fields** are stored as `{ en, sw }` and read with `localized(field, locale)`, which
  falls back to English.
- **Money** is stored as whole Tanzanian shillings and shown with `formatTZS()`.
- **Pages are cached** (ISR). When the admin saves, the server refreshes the public pages
  automatically; otherwise they refresh at least hourly.
- **Files** (images, logos, PDFs) go to Firebase Storage through checked server actions:
  type and size are verified, and SVGs are checked for scripts. On the free Firebase plan
  (no Storage) they go to **Cloudinary** instead when `CLOUDINARY_URL` is set — same paths,
  same checks; quote attachments are stored there as private files
  (`src/lib/media/file-store.ts` decides: emulator → Cloudinary → Firebase Storage).

The full data model is in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Environment variables

Copy `.env.example` to `.env.local` locally. In production, set them in the hosting platform
(secrets in its secret manager). **Never commit real values.**

| Variable | Where used | Notes |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `…_AUTH_DOMAIN`, `…_PROJECT_ID`, `…_STORAGE_BUCKET`, `…_APP_ID` | Browser + server | From Firebase console → Project settings → Your apps |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Browser | App Check (reCAPTCHA) site key |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Server (secret) | Base64 of a service-account JSON. Needed on hosts **other than** Firebase App Hosting |
| `REVALIDATE_SECRET` | Server (secret) | At least 16 random characters; protects `/api/revalidate` |
| `RATE_LIMIT_SALT` | Server (secret) | Random string used to hash visitor IPs for rate limiting |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Browser | `255XXXXXXXXX` (no `+`); fallback if not set in admin |
| `NEXT_PUBLIC_SITE_URL` | Server | Public address, e.g. `https://example.com` (SEO, sitemap) |
| `CLOUDINARY_URL` | Server (secret) | Optional. Free plan only: Cloudinary dashboard → "API environment variable" (`cloudinary://…`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Browser + server | Optional. The Cloudinary cloud name (the part after `@` above) |

Cloud Functions have their own settings (`RESEND_API_KEY` secret, `OWNER_EMAIL`, `EMAIL_FROM`,
`SITE_URL`), set with the Firebase CLI. See [Deployment](#deployment).

---

## Deployment

The project has two parts that are deployed separately:

1. **The website** (Next.js): needs a host that runs Next.js with server rendering.
2. **The Firebase backend**: Firestore and Storage security rules, indexes and Cloud Functions.
   These **always deploy to Firebase**, whichever website host you choose.

### Option A: Firebase App Hosting (the project's default)

This is what the architecture was designed for (`apphosting.yaml` is ready):

- Website and backend live in one Google project, with one bill and one console.
- The server signs in to Firebase automatically: no service-account key to create or store.
- The free usage tier covers a small business site. The project needs the Blaze
  (pay-as-you-go) plan anyway, because Cloud Functions require it.

Steps (owner, once):

1. Create the Firebase project, upgrade to Blaze, and enable Firestore, Storage, Auth
   (Email/Password) and App Check.
2. Firebase console → **App Hosting** → connect the GitHub repository (branch `main`).
3. Add environment variables and secrets (see table above) in `apphosting.yaml` / Secret Manager.
4. Deploy the backend:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage,functions
   ```
5. Set up email: create a Resend account, verify your domain, then
   `firebase functions:secrets:set RESEND_API_KEY` and fill `OWNER_EMAIL`, `EMAIL_FROM` and
   `SITE_URL` in `functions/.env.<project-id>` (git-ignored).
6. Create your admin account in Auth, then `pnpm admin:claim <email> --prod`.
7. Add your domain in App Hosting, and in Auth → Settings → Authorised domains.

### Option B: Vercel

Vercel runs Next.js very well and the code already supports it: the Firebase Admin SDK reads
`FIREBASE_SERVICE_ACCOUNT_KEY`, and the rate limiter reads Vercel's `x-forwarded-for` header.
Things to know first:

- **Plan:** Vercel's free *Hobby* plan is for **non-commercial use only**. A business website
  needs the **Pro** plan (paid, per team member).
- **Two platforms:** the website is on Vercel, but rules, functions, database and files stay on
  Firebase (Blaze plan), so there are two dashboards and two bills.
- **A service-account key** must be created and stored as a Vercel secret. It is a powerful
  credential: keep it only in Vercel's encrypted environment variables and rotate it if it
  leaks.

Steps:

1. Do steps 1, 4, 5 and 6 of Option A (Firebase backend, email, admin account).
2. Firebase console → Project settings → Service accounts → **Generate new private key**.
   Base64-encode the JSON file and keep the result private (PowerShell:
   `[Convert]::ToBase64String([IO.File]::ReadAllBytes("key.json"))`; macOS/Linux:
   `base64 -w0 key.json`). Delete the downloaded file afterwards.
3. On [vercel.com](https://vercel.com): **Add New → Project**, import the GitHub repository.
   Vercel detects Next.js and pnpm automatically (root directory: the repository root).
4. Add every variable from the [table above](#environment-variables) under
   **Settings → Environment Variables** (Production), including `FIREBASE_SERVICE_ACCOUNT_KEY`.
   Do **not** set the emulator variables (`FIRESTORE_EMULATOR_HOST` …) in production.
5. Deploy, then add your domain under **Settings → Domains**, and also in Firebase Auth →
   Settings → Authorised domains and in the App Check reCAPTCHA key's allowed domains.
6. Set `SITE_URL` for the Cloud Functions to the same domain (used in email links).

> In short: **App Hosting is the simpler and cheaper fit** for this project, because everything
> else is already on Firebase. **Vercel works too.** Choose it if you prefer Vercel's dashboard and
> preview deployments, and are fine with the Pro plan and managing a service-account key.

### Easiest: one guided command

After creating the Firebase project (Firestore in `europe-west1`, Storage, Authentication with
Email/Password) and downloading a service-account key to your Downloads folder:

```bash
pnpm go-live
```

It finds the key, uploads the security rules, copies your exported content (after a practice
run and your "yes"), and makes your email the admin, printing a link to set the password. The
steps below do the same things one by one.

### Copying content you edited locally to the live site

Edits made in the local admin live only in the emulators on your computer; the live site reads
the real Firebase project. To copy them once (owner only):

```bash
# 1. With the emulators running (pnpm emulators):
pnpm content:copy export
#    -> writes .production-copy/ (git-ignored) and lists what will be copied, what is skipped
#       (sample items, leads, subscribers, test accounts) and any leftover sample text.

# 2. Dry run against the real project (writes nothing):
pnpm content:copy import --key path/to/service-account.json --bucket <your-bucket>

# 3. Copy for real:
pnpm content:copy import --key path/to/service-account.json --bucket <your-bucket> --confirm
```

Existing documents in the real project are never overwritten. Keep the key file **outside**
the project folder, and delete `.production-copy/` afterwards. Then sign in to the live admin
and press **Save** on any page (or redeploy) so the public pages refresh.

### Before going live (checklist)

- [ ] Real content entered in the admin (no `SAMPLE:` items left; delete sample data).
- [ ] Privacy Policy and Terms reviewed (ideally by a lawyer), Swahili versions added.
- [ ] Security rules tests pass: `pnpm test:rules`.
- [ ] App Check enforced for Firestore/Storage in the Firebase console.
- [ ] Firestore TTL policy on `rateLimits.expiresAt` (old rate-limit records delete themselves).
- [ ] Test a real quote request and a newsletter sign-up end to end (emails arrive).

---

## Testing

```bash
pnpm check        # lint + types + unit tests (fast; run before every commit)
pnpm test:rules   # proves the database/storage rules allow and deny the right things
pnpm test:e2e     # real-browser tests on desktop and phone sizes
```

- First Playwright run: `pnpm exec playwright install chromium`.
- On Windows with **Smart App Control**, the downloaded test browser may be blocked; use your
  installed Chrome instead: `PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e`.
- Tests that change data need the emulators with sample data (`pnpm emulators` + `pnpm seed`).
  Run them against a **separate** emulator session if you want to keep your own local edits.

CI (GitHub Actions, `.github/workflows/ci.yml`) runs lint, type checks, unit tests, rules tests
and a build on every push and pull request, plus end-to-end tests on pull requests.

---

## Security and privacy

- **Database and files are deny-by-default** (`firestore.rules`, `storage.rules`). Visitors never
  write to the database directly: forms go through Server Actions.
- **Every public form** has a honeypot, App Check verification, per-IP rate limiting (IPs are
  hashed, never stored) and server-side Zod validation.
- **Admin actions** re-check the admin's sign-in on the server every time.
- **Personal data** (leads, subscribers) is readable only by admins and is never written to logs.
- **Uploads** are checked by size and real file content; SVG logos are checked for scripts.
- **Cookies:** only essential ones until the visitor chooses otherwise. The office map uses
  OpenStreetMap, which sets no tracking cookies.

Found a security problem? Please contact the owner privately instead of opening a public issue.

---

## Conventions for contributors

- **Read first:** [ARCHITECTURE-ESSENTIAL.md](ARCHITECTURE-ESSENTIAL.md) (binding rules) and
  [AGENTS.md](AGENTS.md) (who may change what; some files are protected).
- **Never hard-code UI text:** add keys to **both** `messages/en.json` and `messages/sw.json`.
- **Types come from Zod schemas** (`src/lib/schemas/`); don't write duplicate interfaces.
- **Server Components by default**; `"use client"` only for interactive parts. Public pages must
  stay under **150 KB** of JavaScript (check the `pnpm build` output).
- **Styling:** Tailwind classes with the design tokens; no raw colour codes, no inline styles.
- **Files:** components `PascalCase.tsx`, everything else `kebab-case.ts`; named exports; the
  `@/` import alias for `src/`.
- **Server Actions** return `{ ok: true, data } | { ok: false, error }` and never throw to the browser.
- **Git:** work on a feature branch, use [Conventional Commits](https://www.conventionalcommits.org)
  (`feat(blog): …`, `fix(nav): …`), run `pnpm check` before pushing, open a pull request to
  `main`. Never push directly to `main`, never commit secrets.
- **Never invent business content** (clients, prices, testimonials, numbers): use `TODO: real content`.

---

## More documentation

| File | What it covers |
|---|---|
| [PRD.md](PRD.md) | What the product is and why: goals, features, requirements |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How it works: data model, security, pipeline, performance budget |
| [ARCHITECTURE-ESSENTIAL.md](ARCHITECTURE-ESSENTIAL.md) | The short, binding rules |
| [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) | Rules for AI coding assistants |
| [docs/decisions/](docs/decisions/) | Architecture decision records |
| [docs/tasks/](docs/tasks/) | What was built in each phase, decisions and owner to-dos |
| [docs/glossary-sw.md](docs/glossary-sw.md) | Swahili terms used on the site |
