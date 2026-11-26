import { z } from 'zod';

/*
 * Turning GitHub's repo list into what the site shows. Kept free of `server-only` and
 * network code so it can be unit tested. Only PUBLIC repos ever pass: the list endpoint
 * already returns public repos only, and anything marked private is dropped again here.
 */

/** The fields we use from GET /users/{username}/repos (everything else is ignored). */
const apiRepoSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  html_url: z.string(),
  homepage: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  stargazers_count: z.number().int().nonnegative().optional(),
  fork: z.boolean().optional(),
  archived: z.boolean().optional(),
  disabled: z.boolean().optional(),
  private: z.boolean(),
  visibility: z.string().optional(),
  pushed_at: z.string().nullable().optional(),
});

export type GithubRepo = {
  name: string;
  description: string | null;
  /** https://github.com/<owner>/<name> */
  url: string;
  /** Live site from the repo's "Website" setting (http/https only). */
  homepage: string | null;
  language: string | null;
  stars: number;
  /** ISO date of the last push (newest first). */
  pushedAt: string | null;
};

function safeWebUrl(value: string | null | undefined, host?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (host && url.hostname !== host) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Public, own (not forked), active repos, newest push first. Leaves out the profile
 * README repo (named like the account) and repos the owner hid in the admin.
 */
export function selectPublicRepos(
  raw: unknown,
  options: { username: string; hidden?: readonly string[] },
): GithubRepo[] {
  if (!Array.isArray(raw)) return [];
  const hidden = new Set((options.hidden ?? []).map((name) => name.toLowerCase()));
  const profileRepo = options.username.toLowerCase();

  const repos: GithubRepo[] = [];
  for (const item of raw) {
    const parsed = apiRepoSchema.safeParse(item);
    if (!parsed.success) continue;
    const repo = parsed.data;
    if (repo.private || (repo.visibility && repo.visibility !== 'public')) continue;
    if (repo.fork || repo.archived || repo.disabled) continue;
    const name = repo.name.toLowerCase();
    if (name === profileRepo || hidden.has(name)) continue;
    const url = safeWebUrl(repo.html_url, 'github.com');
    if (!url) continue;
    repos.push({
      name: repo.name,
      description: repo.description?.trim() || null,
      url,
      homepage: safeWebUrl(repo.homepage),
      language: repo.language ?? null,
      stars: repo.stargazers_count ?? 0,
      pushedAt: repo.pushed_at ?? null,
    });
  }
  return repos.sort((a, b) => (b.pushedAt ?? '').localeCompare(a.pushedAt ?? ''));
}

/** "Tunza-Waleti--ipt-project-" -> "Tunza Waleti ipt project" (cards show a readable title). */
export function repoTitle(name: string): string {
  return name.replace(/[-_]+/g, ' ').trim() || name;
}
