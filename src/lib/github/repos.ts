import 'server-only';
import { selectPublicRepos, type GithubRepo } from './select-repos';

/*
 * Public repos from the GitHub REST API (no package, plain fetch). Cached for an hour and
 * tagged, so a push shows up on the site within the hour, or straight away when the owner
 * presses "Refresh now" in Admin → GitHub (revalidateTag(GITHUB_REPOS_TAG)).
 * GITHUB_TOKEN (optional, server only) only raises GitHub's rate limit; this endpoint
 * returns public repos even with a token.
 */

export const GITHUB_REPOS_TAG = 'github-repos';
const ONE_HOUR = 3600;

async function fetchRepoList(username: string, cache: RequestInit & { next?: object }) {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100`,
    {
      headers: {
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'user-agent': 'wizzy-inc-website',
        ...(token && { authorization: `Bearer ${token}` }),
      },
      ...cache,
    },
  );
  if (res.status === 404) throw new Error('GitHub user not found');
  if (!res.ok) throw new Error(`GitHub request failed (HTTP ${res.status})`);
  return res.json() as Promise<unknown>;
}

/** For public pages: cached, refreshed hourly or on demand. */
export async function fetchPublicRepos(
  username: string,
  hidden: readonly string[] = [],
): Promise<GithubRepo[]> {
  const raw = await fetchRepoList(username, {
    next: { revalidate: ONE_HOUR, tags: [GITHUB_REPOS_TAG] },
  });
  return selectPublicRepos(raw, { username, hidden });
}

/** For the admin page: always fresh, nothing hidden (the owner picks what to hide). */
export async function fetchPublicReposFresh(username: string): Promise<GithubRepo[]> {
  const raw = await fetchRepoList(username, { cache: 'no-store' });
  return selectPublicRepos(raw, { username });
}
