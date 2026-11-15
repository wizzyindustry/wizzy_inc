# Phase 1.1 — task breakdown

Scope (PRD §12): F10–F12, A6–A7, Swahili content. Same rules as Phase 1: one branch per slice,
real content only from the owner (`TODO: real content` otherwise), no new dependencies planned.

| # | Branch | PRD IDs | What | New deps? |
|---|---|---|---|---|
| 1 | `feat/locale-memory` | F10 | Remember the visitor's language for a year (cookie), so `/` and shared links without a locale open in their language | — |
| 2 | `feat/faq-page` | F12, FR-11 | Public `/faq` page (payment terms, revisions, timelines, file formats, hosting) with `FAQPage` JSON-LD, nav + sitemap; questions editable in the admin | — |
| 3 | `feat/admin-analytics` | A7 | `/admin/analytics`: leads per month (12 months), by service, by type, conversion (Won ÷ total) | — |
| 4 | `feat/swahili-content` | G5, FR-9 | Admin shows which items are missing Swahili; review pass of `sw.json` for consistent terms; glossary for the owner to check | — |

Already done in Phase 1 (verified, no slice needed):
- **F11 Testimonials** — shown on the home page only when published; consent is required.
- **A6 Manage testimonials** — add/edit/hide in `/admin/content/testimonials` (slice 15).

## Open questions for the owner
- **FAQ storage (decided 2026-11-15):** a list in `settings/site`, edited on the admin Settings page — no rules change.
- **FAQ answers** (payment terms, revisions, timelines, file formats, hosting) are business
  policies — the owner writes them. Until then the page shows `TODO: real content`.
- **Swahili review** — a native speaker should check the final wording.
