# 0002 — Contact page messages are stored as leads (F9)

- **Status:** Accepted (owner, 2026-11-15)
- **Context:** F9 needs a contact form, and ARCHITECTURE §4.1 names `submitContact`, but no
  collection was defined for contact messages. A separate collection would need a security-rules
  change, a second email function and a second admin inbox.
- **Decision:** A contact message is a document in `leads` with `kind: "contact"`, no
  `serviceSlug`, no attachments, and the message in `description`. Quote requests get
  `kind: "quote"`; older docs without `kind` count as quotes.
- **Consequences:**
  - Contact messages get a `WZ-YYYY-NNNN` reference, trigger the owner email (`onLeadCreated`
    shows "New contact message") and appear in the same admin inbox and status pipeline.
  - No Firestore/Storage rules change.
  - `serviceSlug` is optional in `leadSchema`; admin screens must handle leads without a service.
  - Same rate limit bucket as planned: 5 contact messages per IP per hour.
