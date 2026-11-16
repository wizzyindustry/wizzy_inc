import { getTranslations } from 'next-intl/server';
import { BadgeCheck, Languages, Layers, MapPin, type LucideIcon } from 'lucide-react';

const ICONS: LucideIcon[] = [Layers, BadgeCheck, Languages, MapPin];
type Point = { title: string; text: string };

/**
 * Home page "Why choose us". Points come from Admin → Settings; until the owner adds some,
 * built-in points that describe what the site really offers are shown.
 */
export async function WhyChooseUs({ points }: { points: Point[] }) {
  const t = await getTranslations('HomePage.why');
  const shown: Point[] = points.length
    ? points
    : (['oneStop', 'clearPrices', 'bilingual', 'local'] as const).map((key) => ({
        title: t(`defaults.${key}.title`),
        text: t(`defaults.${key}.text`),
      }));

  return (
    <section aria-labelledby="why-heading" className="bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="why-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((point, i) => {
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <li key={i} className="rounded-lg bg-background p-6">
                <Icon aria-hidden="true" className="size-8 text-primary" />
                <h3 className="mt-4 font-semibold">{point.title}</h3>
                <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
                  {point.text}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
