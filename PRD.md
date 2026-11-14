# PRD — Product Requirements Document
## Wizzy Inc Services Website (Graphic Design & Web Development)

| Field | Value |
|---|---|
| Product | Wizzy Inc Services Website |
| Owner | Panta-wizzy |
| Status | Draft v1.0 |
| Last updated | 2026-11-14 |
| Location / market | Dodoma, Tanzania (and online clients across East Africa) |

> "Wizzy Inc" is the working brand name. Replace it everywhere if the final brand changes.

---

## 1. Overview

A professional website that presents the two services Panta-wizzy offers — **Graphic Design** and **Web Development** — shows proof of past work, explains packages and prices, and turns visitors into paying clients through a quote-request form and WhatsApp contact.

It is a **business website with a small admin panel**, not a marketplace. One provider (Panta-wizzy), many potential clients.

## 2. Problem Statement

Small businesses, startups, student organisations and event organisers in Dodoma and across Tanzania need logos, posters, social-media graphics and websites, but:

1. **They can't find a trustworthy local provider.** Most freelancers are found by word of mouth or scattered Instagram/WhatsApp posts with no clear proof of quality.
2. **They don't know what things cost.** Prices are hidden until a long chat, so clients hesitate to ask.
3. **The ordering process is messy.** Requirements arrive in fragments over WhatsApp, leading to back-and-forth, missed details and delayed projects.
4. **The provider has no single professional presence.** Without one link to share, it is hard to look credible, collect leads, or track who asked for what.

**Solution:** one fast, mobile-first website that explains the services clearly, shows real work, publishes starting prices, and collects structured project requests that land in an admin dashboard (and notify the owner instantly).

## 3. Goals & Non-Goals

### Goals
| # | Goal | Measure of success (first 6 months after launch) |
|---|---|---|
| G1 | Establish a credible professional presence | Site live on a custom domain; Lighthouse ≥ 90 on Performance, Accessibility, SEO |
| G2 | Generate qualified leads | ≥ 20 quote requests per month |
| G3 | Reduce back-and-forth on new projects | ≥ 80% of requests contain all required brief fields |
| G4 | Showcase work | ≥ 12 portfolio items published (6 design, 6 web) |
| G5 | Reach local clients in their language | Full English + Swahili versions of all public pages |

### Non-Goals (v1)
- Online payments / checkout (quotes are agreed manually; see Phase 2).
- Client accounts or a client login portal.
- A multi-vendor marketplace or hiring other freelancers.
- A full blog/CMS (Phase 2).
- Native mobile apps.

## 4. Target Users

### 4.1 Personas

**P1 — Amina, small business owner (primary)**
Runs a shop or salon in Dodoma. Uses a smartphone, mostly WhatsApp and Instagram, often on mobile data. Needs a logo, flyers and maybe a simple website. Cares about price, speed, and seeing examples. Prefers Swahili.

**P2 — Joseph, startup / NGO coordinator (primary)**
Needs a professional website and brand kit for a project or organisation. Uses a laptop at work. Wants clear packages, timelines and a professional process. Comfortable in English.

**P3 — Neema, student leader / event organiser (secondary)**
Needs posters, banners and social graphics for events, on short deadlines and a tight budget. Wants fast turnaround and simple pricing.

**P4 — Panta-wizzy, owner/admin (internal)**
Manages services, prices, portfolio and incoming requests. Needs to update content without editing code and to be notified immediately of new leads.

### 4.2 Key user journeys
1. **Discover → Trust → Contact:** lands from Google/Instagram/WhatsApp link → views a service → browses portfolio → requests a quote or taps WhatsApp.
2. **Compare packages:** opens Pricing → compares Basic / Standard / Premium → picks one → form is pre-filled with that package.
3. **Owner follow-up:** gets email/WhatsApp-link notification → opens admin → reviews request → updates status (New → Contacted → Quoted → Won/Lost).

## 5. Services Offered (content scope)

### Graphic Design
- Logo design & brand identity (logo, colour palette, typography, brand guide)
- Posters, flyers & banners (print and digital)
- Social media graphics & templates
- Business cards & stationery
- Event branding

### Web Development
- Landing pages
- Business / company websites (multi-page)
- Portfolio websites
- Simple e-commerce / product catalogue sites
- Website maintenance & updates
- Website redesign

Each service has: title (EN/SW), short description, full description, what's included, typical turnaround, starting price (TZS, optional USD), related portfolio items, FAQ.

## 6. Features

Priority: **P0** = must ship at launch, **P1** = should ship at launch, **P2** = later phase.

### 6.1 Public website
| ID | Feature | Description | Priority |
|---|---|---|---|
| F1 | Home page | Hero with value statement, two service cards (Design / Web), featured work, process steps, testimonials, call-to-action | P0 |
| F2 | Services overview | Lists both service categories and their sub-services | P0 |
| F3 | Service detail pages | One page per sub-service: description, inclusions, turnaround, starting price, related work, FAQ, CTA | P0 |
| F4 | Portfolio / Projects | Filterable grid (All / Graphic Design / Web Development); each item opens a case study with images, client type, problem, solution, tools, live link | P0 |
| F5 | Pricing / Packages | Basic / Standard / Premium tiers per category, prices in TZS; "Request this package" button | P0 |
| F6 | Quote request form | Multi-step form: service → package → project details → budget → deadline → contact details; optional file upload (reference images / brief) | P0 |
| F7 | WhatsApp button | Floating click-to-chat button with a pre-written message (wa.me link) | P0 |
| F8 | About page | Who Panta-wizzy is, skills, tools (Illustrator, Figma, code stack), working process | P0 |
| F9 | Contact page | Form, WhatsApp, email, phone, location (Dodoma), social links, working hours | P0 |
| F10 | Language switch | English ⇄ Swahili on every page, remembered per visitor | P1 |
| F11 | Testimonials | Real client quotes only, added by admin with client consent | P1 |
| F12 | FAQ page | Payment terms, revisions, timelines, file formats, hosting | P1 |
| F13 | Dark/light mode | Respects system preference | P2 |
| F14 | Blog / tips | Design and web tips for small businesses (SEO) | P2 |
| F15 | Online deposit payments | Mobile money (M-Pesa, Tigo Pesa, Airtel Money) via an aggregator | P2 |
| F16 | Client portal | Clients log in to see project status and download files | P2 |

### 6.2 Admin panel (owner only)
| ID | Feature | Description | Priority |
|---|---|---|---|
| A1 | Secure login | Email/password or Google sign-in; only allow-listed admin accounts | P0 |
| A2 | Leads inbox | List of quote requests with filters, search, status pipeline, internal notes | P0 |
| A3 | New-lead notification | Email to owner on every new request (WhatsApp/Telegram notification in P2) | P0 |
| A4 | Manage services & packages | Create/edit/hide services, packages and prices (EN + SW fields) | P0 |
| A5 | Manage portfolio | Upload images, write case studies, set category, feature on home page, publish/unpublish | P0 |
| A6 | Manage testimonials | Add/edit/hide | P1 |
| A7 | Basic analytics | Leads per month, by service, conversion (Won ÷ total) | P1 |
| A8 | Export leads | CSV export | P2 |

## 7. Functional Requirements

**FR-1** The system shall display all published services and packages from the database (no hard-coded prices in page code).
**FR-2** The quote form shall require: name, phone (Tanzanian format +255 / 0 accepted), service, project description (≥ 20 characters). Email, budget, deadline and attachments are optional.
**FR-3** The quote form shall accept up to 3 attachments, each ≤ 5 MB, types: JPG, PNG, PDF, (DOCX).
**FR-4** On successful submission the user shall see a confirmation screen with a reference number (e.g. `WZ-2026-0042`) and a WhatsApp button to follow up.
**FR-5** The owner shall receive an email within 1 minute of a submission containing all request details and a link to the admin record.
**FR-6** Selecting "Request this package" on the Pricing page shall pre-select the service and package in the form.
**FR-7** Portfolio shall be filterable by category without a full page reload.
**FR-8** Only authenticated admins shall read leads or write any content.
**FR-9** Every public page shall exist in English and Swahili; missing Swahili text falls back to English.
**FR-10** Lead status shall follow the pipeline: `new → contacted → quoted → won | lost`, with timestamps for each change.
**FR-11** The site shall generate `sitemap.xml`, `robots.txt` and Open Graph tags for every public page.

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | LCP < 2.5 s on a mid-range Android over 3G/4G; total home page weight < 1.5 MB; images served as WebP/AVIF, lazy-loaded |
| Mobile-first | Designed for 360 px width first; fully usable on phones |
| Accessibility | WCAG 2.1 AA: colour contrast, keyboard navigation, alt text, form labels |
| SEO | Server-rendered pages, semantic HTML, local SEO for "graphic designer Dodoma", "web developer Tanzania" |
| Security | HTTPS only; strict database security rules (deny by default); spam protection on forms (reCAPTCHA/App Check + rate limiting); no secrets in client code; input validation on client **and** server |
| Privacy | Collect only what's needed; privacy notice on form; lead data visible only to admin; compliant with Tanzania's Personal Data Protection Act 2022 |
| Availability | ≥ 99.5% uptime (managed hosting) |
| Maintainability | TypeScript, linting, consistent structure; content editable via admin without code changes |
| Cost | Run within free/low-cost tiers during year 1 |

## 9. Content & Design Requirements
- Visual identity consistent with the Wizzy Inc brand (logo, palette, typography defined in a design-tokens file).
- Real portfolio images only — no stock "fake" projects presented as client work.
- Testimonials must be genuine and used with client permission.
- Prices displayed in TZS (e.g. "From TZS 50,000"); final prices confirmed per quote.
- Tone: friendly, professional, clear; avoid jargon for small-business clients.

## 10. Assumptions & Constraints
- Single admin (the owner) at launch.
- Most visitors are on mobile with variable connectivity.
- Payments happen offline (mobile money / bank) in v1.
- Owner has a domain or will buy one (e.g. `.co.tz` or `.com`).

## 11. Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Form spam | Inbox noise | App Check / reCAPTCHA, honeypot field, rate limit |
| Thin portfolio at launch | Lower trust | Include strong academic/personal projects, clearly labelled as such |
| Slow on mobile data | Visitors leave | Image optimisation, SSR, performance budget in CI |
| Insecure database rules | Data leak | Deny-by-default rules + rules tests before every deploy |
| Translation drift | Inconsistent content | Bilingual fields side by side in admin; EN fallback |

## 12. Release Plan

| Phase | Scope | Target |
|---|---|---|
| Phase 0 — Setup | Repo, docs (this PRD, ARCHITECTURE, AGENTS, CLAUDE), design tokens, CI | Week 1 |
| Phase 1 — MVP | F1–F9, A1–A5, FR-1 to FR-11 (English) | Weeks 2–5 |
| Phase 1.1 | F10–F12, A6–A7, Swahili content | Weeks 6–7 |
| Phase 2 | Blog, mobile-money deposits, client portal, CSV export, chat notifications | After launch |

## 13. Acceptance Criteria (MVP "done")
- [ ] All P0 features work on Chrome Android, Safari iOS, and desktop Chrome/Firefox/Edge.
- [ ] A test quote submission appears in admin and triggers an owner email.
- [ ] Unauthenticated users cannot read leads (verified by security-rule tests).
- [ ] Lighthouse mobile scores ≥ 90 (Performance, Accessibility, Best Practices, SEO).
- [ ] At least 6 portfolio items and all services/packages entered via admin.
- [ ] Deployed on custom domain with HTTPS.

## 14. Glossary
- **Lead / quote request:** a submission from a potential client asking for a price.
- **Package:** a pre-defined bundle (Basic / Standard / Premium) with a starting price.
- **Case study:** a portfolio entry explaining the problem, solution and result of a project.
