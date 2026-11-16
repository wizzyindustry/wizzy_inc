# Phase 1.2 — owner requests after review (2026-11-16)

Requested by the owner after reviewing the running site. Not in PRD.md (protected) — this file
records scope and decisions. Same rules as before: one branch per slice, stacked; no new
dependencies planned; real business content comes from the owner.

| # | Branch | What | Touches rules? |
|---|---|---|---|
| 1 | `feat/loading-w` | Loading animation: a big animated "W" shown only while a page is loading (`loading.tsx`, CSS only, respects reduced motion) | — |
| 2 | `feat/portfolio-links` | Portfolio buttons: web development → **View project** + **View Git repo**; graphic design → **View design**. Admin enters the links; only the category's fields show | — |
| 3 | `feat/site-images` | New public Storage folder `site/` (admin upload via server action). Hero background image (Settings) and About "Tools we use" cards with logos (About page editor) | **storage.rules** (approved) |
| 4 | `feat/legal-pages` | Privacy Policy, Terms & Conditions, Cookie Policy pages (EN/SW), editable in Admin → Legal pages; footer links; sitemap | — (`settings/legal`) |
| 5 | `feat/cookie-banner` | Cookie consent banner (Accept all / Essential only), remembered 1 year, "Cookie settings" link in footer | — |
| 6 | `feat/home-details` | Home page: About part (About intro + link), "Why choose us" points (editable in Settings), FAQ section (first questions + link to /faq) | — |

## Decisions (owner, 2026-11-16)
- **Loading W:** only while loading — no forced splash screen (keeps pages fast).
- **Storage rules:** add a public-read `site/` folder; admin-only upload of JPG/PNG/WebP/SVG ≤ 5 MB.
- **Legal text:** Claude writes an English draft from what the site really does (Tanzania Personal
  Data Protection Act 2022), marked "DRAFT – review before launch". Swahili is left for the owner /
  a native speaker (the page shows English until then, and admin flags "Swahili missing").
- **Home details:** About part + "Why choose us" points editable in admin.

## Status (2026-11-16)
All six slices done and committed (stacked branches above). Checks: `pnpm check` 146 unit tests,
rules tests 24, Playwright 141 passed / 5 skipped (on installed Chrome: `PLAYWRIGHT_CHANNEL=chrome`,
because Windows Smart App Control now blocks the downloaded test browser).

Found and fixed on the way: a `[locale]/loading.tsx` made missing pages answer 200 instead of 404,
so the W is shown by `NavigationLoader` instead; the quote/contact privacy notice now links to the
Privacy Policy.

## Owner to-do
- Have the legal drafts checked (ideally by a lawyer) and add the Swahili versions before launch.
- Write the real "Why choose us" points, tool list and hero image.
