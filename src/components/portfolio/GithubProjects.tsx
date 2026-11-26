import { getTranslations } from 'next-intl/server';
import type { GithubRepo } from '@/lib/github/select-repos';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import { GithubRepoCard } from './GithubRepoCard';

type Props = {
  repos: GithubRepo[];
  username: string;
  locale: Locale;
  /** "portfolio": all repos; "home": the latest few with a link to the portfolio page. */
  variant: 'portfolio' | 'home';
};

/** Public GitHub repos, newest first. Renders nothing when there are none to show. */
export async function GithubProjects({ repos, username, locale, variant }: Props) {
  if (repos.length === 0) return null;
  const t = await getTranslations('Github');
  const headingId = `github-${variant}-heading`;

  return (
    <section
      id={variant === 'portfolio' ? 'github' : undefined}
      aria-labelledby={headingId}
      className={variant === 'home' ? 'mx-auto max-w-6xl px-4 py-14' : 'mt-16 scroll-mt-24'}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id={headingId} className="font-display text-2xl font-bold sm:text-3xl">
            {t(variant === 'home' ? 'homeHeading' : 'heading')}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t('intro')}</p>
        </div>
        {variant === 'home' ? (
          <Link
            href="/portfolio#github"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('viewAll')}
          </Link>
        ) : (
          <a
            href={`https://github.com/${encodeURIComponent(username)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('profile')}
          </a>
        )}
      </div>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <li key={repo.name}>
            <GithubRepoCard repo={repo} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
