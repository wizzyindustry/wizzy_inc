import { getTranslations } from 'next-intl/server';
import type { Pin } from '@/lib/pinterest/parse-feed';
import { Link } from '@/lib/i18n/navigation';
import { PinCard } from './PinCard';
import { PortfolioFilter } from './PortfolioFilter';

type Props = {
  pins: Pin[];
  username: string;
  /** "portfolio": all pins with a board filter; "home": the newest few. */
  variant: 'portfolio' | 'home';
};

/** Designs from the owner's public Pinterest boards, newest first. Nothing when empty. */
export async function PinterestPins({ pins, username, variant }: Props) {
  if (pins.length === 0) return null;
  const t = await getTranslations('Pinterest');
  const headingId = `pinterest-${variant}-heading`;

  // Board filter buttons, in the order the boards first appear (newest pins first).
  const boards = [...new Map(pins.map((p) => [p.board, p.boardTitle])).entries()];
  const statusByCount = Object.fromEntries(
    Array.from({ length: pins.length + 1 }, (_, n) => [n, t('showing', { count: n })]),
  );

  return (
    <section
      id={variant === 'portfolio' ? 'pinterest' : undefined}
      aria-labelledby={headingId}
      className={variant === 'home' ? 'mx-auto max-w-6xl px-4 py-14' : 'mt-16 scroll-mt-24'}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id={headingId} className="font-display text-2xl font-bold sm:text-3xl">
            {t(variant === 'home' ? 'homeHeading' : 'heading')}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t('intro')}</p>
        </div>
        {variant === 'home' ? (
          <Link
            href="/portfolio#pinterest"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('viewAll')}
          </Link>
        ) : (
          <a
            href={`https://www.pinterest.com/${encodeURIComponent(username)}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('profile')}
          </a>
        )}
      </div>

      {variant === 'portfolio' && boards.length > 1 ? (
        <div className="mt-8">
          <PortfolioFilter
            param="board"
            groupLabel={t('filterLabel')}
            options={[
              { id: 'all', label: t('all') },
              ...boards.map(([id, label]) => ({ id, label })),
            ]}
            statusByCount={statusByCount}
            items={pins.map((pin) => ({
              id: pin.id,
              category: pin.board,
              card: <PinCard pin={pin} />,
            }))}
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pins.map((pin) => (
            <li key={pin.id}>
              <PinCard pin={pin} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
