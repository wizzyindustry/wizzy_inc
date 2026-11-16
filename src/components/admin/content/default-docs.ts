import { LEGAL_DRAFT_DATE, LEGAL_DRAFTS } from '@/lib/legal/drafts';
import type { EditorKind } from './fields';
import type { Values } from './form-values';

/**
 * What an editor starts with when its document has never been saved. The legal pages start
 * from the drafts the public pages already show, so the owner edits them instead of retyping.
 */
export const DEFAULT_DOCS: Partial<Record<EditorKind, Values>> = {
  legal: { ...LEGAL_DRAFTS, lastUpdated: LEGAL_DRAFT_DATE },
};
