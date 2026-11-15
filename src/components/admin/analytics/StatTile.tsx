type Props = { label: string; value: string; note?: string };

/** One headline number (label · value · optional note). */
export function StatTile({ label, value, note }: Props) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-background p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
