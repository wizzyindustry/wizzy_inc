import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

const SHOWN = 4;
type Item = { q: string; a: string };

/** Home page: the first few FAQ questions (works without JavaScript) and a link to /faq. */
export async function HomeFaq({ items }: { items: Item[] }) {
  if (items.length === 0) return null;
  const t = await getTranslations('HomePage.faq');

  return (
    <section aria-labelledby="home-faq-heading">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h2 id="home-faq-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <div className="mt-8 flex flex-col gap-3">
          {items.slice(0, SHOWN).map((item, i) => (
            <details key={i} className="group rounded-lg border border-border p-4">
              <summary className="cursor-pointer list-none font-semibold marker:hidden [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-ring">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" className="mt-6 inline-block text-primary underline underline-offset-4">
          {items.length > SHOWN ? t('seeAll', { count: items.length }) : t('more')}
        </Link>
      </div>
    </section>
  );
}
