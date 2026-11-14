# Phase 1 — MVP task breakdown

Scope (PRD §12): F1–F9, A1–A5, FR-1 → FR-11. English first; Swahili strings are added alongside
but full Swahili content review is Phase 1.1. Each slice is one branch/PR, aiming for < 400 changed lines.

| # | Branch | PRD IDs | What | New deps? |
|---|---|---|---|---|
| 1 | `feat/content-schemas` | FR-1, FR-2, FR-3, FR-10 | Zod schemas for every collection, quote input schema, phone normalising, `admin.ts`, server data layer (`src/lib/data/*`) | none |
| 2 | `feat/layout-shell` | F7, F10 | Header + mobile nav, footer, floating WhatsApp button, "Request a quote" CTA, language switcher | shadcn primitives (`@radix-ui/*`), `lucide-react` |
| 3 | `feat/seed-data` | — | `pnpm seed`: clearly-marked SAMPLE data into the emulator | `tsx` |
| 4 | `feat/home` | F1 | Hero, two service cards, featured work, process steps, testimonials, CTA | — |
| 5 | `feat/services` | F2, F3 | Services overview + detail pages (inclusions, turnaround, price, related work, FAQ) | markdown renderer (TBD) |
| 6 | `feat/portfolio` | F4, FR-7 | Filterable grid (client-side filter) + case study pages | — |
| 7 | `feat/pricing` | F5, FR-6 | Package cards per category; "Request this package" pre-fills quote form | — |
| 8 | `feat/form-security` | NFR Security | App Check verify, honeypot, rate limit helpers + tests | — |
| 9 | `feat/quote-form` | F6, FR-2–FR-4 | Multi-step form, attachments, `submitQuote` action, reference numbers, success page | — |
| 10 | `feat/lead-email` | A3, FR-5 | `functions/` package, `onLeadCreated` owner email | `firebase-functions`, `resend` |
| 11 | `feat/about-contact` | F8, F9 | About page, contact page + `submitContact` | — |
| 12 | `feat/seo` | FR-11 | `sitemap.ts`, `robots.ts`, JSON-LD, OG images | — |
| 13 | `feat/admin-auth` | A1, FR-8 | Admin login, auth guard, server-side token verify, `set-admin-claim` script | — |
| 14 | `feat/admin-leads` | A2, FR-10 | Leads inbox, filters, status pipeline with timestamps, notes | — |
| 15 | `feat/admin-content` | A4, A5 | Manage services/packages/portfolio (EN+SW fields, uploads), `/api/revalidate` | — |

## Open questions for the owner
- **Dependencies:** approve the "New deps?" column before slices 2, 3, 5 and 10 start.
- **Real content:** About text, contact phone/WhatsApp/email, social links, working hours, services,
  prices and portfolio items. Until provided, pages show `TODO: real content` placeholders and the
  emulator uses clearly-labelled sample data.
- **Budget ranges** offered in the quote form (slice 9).
- **Email provider:** Resend (default in ARCHITECTURE.md) or SMTP.
- **Build-time data:** public pages read Firestore. CI has no live Firestore, so pages will render
  on first request (ISR) rather than at build time. Revisit when staging exists.
