import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';

type Props = { headline: string; subheadline: string };

/** Text-only hero: the headline is the LCP element, so it loads instantly on mobile data. */
export async function Hero({ headline, subheadline }: Props) {
  const t = await getTranslations('HomePage.hero');

  return (
    <section className="bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:py-20">
        <h1 className="max-w-3xl font-display text-3xl leading-tight font-bold sm:text-5xl">
          {headline}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{subheadline}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/quote">{t('primaryCta')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/portfolio">{t('secondaryCta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
