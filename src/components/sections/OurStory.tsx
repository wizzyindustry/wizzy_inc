import { CalendarDays, MapPin, UserRound, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';

type Props = {
  /** "Our story" text (Admin → Company info), or the About introduction until it is written. */
  story: string;
  foundedYear?: number;
  headquarters?: string;
  founderName?: string;
};

/**
 * Home page, right after the hero: the history of Wizzy Inc, then three fact cards
 * (founded, headquarters, founder & CEO). A fact card only appears once the owner has
 * entered that fact — nothing is made up.
 */
export async function OurStory({ story, foundedYear, headquarters, founderName }: Props) {
  const t = await getTranslations('HomePage.story');
  const paragraphs = story.split(/\n\s*\n/).filter((p) => p.trim() !== '');
  const facts: { key: string; Icon: LucideIcon; value: string }[] = [];
  if (foundedYear) facts.push({ key: 'founded', Icon: CalendarDays, value: String(foundedYear) });
  if (headquarters) facts.push({ key: 'headquarters', Icon: MapPin, value: headquarters });
  if (founderName) facts.push({ key: 'founder', Icon: UserRound, value: founderName });

  return (
    <section aria-labelledby="story-heading">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              {t('eyebrow')}
            </p>
            <h2 id="story-heading" className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              {t('heading')}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-lg whitespace-pre-line text-muted-foreground">
                {p}
              </p>
            ))}
            <Button asChild variant="outline" className="mt-2">
              <Link href="/about">{t('more')}</Link>
            </Button>
          </div>
        </div>

        {facts.length > 0 && (
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {facts.map(({ key, Icon, value }) => (
              <div
                key={key}
                data-reveal
                className="lift flex items-center gap-4 rounded-lg border border-border bg-background p-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                </span>
                <div className="flex flex-col-reverse">
                  <dd className="text-lg font-semibold">{value}</dd>
                  <dt className="text-sm text-muted-foreground">{t(`facts.${key}`)}</dt>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
