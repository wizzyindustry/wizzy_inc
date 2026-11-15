import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';

type Props = { params: Promise<{ locale: string }> };

const SKILL_GROUPS = ['graphicDesign', 'webDevelopment'] as const;
const TOOLS = ['illustrator', 'figma', 'more'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'About.meta' });
  return pageMetadata({ locale, path: '/about', title: t('title'), description: t('description') });
}

/** About (F8): who Panta-wizzy is, skills, tools and working process. Text is owner content. */
export default async function AboutPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('About');

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('intro')}</p>

        <section aria-labelledby="skills-heading" className="mt-12">
          <h2 id="skills-heading" className="font-display text-2xl font-bold">
            {t('skills.heading')}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {SKILL_GROUPS.map((group) => (
              <div key={group} className="rounded-lg border border-border p-6">
                <h3 className="font-semibold">{t(`skills.${group}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`skills.${group}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="tools-heading" className="mt-12">
          <h2 id="tools-heading" className="font-display text-2xl font-bold">
            {t('tools.heading')}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {TOOLS.map((tool) => (
              <li key={tool} className="rounded-full bg-muted px-4 py-2 text-sm">
                {t(`tools.${tool}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <ProcessSteps />
      <CtaBanner />
    </>
  );
}
