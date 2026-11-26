import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ExternalLink } from 'lucide-react';
import type { Pin } from '@/lib/pinterest/parse-feed';

type Props = { pin: Pin };

/** One Pinterest pin: the picture, its title (or board name), and a link to the pin. */
export async function PinCard({ pin }: Props) {
  const t = await getTranslations('Pinterest');
  const name = pin.title || pin.boardTitle;

  return (
    <article className="lift group overflow-hidden rounded-lg border border-border">
      <a href={pin.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-[4/5] bg-muted">
          <Image
            src={pin.image}
            alt={
              pin.title
                ? t('pinAlt', { title: pin.title })
                : t('pinAltBoard', { board: pin.boardTitle })
            }
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-1 p-4">
          {/* Untitled pins use the board name as their title; don't show it twice. */}
          {pin.title && (
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {pin.boardTitle}
            </p>
          )}
          <h3 className="line-clamp-2 font-semibold group-hover:text-primary">{name}</h3>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
            {t('viewPin')}
            <span className="sr-only">{t('aboutPin', { name })}</span>
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </p>
        </div>
      </a>
    </article>
  );
}
