import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Markdown } from '@/components/ui/Markdown';
import { getPostBySlug, getPublishedPosts } from '@/lib/data/posts';
import { orFallback } from '@/lib/data/read';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';
import { formatLongDate } from '@/lib/utils/format-date';
import { storageUrl } from '@/lib/utils/storage-url';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Pre-render known posts when Firestore is reachable; others render on first request (ISR). */
export async function generateStaticParams() {
  const posts = await orFallback(getPublishedPosts(), [], 'posts (static params)');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requested, slug } = await params;
  const locale = toLocale(requested);
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const meta = pageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: localized(post.title, locale),
    description: localized(post.excerpt, locale),
  });
  return post.coverImage
    ? { ...meta, openGraph: { ...meta.openGraph, images: [storageUrl(post.coverImage)] } }
    : meta;
}

/** One blog post: cover, date, author and the markdown body. */
export default async function BlogPostPage({ params }: Props) {
  const { locale: requested, slug } = await params;
  const locale = toLocale(requested);
  setRequestLocale(locale);
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const t = await getTranslations('Blog');

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="text-sm text-primary underline-offset-4 hover:underline">
        ← {t('back')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
        {localized(post.title, locale)}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        <time dateTime={post.publishedAt.toISOString()}>
          {formatLongDate(post.publishedAt, locale)}
        </time>
        {post.author && <> · {t('by', { author: post.author })}</>}
      </p>
      {post.coverImage && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
          <Image
            src={storageUrl(post.coverImage)}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mt-8">
        <Markdown>{localized(post.body, locale)}</Markdown>
      </div>
      <div className="mt-10 rounded-lg bg-muted p-6">
        <p className="font-semibold">{t('ctaHeading')}</p>
        <Button asChild className="mt-4">
          <Link href="/quote">{t('ctaButton')}</Link>
        </Button>
      </div>
    </article>
  );
}
