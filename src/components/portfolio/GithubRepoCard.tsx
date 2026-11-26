import { getTranslations } from 'next-intl/server';
import { ExternalLink, FolderGit2, Star } from 'lucide-react';
import type { GithubRepo } from '@/lib/github/select-repos';
import { repoTitle } from '@/lib/github/select-repos';
import type { Locale } from '@/lib/i18n/routing';
import { formatMonthYear } from '@/lib/utils/format-date';

type Props = { repo: GithubRepo; locale: Locale };

/** One public GitHub repo: name, description, language, stars, last update, links. */
export async function GithubRepoCard({ repo, locale }: Props) {
  const t = await getTranslations('Github');
  const title = repoTitle(repo.name);

  return (
    <article className="lift flex h-full flex-col gap-3 rounded-lg border border-border p-5">
      <div className="flex items-start gap-3">
        <FolderGit2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <h3 className="font-semibold break-words">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{repo.description ?? t('noDescription')}</p>
      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {repo.language && (
          <div className="flex gap-1">
            <dt className="sr-only">{t('language')}</dt>
            <dd>{repo.language}</dd>
          </div>
        )}
        {repo.stars > 0 && (
          <div className="flex items-center gap-1">
            <dt>
              <Star aria-hidden="true" className="size-3.5" />
              <span className="sr-only">{t('stars')}</span>
            </dt>
            <dd>{repo.stars}</dd>
          </div>
        )}
        {repo.pushedAt && (
          <div className="flex gap-1">
            <dt>{t('updated')}</dt>
            <dd>{formatMonthYear(new Date(repo.pushedAt), locale)}</dd>
          </div>
        )}
      </dl>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
        >
          {t('viewCode')}
          <span className="sr-only">{t('aboutRepo', { name: title })}</span>
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            {t('viewLive')}
            <span className="sr-only">{t('aboutRepo', { name: title })}</span>
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}
