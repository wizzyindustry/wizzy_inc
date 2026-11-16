import type { Subscriber } from '@/lib/schemas/subscriber';

/** One CSV cell: quoted, and never starting with a formula character (spreadsheet safety). */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function subscribersCsv(
  rows: Pick<Subscriber, 'email' | 'locale' | 'source' | 'createdAt'>[],
) {
  const lines = [['email', 'language', 'signed_up_from', 'date'].join(',')];
  for (const row of rows) {
    lines.push(
      [row.email, row.locale, row.source, row.createdAt.toISOString()].map(csvCell).join(','),
    );
  }
  return `${lines.join('\r\n')}\r\n`;
}
