import { getTranslations } from 'next-intl/server';

const STEPS = ['request', 'agree', 'create', 'deliver'] as const;

export async function ProcessSteps() {
  const t = await getTranslations('HomePage.process');

  return (
    <section aria-labelledby="process-heading" className="bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="process-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step} className="rounded-lg bg-background p-6">
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
              >
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{t(`${step}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(`${step}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
