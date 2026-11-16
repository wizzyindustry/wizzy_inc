# Phase 1.3 — owner requests (2026-11-16)

Requested by the owner after reviewing Phase 1.2. Not in PRD.md (protected) — this file records
scope and decisions. Same rules as before: one branch per slice, stacked; no new dependencies;
real business content (partners, numbers, founders, offices, posts) comes from the owner —
until then sections stay hidden or show `TODO: real content`. Everything is editable in admin.

| # | Branch | What | Touches rules? |
|---|---|---|---|
| 1 | `feat/loading-always` | Loading "W" on every page: a short splash on each full page load and on every page change (≈0.6 s minimum), then fades out | — |
| 2 | `feat/motion` | Fade/slide-in animations as sections scroll into view, hover lifts on cards; all off with "reduce motion" | — |
| 3 | `feat/home-sections` | Admin "list" field + `settings/company`. Home: About "Our story" right after the hero + fact cards (founded, headquarters, founder & CEO); services as flip cards; partner logo marquee; impact numbers; office locations with map; "Get in touch" | — |
| 4 | `feat/offices-page` | `/offices` page: every office with its OpenStreetMap map | — |
| 5 | `feat/newsletter` | "Stay updated" email subscribe (home + footer), Admin → Subscribers (list, CSV, remove), welcome email (Cloud Function) | **firestore.rules** (approved) |
| 6 | `feat/blog` | `/blog` and `/blog/[slug]`, Admin → Blog posts | **firestore.rules** (approved) |
| 7 | `feat/support-page` | `/support`: help topics, contact channels, FAQ link — editable | — |
| 8 | `feat/press-page` | `/press`: Leadership (photo, name, bio, social icons), Media resources (logos, licence documents, photos), Brand colours (name, HEX, RGB) | **storage.rules** (approved: PDFs in `site/press/`) |
| 9 | `feat/nav-menus` | Header: "Services" dropdown (all services by category) and "Company" dropdown (About, Blog, Support, Offices, Press); hover or click, keyboard and mobile friendly | — |

## Decisions (owner, 2026-11-16)
- **Rules:** approved — public read of published blog posts; subscribers admin-only (written by
  the server); admin PDF/image uploads in Storage `site/press/`.
- **Map:** OpenStreetMap embed (no API key, no tracking cookies, no consent needed).
- **Loading W:** on every page, short (≈0.6 s), then fades out.
- **Subscribe:** saved to an admin list **and** a welcome email is sent (same mail setup as quote
  notifications).
