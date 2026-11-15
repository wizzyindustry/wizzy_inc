# ARCHITECTURE.md
## Wizzy Inc Services Website — System Architecture

This document explains **how the website works**: the frontend, backend, database, storage, authentication, data flow and deployment. Requirements live in `PRD.md`; the short, binding rules for AI tools live in `ARCHITECTURE-ESSENTIAL.md`.

---

## 1. High-Level Overview

```
                ┌────────────────────────────────────────────┐
  Visitor ───►  │  Next.js app (App Router, SSR/SSG + ISR)   │
  (mobile/PC)   │  - Public pages  (/[locale]/...)           │
                │  - Admin panel   (/admin/...)              │
                │  - Server Actions / Route Handlers         │
                └───────┬───────────────────┬────────────────┘
                        │ Firebase Admin SDK│ Firebase Client SDK
                        │ (server only)     │ (admin UI, auth)
                ┌───────▼───────────────────▼────────────────┐
                │               Firebase                     │
                │  Firestore (data)   Storage (images/files) │
                │  Auth (admins)      App Check (anti-spam)  │
                │  Cloud Functions (email on new lead)       │
                └───────────────────────┬────────────────────┘
                                        │
                                ┌───────▼────────┐
                                │ Email provider │ (Resend / SMTP)
                                └────────────────┘
```

**Style:** a server-rendered Next.js application backed by Firebase as a managed backend (Backend-as-a-Service). There is no separate custom API server; server-side logic runs in Next.js Server Actions/Route Handlers and Firebase Cloud Functions.

**Why this stack**
- Next.js gives server-side rendering for SEO and fast first paint on mobile data.
- Firebase is already familiar to the owner, has a generous free tier, and removes server maintenance.
- TypeScript end-to-end keeps data shapes consistent between UI, server and database.

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) |
| Framework | Next.js 15 (App Router, React Server Components) |
| Styling | Tailwind CSS + design tokens (`src/styles/tokens.css`) |
| UI primitives | shadcn/ui (Radix-based, accessible) |
| Forms & validation | React Hook Form + Zod (shared schemas client & server) |
| i18n | `next-intl` — locales `en`, `sw` |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Auth | Firebase Authentication (admin only) + custom claim `admin: true` |
| Anti-spam | Firebase App Check (reCAPTCHA Enterprise) + honeypot + rate limiting |
| Background jobs | Cloud Functions for Firebase (2nd gen, Node 20) |
| Email | Resend (or SMTP via Nodemailer) |
| Images | `next/image` (WebP/AVIF, responsive sizes) |
| Analytics | Google Analytics 4 / Vercel-free alternative (Plausible) — optional |
| Hosting | Firebase App Hosting (Next.js SSR) |
| CI/CD | GitHub Actions → lint, typecheck, test, rules tests → deploy |
| Testing | Vitest (unit), Playwright (e2e), Firebase Emulator Suite (rules/integration) |

## 3. Frontend

### 3.1 Routing (App Router)

```
src/app/
├── [locale]/                     # en | sw
│   ├── layout.tsx                # header, footer, WhatsApp button, i18n provider
│   ├── page.tsx                  # Home
│   ├── services/
│   │   ├── page.tsx              # Services overview
│   │   └── [slug]/page.tsx       # Service detail
│   ├── portfolio/
│   │   ├── page.tsx              # Filterable grid
│   │   └── [slug]/page.tsx       # Case study
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── faq/page.tsx
│   └── quote/
│       ├── page.tsx              # Multi-step quote form
│       └── success/page.tsx      # Reference number + WhatsApp CTA
├── admin/
│   ├── login/page.tsx
│   ├── layout.tsx                # auth guard
│   ├── page.tsx                  # Dashboard (stats)
│   ├── leads/ (list + [id])
│   ├── services/ (list + edit)
│   ├── packages/
│   ├── portfolio/
│   └── testimonials/
├── api/
│   └── revalidate/route.ts       # on-demand ISR after admin edits
├── sitemap.ts
└── robots.ts
```

### 3.2 Rendering strategy
| Page type | Strategy | Reason |
|---|---|---|
| Home, Services, Portfolio, Pricing, About, FAQ | Static generation + ISR (revalidate on admin save, fallback 1 h) | Fast, cacheable, SEO-friendly |
| Quote form | Server-rendered shell + client component for the steps | Interactive |
| Admin | Client-rendered behind auth (no caching) | Private, real-time data |

### 3.3 Component organisation
```
src/components/
├── ui/          # shadcn primitives (Button, Input, Dialog…) — generic, no business logic
├── layout/      # Header, Footer, LanguageSwitcher, WhatsAppButton
├── sections/    # Hero, ServiceCards, FeaturedWork, ProcessSteps, Testimonials, CTA
├── portfolio/   # PortfolioGrid, PortfolioFilter, CaseStudyGallery
├── pricing/     # PackageCard, PackageTable
├── forms/       # QuoteForm (steps), ContactForm
└── admin/       # LeadTable, StatusBadge, ImageUploader, BilingualField
```

### 3.4 Data access from the frontend
- **Public pages** read data on the server via `src/lib/data/*.ts` (Firebase Admin SDK). Public visitors never talk to Firestore directly.
- **Admin pages** use the Firebase client SDK with the signed-in admin's ID token; Firestore security rules enforce access.

## 4. Backend

There are three places where server logic runs:

### 4.1 Next.js Server Actions (`src/app/**/actions.ts`)
- `submitQuote(formData)` — validates with Zod, verifies App Check token, checks honeypot + rate limit, uploads attachments, writes the lead, returns a reference number.
- `submitContact(formData)` — same pattern for the simple contact form.
- Admin mutations (e.g. `updateLeadStatus`) verify the caller's ID token and `admin` claim **on the server** before writing.

### 4.2 Route Handlers (`src/app/api/*`)
- `POST /api/revalidate` — called after admin content changes to refresh static pages (protected by a secret).

### 4.3 Cloud Functions (`functions/src`)
| Function | Trigger | Job |
|---|---|---|
| `onLeadCreated` | Firestore `onDocumentCreated('leads/{id}')` | Email the owner with lead details + admin link; optional auto-reply to client if email given |
| `nextLeadNumber` | Called inside the submit transaction (or a counter doc) | Generates `WZ-YYYY-NNNN` reference numbers |
| `setAdminClaim` | Callable, run once by owner via script | Grants `admin: true` custom claim to an allow-listed email |
| `cleanupOrphanUploads` | Scheduled (daily) | Deletes attachments not linked to any lead after 24 h |

### 4.4 Request flow — submitting a quote
```
1. Visitor fills QuoteForm (client validation with Zod schema)
2. Browser gets App Check token → calls Server Action submitQuote
3. Server: verify App Check → validate with SAME Zod schema → honeypot/rate limit
4. Server: upload attachments to Storage  quotes/{leadId}/{file}
5. Server: Firestore transaction → increment counter → create leads/{leadId}
6. Server returns { ref: "WZ-2026-0042" } → redirect to /quote/success
7. Cloud Function onLeadCreated → sends owner email
8. Owner opens /admin/leads/{leadId} → updates status
```

## 5. Database (Cloud Firestore)

### 5.1 Collections

**`services`** — one doc per sub-service
```ts
{
  id: string,
  slug: string,                       // "logo-design"
  category: "graphic-design" | "web-development",
  title: { en: string, sw: string },
  summary: { en: string, sw: string },
  body: { en: string, sw: string },   // markdown
  inclusions: { en: string[], sw: string[] },
  turnaroundDays: { min: number, max: number },
  startingPriceTZS: number,
  icon: string,
  order: number,
  published: boolean,
  faq: { q: {en,sw}, a: {en,sw} }[],
  updatedAt: Timestamp
}
```

**`packages`**
```ts
{
  id, category: "graphic-design" | "web-development",
  tier: "basic" | "standard" | "premium",
  name: {en, sw}, priceTZS: number, priceUSD?: number,
  features: { en: string[], sw: string[] },
  revisions: number, deliveryDays: number,
  highlighted: boolean, order: number, published: boolean
}
```

**`portfolio`**
```ts
{
  id, slug, category: "graphic-design" | "web-development",
  serviceSlugs: string[],             // links to services
  title: {en, sw}, clientType: string, // e.g. "Retail shop" (no private client data without consent)
  problem: {en, sw}, solution: {en, sw}, result?: {en, sw},
  tools: string[],                    // ["Illustrator", "Next.js"]
  coverImage: string, gallery: string[], // Storage paths
  liveUrl?: string, featured: boolean,
  isPersonalProject: boolean,         // label academic/personal work honestly
  published: boolean, completedAt: Timestamp, order: number
}
```

**`testimonials`**
```ts
{ id, name, role, company?, quote: {en, sw}, rating?: 1-5,
  portfolioId?, consentGiven: true, published: boolean }
```

**`leads`** (private)
```ts
{
  id, ref: "WZ-2026-0042",
  kind: "quote" | "contact",       // contact = Contact page message (ADR 0002); missing = quote
  name, phone, email?, preferredContact: "whatsapp" | "phone" | "email",
  locale: "en" | "sw",
  serviceSlug?, packageId?, description, budgetRangeTZS?, deadline?: Timestamp,
                                      // serviceSlug: quotes only; contact = message in description
  attachments: { path, name, size, contentType }[],
  status: "new" | "contacted" | "quoted" | "won" | "lost",
  statusHistory: { status, at: Timestamp }[],
  notes: { text, at: Timestamp }[],
  source?: string,                    // utm / referrer
  createdAt: Timestamp
}
```

**`counters/leads`** — `{ year: number, value: number }` for reference numbers.
**`rateLimits/{hash}`** (server only) — `{ action, count, windowStart, expiresAt }`, one doc per salted SHA-256 of action + client IP (raw IPs are never stored). Fixed window: 5 quote / 5 contact submissions per IP per hour (`src/lib/security/rate-limit-window.ts`). Set a Firestore TTL policy on `expiresAt` in each project so old docs are deleted automatically.
**`settings/site`** — contact phone, WhatsApp number, email, social links, working hours, hero text (bilingual).

### 5.2 Indexes
- `leads`: `status ASC, createdAt DESC`; `serviceSlug ASC, createdAt DESC`
- `portfolio`: `published ASC, category ASC, order ASC`; `published ASC, order ASC`; `published ASC, featured ASC`
- `services`: `published ASC, category ASC, order ASC`; `published ASC, order ASC`

### 5.3 Security rules (summary)
- Deny everything by default.
- `services`, `packages`, `portfolio`, `testimonials`, `settings`: public **read** only where `published == true` (settings always readable); **write** only if `request.auth.token.admin == true`.
- `rateLimits`: no client access at all (not listed in the rules, so denied by default).
- `leads`, `counters`: **no client access at all** for the public — created only by the server (Admin SDK). Admins may read/update `leads`; nobody may delete from the client.
- Storage: `portfolio/**` public read, admin write; `quotes/**` admin read only, server write only.

Full rules: `firestore.rules`, `storage.rules`. They are tested with the emulator in `tests/rules/`.

## 6. Authentication & Authorisation
- Only the admin logs in. No public sign-up.
- Sign-in via Firebase Auth (Google or email/password).
- Admin rights come from a **custom claim** `admin: true`, set once with the `setAdminClaim` script for allow-listed emails.
- `/admin/*` layout checks auth on the client **and** every admin server action re-verifies the ID token server-side. UI guards are convenience; rules and server checks are the real security.

## 7. Internationalisation
- `next-intl` with locale prefix: `/en/...`, `/sw/...`; `/` redirects by `Accept-Language`, defaulting to `en`.
- UI strings in `messages/en.json` and `messages/sw.json`.
- Database content uses `{ en, sw }` objects; helper `t(field, locale)` falls back to `en`.
- `hreflang` alternate links on every page.

## 8. Media Handling
- Admin uploads images → Storage `portfolio/{id}/...`.
- Images rendered with `next/image` (remote pattern for the Storage bucket) for automatic resizing and WebP/AVIF.
- Upload limits enforced in Storage rules (size, content type) and in the UI.

## 9. SEO
- `generateMetadata` per page (title, description, Open Graph image, canonical, hreflang).
- JSON-LD: `ProfessionalService` / `LocalBusiness` (Dodoma), `Service`, `CreativeWork` for portfolio items, `FAQPage`.
- `sitemap.ts` built from published services and portfolio items.

## 10. Environments & Configuration

| Env | Firebase project | URL |
|---|---|---|
| Local | Emulator Suite | `http://localhost:3000` |
| Staging | `wizzy-services-staging` | App Hosting preview |
| Production | `wizzy-services-prod` | custom domain |

Environment variables (`.env.local`, never committed):
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
FIREBASE_SERVICE_ACCOUNT_KEY=        # server only (JSON, base64)
REVALIDATE_SECRET=                   # server only
RESEND_API_KEY=                      # functions secret
OWNER_NOTIFICATION_EMAIL=            # functions secret
NEXT_PUBLIC_WHATSAPP_NUMBER=255XXXXXXXXX
NEXT_PUBLIC_SITE_URL=
```

## 11. Deployment Pipeline
```
push / PR ─► GitHub Actions
             ├─ install (pnpm)
             ├─ lint + typecheck
             ├─ unit tests (Vitest)
             ├─ rules tests (Firebase emulator)
             ├─ e2e smoke (Playwright, on PR)
             └─ build
main merge ─► deploy to staging ─► manual approve ─► deploy production
             (App Hosting + firestore.rules + storage.rules + functions + indexes)
```

## 12. Performance Budget
- JS shipped to public pages: < 150 KB gzipped.
- Prefer Server Components; mark `"use client"` only for interactive pieces (form, filters, language switch, admin).
- Fonts: self-hosted via `next/font`, max 2 families.
- Images: always `next/image` with `sizes`; hero image priority-loaded, all others lazy.

## 13. Observability
- Cloud Functions logs (Google Cloud Logging).
- Error reporting: Sentry (free tier) for Next.js — optional.
- Weekly check: failed emails, spam volume, Lighthouse score.

## 14. Future Extensions (Phase 2)
- **Payments:** mobile-money deposits via a Tanzanian aggregator (e.g. Selcom, AzamPay, ClickPesa) — new `payments` collection + webhook Cloud Function.
- **Client portal:** Firebase Auth for clients, `projects` collection with per-client rules.
- **Blog:** `posts` collection or MDX files.
- **Notifications:** WhatsApp Business API / Telegram bot on new lead.
