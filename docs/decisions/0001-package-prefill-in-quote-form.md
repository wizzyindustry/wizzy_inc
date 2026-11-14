# 0001 — How "Request this package" pre-fills the quote form (FR-6)

- **Status:** Accepted (owner, 2026-11-14)
- **Context:** FR-6 says selecting "Request this package" pre-selects the service *and* the
  package. In the data model (ARCHITECTURE §5.1) a package belongs to a **category**
  (`graphic-design` / `web-development`), not to a single service, so there is no one service
  to pre-select.
- **Decision:** The pricing page links to `/quote?package=<packageId>`. The quote form
  pre-selects that package, limits the service choice to the package's category, and the
  visitor picks the specific service. If the category has exactly one published service, it
  may be selected automatically.
- **Consequences:** No schema change. Service detail pages keep using `/quote?service=<slug>`.
  If owners later want packages tied to one service, add an optional `serviceSlug` to the
  package schema (new ADR).
