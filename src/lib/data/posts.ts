import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { blogPostSchema, type BlogPost } from '@/lib/schemas/content';
import { queryDocs } from './read';

const published = () => adminDb().collection('posts').where('published', '==', true);

/**
 * Published blog posts, newest first. Sorted here rather than in the query, so no extra
 * Firestore index is needed (the blog stays small).
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await queryDocs(blogPostSchema, published());
  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

/** Cached per request so generateMetadata and the page share one read. */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const [post] = await queryDocs(blogPostSchema, published().where('slug', '==', slug).limit(1));
  return post ?? null;
});
