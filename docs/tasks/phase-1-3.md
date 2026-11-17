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

## Status (2026-11-16)
All nine slices done and committed (stacked branches above). Checks: `pnpm check` 162 unit
tests, rules tests 29, Playwright full run 173 passed / 3 failed / 10 skipped — the 3 were
timeouts under full parallel load (contact message, hero upload, offices map loading from
openstreetmap.org); after making the offices test wait only for our own page, all 3 pass when
re-run (32 passed / 6 skipped).

Notes:
- Lucide 1.x has no brand logos, so social icons are simple line drawings in
  `src/components/ui/SocialIcon.tsx` (no new package).
- The privacy draft now mentions subscribers and the map. If the owner already saved the
  legal pages in admin, add that paragraph there too (the saved text wins over the draft).
- Welcome emails need the same Resend setup as lead emails (`RESEND_API_KEY`, `EMAIL_FROM`,
  `SITE_URL`) — nothing new to configure.

## Decision (owner, 2026-11-17): pictures on Cloudinary
The Blaze upgrade failed (card), and Firebase Storage needs Blaze, so the owner chose the free
Cloudinary plan for uploaded files. `src/lib/media/file-store.ts` picks the emulator (dev/tests),
then Cloudinary (`CLOUDINARY_URL`), then Firebase Storage — paths are unchanged, so switching
back to Storage later needs no content changes. Public files: Cloudinary "image" uploads;
quote attachments: "raw" + private, downloaded only through the admin route. No new package.
**Needs owner approval to record in `ARCHITECTURE-ESSENTIAL.md`** (Data row says Firebase
Storage) — protected file, not edited.

## Owner to-do
- Admin → Company info: real story, founding year, headquarters, founder name, partner logos
  (with their permission), impact numbers and office coordinates.
- Admin → Press page: founder photo/bio/links, logo files, licence PDF, brand colours.
- Admin → Support page and Blog posts: own text.
