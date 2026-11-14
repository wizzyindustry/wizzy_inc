'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type FilterOption = { id: string; label: string };
export type FilterItem = { id: string; category: string; card: ReactNode };

type Props = {
  options: FilterOption[]; // first option is "All" with id "all"
  items: FilterItem[];
  groupLabel: string;
  /** Pre-translated status text per count, e.g. { 0: "No projects", 1: "1 project", ... } */
  statusByCount: Record<number, string>;
};

/**
 * Category filter for the portfolio grid (FR-7): filters in the browser without a page
 * reload and keeps ?category= in the URL so a filtered view can be shared.
 * Cards themselves are rendered on the server and passed in as `card`.
 */
export function PortfolioFilter({ options, items, groupLabel, statusByCount }: Props) {
  const [active, setActive] = useState('all');

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (fromUrl && options.some((o) => o.id === fromUrl)) setActive(fromUrl);
  }, [options]);

  function select(id: string) {
    setActive(id);
    const url = new URL(window.location.href);
    if (id === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', id);
    window.history.replaceState(null, '', url);
  }

  const visible = active === 'all' ? items : items.filter((i) => i.category === active);

  return (
    <div>
      <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={active === option.id}
            onClick={() => select(option.id)}
            className={cn(
              'h-10 rounded-full border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              active === option.id
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-foreground hover:bg-muted',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p role="status" className="mt-4 text-sm text-muted-foreground">
        {statusByCount[visible.length] ?? String(visible.length)}
      </p>

      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <li key={item.id}>{item.card}</li>
        ))}
      </ul>
    </div>
  );
}
