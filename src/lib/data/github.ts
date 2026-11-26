import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { fetchPublicRepos } from '@/lib/github/repos';
import type { GithubRepo } from '@/lib/github/select-repos';
import { githubSettingsSchema, type GithubSettings } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/** Admin → GitHub (settings/github). Null until saved: no GitHub sections are shown. */
export const getGithubSettings = cache(async (): Promise<GithubSettings | null> =>
  orFallback(
    adminDb()
      .doc('settings/github')
      .get()
      .then((snap) => parseDoc(githubSettingsSchema, snap)),
    null,
    'settings/github',
  ),
);

/**
 * The owner's public GitHub repos for the portfolio and home pages, minus hidden ones.
 * Empty when switched off, no username is set, or GitHub can't be reached (the page
 * renders without the section instead of failing).
 */
export const getGithubProjects = cache(
  async (): Promise<{ repos: GithubRepo[]; settings: GithubSettings | null }> => {
    const settings = await getGithubSettings();
    if (!settings?.show || !settings.username) return { repos: [], settings };
    const repos = await orFallback(
      fetchPublicRepos(settings.username, settings.hiddenRepos),
      [],
      'github repos',
    );
    return { repos, settings };
  },
);
