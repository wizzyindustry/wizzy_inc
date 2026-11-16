/**
 * Cloud Functions entry point. Each function lives in its own file.
 * Planned (later slices): setAdminClaim, cleanupOrphanUploads — see ARCHITECTURE.md §4.3.
 */
export { onLeadCreated } from './on-lead-created.js';
export { onSubscriberCreated } from './on-subscriber-created.js';
