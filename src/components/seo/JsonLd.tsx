import { serializeJsonLd } from '@/lib/seo/json-ld';

/** Renders schema.org structured data. Server component; ships no JavaScript to the browser. */
export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      // Safe: serializeJsonLd escapes "<", so the content cannot end the script tag.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
