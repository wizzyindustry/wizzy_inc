# ARCHITECTURE-ESSENTIAL.md
## Non-negotiable architecture rules for AI assistants

**Read this before writing or changing any code.** These rules are binding. If a request conflicts with a rule here, stop and ask the owner instead of breaking the rule. Full explanations are in `ARCHITECTURE.md`; product scope is in `PRD.md`.

---

## 1. Fixed Stack — do not substitute
| Concern | Must use | Never introduce |
|---|---|---|
| Framework | Next.js 15 App Router | Pages Router, Create React App, Vite SPA, Remix |
| Language | TypeScript `strict` | Plain `.js` files in `src/`, `any` without a comment explaining why |
| Styling | Tailwind CSS + tokens in `src/styles/tokens.css` | Bootstrap, styled-components, CSS-in-JS, inline hex colours |
| UI primitives | shadcn/ui in `src/components/ui` | Material UI, Chakra, Ant Design |
| Validation | Zod schemas in `src/lib/schemas` | Ad-hoc manual validation |
| Forms | React Hook Form | Other form libraries |
| Data | Firestore + Firebase Storage | Other databases, local JSON as a data source, Supabase, Mongo |
| Auth | Firebase Auth + `admin` custom claim | Hard-coded passwords, role checks by email string in client code |
| i18n | `next-intl`, locales `en` and `sw` | Hard-coded user-facing strings |
| Package manager | pnpm | npm/yarn lockfiles |

Adding **any** new dependency requires owner approval. Prefer what's already installed.

## 2. Directory contract
```
src/app/[locale]/   public pages only
src/app/admin/      admin pages only
src/app/api/        route handlers only
src/components/ui/  generic primitives — no Firebase, no business logic
src/components/*    feature components
src/lib/firebase/   client.ts (browser SDK), admin.ts (server-only Admin SDK)
src/lib/data/       server-side read functions (one file per collection)
src/lib/schemas/    Zod schemas — single source of truth for data shapes
src/lib/i18n/       locale helpers
messages/           en.json, sw.json
functions/          Cloud Functions (separate package)
firestore.rules, storage.rules, firestore.indexes.json
tests/              unit, rules, e2e
```
Don't create new top-level folders without approval.

## 3. Data rules
1. **Every data shape is defined once** as a Zod schema in `src/lib/schemas/`. Types are inferred with `z.infer`. Never redeclare the same type by hand.
2. **Validate twice:** on the client (UX) and on the server (security), using the same schema.
3. **Public pages read data only on the server** via `src/lib/data/*`. Public visitors must never query Firestore directly from the browser.
4. **Leads are written only by the server** (Admin SDK inside a Server Action). The browser never writes to `leads` or `counters`.
5. **No hard-coded content**: services, prices, packages, portfolio, testimonials, contact details come from Firestore. Only layout copy lives in `messages/*.json`.
6. Bilingual content is always `{ en: string; sw: string }`. Read it with the locale helper, which falls back to `en`.
7. Prices are integers in **TZS** (`priceTZS`, `startingPriceTZS`). Format with `Intl.NumberFormat('en-TZ' | 'sw-TZ')`.
8. Timestamps use Firestore `Timestamp` / `serverTimestamp()` — never client `Date.now()` for stored records.

## 4. Security rules — hard lines
- `firestore.rules` and `storage.rules` are **deny by default**. Never add `allow read, write: if true;`.
- Admin access is checked via `request.auth.token.admin == true` in rules **and** by verifying the ID token server-side in every admin action.
- `src/lib/firebase/admin.ts` must start with `import 'server-only'`. It must never be imported by a client component.
- Secrets live only in env vars / Firebase secrets. Only `NEXT_PUBLIC_*` values may reach the browser.
- Every public form: Zod validation + App Check verification + honeypot field + rate limit.
- Uploads: max 5 MB, allowed types JPG/PNG/WebP/PDF(/DOCX); enforce in UI, server and Storage rules.
- Never log full lead personal data (phone/email) to the console or analytics.
- Any change to `*.rules` must come with updated tests in `tests/rules/`.

## 5. Rendering rules
- Default to **Server Components**. Add `"use client"` only for interactivity (forms, filters, language switch, admin UI).
- Public content pages use static generation + ISR; after admin edits call `/api/revalidate`.
- Always use `next/image` and `next/link`. No raw `<img>` for content images.
- Every public page exports `generateMetadata` (title, description, canonical, hreflang, OG).

## 6. UI / UX rules
- Mobile-first: design at 360 px, then scale up.
- WCAG 2.1 AA: labels on every input, visible focus, alt text, contrast ≥ 4.5:1.
- Use design tokens (`--color-*`, `--radius-*`, spacing scale). No magic numbers or raw hex.
- Every user-facing string goes through `next-intl` and exists in **both** `en.json` and `sw.json`.
- The floating WhatsApp button and a "Request a quote" CTA appear on every public page.

## 7. Content honesty
- Never invent testimonials, client names, statistics, or portfolio projects. Use clearly marked placeholders (`TODO: real content`) instead.
- Personal/academic projects must have `isPersonalProject: true` and be labelled on the site.

## 8. Performance budget
- Public page JS < 150 KB gzipped; LCP < 2.5 s on mobile.
- Don't import heavy libraries (charts, animation suites, moment.js) into public pages.

## 9. Before you finish any task
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] `pnpm test` passes (and `pnpm test:rules` if rules/data access changed)
- [ ] New strings added to both `en.json` and `sw.json`
- [ ] No secrets, no `console.log` of personal data, no new deps without approval
- [ ] Docs updated if architecture changed (`ARCHITECTURE.md` + this file)

## 10. When unsure
Stop and ask. Do not guess about pricing, legal text, security rules, or anything that would publish content on the owner's behalf.
