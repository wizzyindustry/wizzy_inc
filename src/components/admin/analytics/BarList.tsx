type Row = { label: string; count: number };

type Props = { title: string; rows: Row[]; emptyText: string };

/**
 * Ranked horizontal bars, one colour (part-to-whole / comparison). Each row prints its
 * name and value as text, so the bar is a visual aid, never the only way to read it.
 * Bar widths are data, so they are set with inline `style`.
 */
export function BarList({ title, rows, emptyText }: Props) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <figure className="flex flex-col gap-3 rounded-lg bg-background p-4 shadow-sm">
      <figcaption className="font-semibold">{title}</figcaption>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-1">
              <div className="flex justify-between gap-3 text-sm">
                <span>{row.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {row.count}
                  <span className="sr-only"> / {total}</span>
                </span>
              </div>
              <div aria-hidden="true" className="h-3">
                {row.count > 0 && (
                  <div
                    className="h-full rounded-r bg-primary"
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
