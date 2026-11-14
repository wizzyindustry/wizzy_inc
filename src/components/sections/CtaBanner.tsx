import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';

export async function CtaBanner() {
  const t = await getTranslations('HomePage.cta');

  return (
    <section aria-labelledby="cta-heading" className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14">
        <h2 id="cta-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <p className="max-w-2xl">{t('description')}</p>
        <Button asChild variant="outline" className="border-transparent">
          <Link href="/quote">{t('button')}</Link>
        </Button>
      </div>
    </section>
  );
}
