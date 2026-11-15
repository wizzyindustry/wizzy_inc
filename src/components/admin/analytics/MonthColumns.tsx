'use client';

import { useTranslations } from 'next-intl';
import { niceMax, type Count } from '@/lib/analytics/lead-stats';

type Props = { title: string; months: Count[] };

const monthLabel = (key: string, style: 'short' | 'long') => {
  const [y, m] = key.split('-').map(Number) as [number, number];
  return new Intl.DateTimeFormat('en-GB', {
    month: style,
    ...(style === 'long' && { year: 'numeric' }),
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, 15)));
};

/**
 * Leads per month: one series, so one colour and no legend (the title names it).
 * Columns ≤ 24px with a 4px rounded top and a 2px gap between neighbours, hairline grid, value on the latest month only,
 * tooltip on hover/focus, and a table view so nothing depends on seeing the bars.
 * Bar heights are data, so they are set with inline `style` (the only inline styles here).
 */
export function MonthColumns({ title, months }: Props) {
  const t = useTranslations('Admin.analytics');
  const max = niceMax(Math.max(0, ...months.map((m) => m.count)));
  const ticks = [max, max / 2, 0];
  const last = months.length - 1;

  return (
    <figure className="flex flex-col gap-3 rounded-lg bg-background p-4 shadow-sm">
      <figcaption className="font-semibold">{title}</figcaption>

      <div className="flex gap-2">
        {/* y-axis ticks */}
        <div className="flex h-48 flex-col justify-between text-right text-xs tabular-nums text-muted-foreground">
          {ticks.map((tick) => (
            <span key={tick} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {tick}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* hairline gridlines */}
          <div aria-hidden="true" className="absolute inset-0 flex h-48 flex-col justify-between">
            {ticks.map((tick) => (
              <span key={tick} className="h-px bg-border" />
            ))}
          </div>

          <ol className="relative flex h-48 items-end" aria-label={title}>
            {months.map((m, i) => {
              const label = `${monthLabel(m.key, 'long')}: ${t('leadsCount', { count: m.count })}`;
              return (
                <li
                  key={m.key}
                  className="group relative flex h-full flex-1 items-end justify-center px-px"
                >
                  {/* Hit target is the whole column slot, bigger than the bar. */}
                  <span
                    tabIndex={0}
                    aria-label={label}
                    className="absolute inset-0 rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                  />
                  {m.count > 0 && (
                    <span
                      aria-hidden="true"
                      className="w-full max-w-6 rounded-t bg-primary"
                      style={{ height: `${(m.count / max) * 100}%` }}
                    />
                  )}
                  {i === last && m.count > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute text-xs font-semibold tabular-nums"
                      style={{ bottom: `calc(${(m.count / max) * 100}% + 2px)` }}
                    >
                      {m.count}
                    </span>
                  )}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block group-focus-within:block"
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* month labels: every month on wider screens, every other on phones */}
          <div aria-hidden="true" className="mt-1 flex text-xs text-muted-foreground">
            {months.map((m, i) => (
              <span
                key={m.key}
                className={`flex-1 text-center ${(last - i) % 2 === 1 ? 'invisible sm:visible' : ''}`}
              >
                {monthLabel(m.key, 'short')}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-primary">{t('tableView')}</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-1 font-normal">{t('table.month')}</th>
              <th className="py-1 text-right font-normal">{t('table.leads')}</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.key} className="border-b border-border">
                <td className="py-1">{monthLabel(m.key, 'long')}</td>
                <td className="py-1 text-right tabular-nums">{m.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
