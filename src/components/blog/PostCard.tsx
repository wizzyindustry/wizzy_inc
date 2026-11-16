import Image from 'next/image';
import { CalendarDays, Newspaper } from 'lucide-react';
import { localized } from '@/lib/i18n/localized';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { BlogPost } from '@/lib/schemas/content';
import { formatLongDate } from '@/lib/utils/format-date';
import { storageUrl } from '@/lib/utils/storage-url';

/** One post in the blog list: cover (or an icon), date, title, short summary. */
export function PostCard({ post, locale }: { post: BlogPost; locale: Locale }) {
  const title = localized(post.title, locale);
  return (
    <article className="lift group relative flex flex-col overflow-hidden rounded-lg border border-border">
      <div className="relative aspect-[16/9] bg-muted">
        {post.coverImage ? (
          <Image
            src={storageUrl(post.coverImage)}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Newspaper aria-hidden="true" className="absolute inset-0 m-auto size-12 text-primary" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-4" />
          <time dateTime={post.publishedAt.toISOString()}>
            {formatLongDate(post.publishedAt, locale)}
          </time>
        </p>
        <h2 className="text-lg font-semibold">
          {/* The whole card is clickable through this link. */}
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 group-hover:text-primary"
          >
            {title}
          </Link>
        </h2>
        <p className="text-sm text-muted-foreground">{localized(post.excerpt, locale)}</p>
      </div>
    </article>
  );
}
