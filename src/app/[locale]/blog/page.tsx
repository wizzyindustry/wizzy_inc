import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PostCard } from '@/components/blog/PostCard';
import { getPublishedPosts } from '@/lib/data/posts';
import { orFallback } from '@/lib/data/read';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Blog.meta' });
  return pageMetadata({ locale, path: '/blog', title: t('title'), description: t('description') });
}

/** Blog (Company menu): published posts, newest first. Written in Admin → Blog posts. */
export default async function BlogPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Blog');
  const posts = await orFallback(getPublishedPosts(), [], 'blog posts');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>
      {posts.length === 0 ? (
        <p className="mt-8 rounded-md bg-muted p-4">{t('empty')}</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
