import type { Lead, LeadStatus } from '@/lib/schemas/lead';
import { formatTZS } from '@/lib/utils/format-tzs';

const TZ = 'Africa/Dar_es_Salaam';

/** "15 Nov 2026, 10:25" in Tanzania time (admin UI is English). */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: TZ,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: TZ }).format(date);
}

export function formatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Budget range as stored on the lead, or null when the client was not sure. */
export function formatBudget(range: Lead['budgetRangeTZS']): string | null {
  if (!range) return null;
  if (range.max === undefined) return `${formatTZS(range.min, 'en')}+`;
  return `${formatTZS(range.min, 'en')} – ${formatTZS(range.max, 'en')}`;
}

/** Token-based colours for each pipeline status. */
export const STATUS_CLASSES: Record<LeadStatus, string> = {
  new: 'bg-primary text-primary-foreground',
  contacted: 'bg-accent text-accent-foreground',
  quoted: 'bg-foreground text-background',
  won: 'bg-success text-primary-foreground',
  lost: 'bg-muted text-muted-foreground border border-border',
};
