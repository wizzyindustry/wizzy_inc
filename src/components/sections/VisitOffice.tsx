import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { OfficeMap, type OfficeView } from './OfficeMap';

/** Home page "Visit our office": office addresses with the map beside them. */
export async function VisitOffice({ offices }: { offices: OfficeView[] }) {
  if (offices.length === 0) return null;
  const t = await getTranslations('HomePage.visit');

  return (
    <section aria-labelledby="visit-heading">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="visit-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('intro')}</p>
        <div className="mt-8">
          <OfficeMap offices={offices} />
        </div>
        <Link
          href="/offices"
          className="mt-6 inline-block font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('all')}
        </Link>
      </div>
    </section>
  );
}
