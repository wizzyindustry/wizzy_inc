import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { testimonialSchema, type Testimonial } from '@/lib/schemas/content';
import { queryDocs } from './read';

/** Only published testimonials with recorded consent (PRD F11). */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const query = adminDb()
    .collection('testimonials')
    .where('published', '==', true)
    .where('consentGiven', '==', true);
  return queryDocs(testimonialSchema, query);
}
