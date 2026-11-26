import { LEGAL_DRAFT_DATE, LEGAL_DRAFTS } from '@/lib/legal/drafts';
import { BUILT_IN_CATEGORIES } from '@/lib/portfolio/categories';
import type { EditorKind } from './fields';
import type { Values } from './form-values';

/**
 * What an editor starts with when its document has never been saved. The legal pages start
 * from the drafts the public pages already show, so the owner edits them instead of retyping.
 * Categories start with the two built-in ones; GitHub starts switched on with no username.
 */
export const DEFAULT_DOCS: Partial<Record<EditorKind, Values>> = {
  legal: { ...LEGAL_DRAFTS, lastUpdated: LEGAL_DRAFT_DATE },
  // The categories the site already uses, so the owner adds to them instead of starting empty.
  categories: { items: BUILT_IN_CATEGORIES },
  github: { show: true, username: '', homeCount: 3, hiddenRepos: [] },
  pinterest: { show: true, username: '', boards: [], homeCount: 6, hiddenPins: [] },
};
