import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { getAboutPage } from '@/lib/data/about';
import type { AboutTool } from '@/lib/schemas/content';
import { storageUrl } from '@/lib/utils/storage-url';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';

type Props = { params: Promise<{ locale: string }> };

const SKILL_GROUPS = ['graphicDesign', 'webDevelopment'] as const;
const TOOLS = ['illustrator', 'figma', 'more'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'About.meta' });
  return pageMetadata({ locale, path: '/about', title: t('title'), description: t('description') });
}

/**
 * About (F8): who Panta-wizzy is, skills, tools and working process. The text is edited in
 * admin ("About page"); until then the built-in text from messages/*.json is shown.
 */
export default async function AboutPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('About');
  const about = await getAboutPage();
  const skill = (group: (typeof SKILL_GROUPS)[number]) =>
    about ? localized(about[group], locale) : t(`skills.${group}.description`);
  const tools: AboutTool[] = about?.tools.length
    ? about.tools
    : TOOLS.map((tool) => ({ name: t(`tools.${tool}`) }));

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
        <p className="mt-4 whitespace-pre-line text-lg text-muted-foreground">
          {about ? localized(about.intro, locale) : t('intro')}
        </p>

        <section aria-labelledby="skills-heading" className="mt-12">
          <h2 id="skills-heading" className="font-display text-2xl font-bold">
            {t('skills.heading')}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {SKILL_GROUPS.map((group) => (
              <div key={group} className="rounded-lg border border-border p-6">
                <h3 className="font-semibold">{t(`skills.${group}.title`)}</h3>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {skill(group)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="tools-heading" className="mt-12">
          <h2 id="tools-heading" className="font-display text-2xl font-bold">
            {t('tools.heading')}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tools.map((tool) => (
              <li
                key={tool.name}
                className="flex flex-col items-center gap-3 rounded-lg border border-border p-5 text-center"
              >
                {tool.logo ? (
                  <Image
                    src={storageUrl(tool.logo)}
                    alt={t('tools.logoAlt', { name: tool.name })}
                    width={56}
                    height={56}
                    sizes="56px"
                    // SVG logos are served as they are (the image optimiser does not take SVG).
                    unoptimized={tool.logo.endsWith('.svg')}
                    className="size-14 object-contain"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full bg-muted font-display text-xl font-bold text-primary"
                  >
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-sm font-medium">{tool.name}</span>
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
