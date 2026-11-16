import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';

/** Home page: who is behind Wizzy Inc (first paragraph of the About introduction). */
export async function AboutTeaser({ intro }: { intro: string }) {
  const t = await getTranslations('HomePage.about');
  const firstParagraph = intro.split(/\n\s*\n/)[0] ?? intro;

  return (
    <section aria-labelledby="about-heading">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            {t('eyebrow')}
          </p>
          <h2 id="about-heading" className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            {t('heading')}
          </h2>
        </div>
        <div className="flex flex-col items-start gap-6">
          <p className="text-lg whitespace-pre-line text-muted-foreground">{firstParagraph}</p>
          <Button asChild variant="outline">
            <Link href="/about">{t('more')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
