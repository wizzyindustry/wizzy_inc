import { Award, BriefcaseBusiness, Clock, Smile, TrendingUp, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { CountUp } from './CountUp';

const ICONS: LucideIcon[] = [Smile, BriefcaseBusiness, Clock, Award, TrendingUp];
type Stat = { value: string; label: string };

/**
 * Home page "Our impact": the owner's own numbers (clients, uptime, projects completed…) from
 * Admin → Company info, counting up as they appear. Not shown until numbers are entered.
 */
export async function ImpactNumbers({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  const t = await getTranslations('HomePage.impact');

  return (
    <section aria-labelledby="impact-heading" className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="impact-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-background/20 p-6"
              >
                {/* Label first for screen readers; shown under the number. */}
                <dt className="order-2 text-background/80">{stat.label}</dt>
                <dd className="order-1 font-display text-4xl font-bold">
                  <Icon aria-hidden="true" className="mb-3 block size-7" />
                  <CountUp value={stat.value} />
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
