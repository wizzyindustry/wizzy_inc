# AGENTS.md
## How AI agents work on the Wizzy Inc Services Website

This file tells any AI coding agent (Claude Code, Copilot, Cursor, Codex, Gemini, etc.) how to work in this repository: **who does what, which rules apply, and what each agent may and may not modify.**

**Required reading order for every agent before starting:**
1. `ARCHITECTURE-ESSENTIAL.md` — binding rules (always wins in a conflict)
2. This file
3. `PRD.md` — what we are building and why
4. `ARCHITECTURE.md` — how it works in detail
5. `CLAUDE.md` — commands and project structure

---

## 1. General working rules (all agents)

1. **Stay in scope.** Do only the task you were given. No drive-by refactors, renames or "improvements" outside the task.
2. **Small, reviewable changes.** One feature or fix per branch/PR. Aim for < 400 changed lines.
3. **Plan first for non-trivial work.** Write a short plan (files to touch, approach, risks) before editing code.
4. **Follow the PRD.** Don't add features that aren't in `PRD.md`. Phase 2 items stay out of MVP work.
5. **Never invent content.** No fake testimonials, clients, stats, prices or portfolio items. Use `TODO: real content` placeholders.
6. **Bilingual always.** Every user-facing string goes in both `messages/en.json` and `messages/sw.json`. If you are unsure of the Swahili, add your best translation and mark it `// TODO: review sw` in the PR description.
7. **Tests with code.** New logic gets unit tests; security-rule changes get rules tests; new pages get at least an e2e smoke test.
8. **Verify before claiming done.** Run `pnpm lint && pnpm typecheck && pnpm test`. Report the real results.
9. **No secrets.** Never write keys, tokens, or `.env*` contents into code, logs, commits or PRs.
10. **Ask when blocked** — especially for new dependencies, security rule changes, pricing, legal/privacy text, and anything destructive.

## 2. Branches, commits, PRs
- Branch names: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, `chore/<short-name>`.
- Commits: Conventional Commits — `feat(quote): add multi-step form`, `fix(rules): block public lead reads`.
- PR description must include: **What**, **Why (PRD ID e.g. F6 / FR-2)**, **How tested**, **Screenshots (UI)**, **Follow-ups**.
- Never push directly to `main`. Never force-push shared branches.

## 3. Agent roles & responsibilities

One agent may play several roles, but it must follow each role's boundaries while doing that work.

### 3.1 Planner / Architect Agent
**Responsibility:** turn PRD items into implementation tasks; keep architecture consistent.
| May modify | May NOT modify |
|---|---|
| `docs/tasks/*.md`, `docs/decisions/*.md` (ADRs) | Application code |
| Propose edits to `ARCHITECTURE.md` (via PR, owner approves) | `ARCHITECTURE-ESSENTIAL.md` or `PRD.md` without owner approval |

### 3.2 Frontend Agent
**Responsibility:** public pages, components, styling, i18n, accessibility, SEO metadata.
| May modify | May NOT modify |
|---|---|
| `src/app/[locale]/**` | `src/lib/firebase/admin.ts` |
| `src/components/**` (except `admin/`) | `firestore.rules`, `storage.rules` |
| `src/styles/**` (tokens: additive only) | `functions/**` |
| `messages/*.json` | Zod schemas (request change from Backend Agent) |
| `public/**` (images, icons) | `package.json` dependencies (ask first) |

### 3.3 Backend Agent
**Responsibility:** Server Actions, route handlers, data-access layer, schemas, Cloud Functions.
| May modify | May NOT modify |
|---|---|
| `src/app/**/actions.ts`, `src/app/api/**` | Visual components / styling |
| `src/lib/data/**`, `src/lib/schemas/**`, `src/lib/firebase/**` | `firestore.rules`, `storage.rules` (that's Security Agent) |
| `functions/**` | Production data |
| `firestore.indexes.json` | |

### 3.4 Admin Panel Agent
**Responsibility:** `/admin` UI — leads inbox, content management, uploads.
| May modify | May NOT modify |
|---|---|
| `src/app/admin/**`, `src/components/admin/**` | Public pages |
| Admin-only Server Actions in `src/app/admin/**/actions.ts` | Security rules, auth claim logic |

### 3.5 Security Agent
**Responsibility:** Firestore/Storage rules, auth & admin claims, App Check, rate limiting, dependency audits.
| May modify | May NOT modify |
|---|---|
| `firestore.rules`, `storage.rules`, `tests/rules/**` | Anything to weaken deny-by-default |
| `src/lib/security/**` (rate limit, App Check verify) | UI/content |
| `scripts/set-admin-claim.ts` | |
**Every rules change must ship with passing rules tests and be approved by the owner.**

### 3.6 QA / Testing Agent
**Responsibility:** write and run tests, check accessibility and performance, report bugs.
| May modify | May NOT modify |
|---|---|
| `tests/**`, `playwright.config.ts`, `vitest.config.ts` | Application code (report bugs; don't fix silently) |

### 3.7 Content & Docs Agent
**Responsibility:** README, docs, translations, SEO copy.
| May modify | May NOT modify |
|---|---|
| `README.md`, `docs/**`, `messages/*.json` | Code, rules, config |
| Seed data in `scripts/seed/**` (clearly marked sample data) | Live Firestore content |

### 3.8 DevOps Agent
**Responsibility:** CI/CD, build config, environments.
| May modify | May NOT modify |
|---|---|
| `.github/workflows/**`, `apphosting.yaml`, `firebase.json`, `next.config.ts` | Secrets values |
| `.env.example` (names only, no values) | Production deploys without owner approval |

## 4. Protected files (owner approval required for ANY agent)
- `PRD.md`
- `ARCHITECTURE-ESSENTIAL.md`
- `firestore.rules`, `storage.rules`
- `package.json` dependency lists, `pnpm-lock.yaml` (except via approved dependency change)
- `.env*` (never read aloud, never commit)
- `.github/workflows/deploy*.yml`
- `LICENSE`

## 5. Never do (any agent)
- Disable, skip or delete failing tests to make CI pass.
- Use `// @ts-ignore`, `eslint-disable`, or `any` to hide errors (unless justified in a comment and PR).
- Write directly to production Firestore/Storage, or run `firebase deploy` to production.
- Delete user data, leads, or uploaded files.
- Expose lead personal data in logs, analytics, or client bundles.
- Add tracking scripts, ads or third-party embeds without approval.
- Copy copyrighted images, fonts or code into the repo.

## 6. Handoffs between agents
When work crosses role boundaries, leave a handoff note in the PR:
```
### Handoff
- To: Backend Agent
- Need: Zod schema field `preferredContact` added to quote schema
- Context: F6 quote form step 4 (PRD §6.1)
- Blocking: yes / no
```

## 7. Definition of Done
- [ ] Meets the PRD acceptance criteria for the feature ID
- [ ] Follows every rule in `ARCHITECTURE-ESSENTIAL.md`
- [ ] Lint, typecheck, tests (and rules tests if relevant) pass
- [ ] Works at 360 px width and on desktop; keyboard-accessible
- [ ] EN + SW strings present
- [ ] Docs updated if behaviour or architecture changed
- [ ] PR description complete
