import { describe, expect, it } from 'vitest';
import { CONTENT_FIELDS } from '@/components/admin/content/fields';
import { setPath, toFormValues, toSaveData } from '@/components/admin/content/form-values';
import { repoTitle, selectPublicRepos } from '@/lib/github/select-repos';
import { BUILT_IN_CATEGORIES, categoryName, slugToLabel } from '@/lib/portfolio/categories';
import { categoriesInputSchema, githubInputSchema } from '@/lib/schemas/content-admin';
import { portfolioItemSchema } from '@/lib/schemas/content';

const repo = (overrides: Record<string, unknown> = {}) => ({
  name: 'jarvis',
  description: 'Voice assistant',
  html_url: 'https://github.com/someone/jarvis',
  homepage: '',
  language: 'Python',
  stargazers_count: 2,
  fork: false,
  archived: false,
  private: false,
  visibility: 'public',
  pushed_at: '2026-11-25T11:21:54Z',
  ...overrides,
});

describe('GitHub repos on the site', () => {
  it('shows only public, own, active repos, newest first', () => {
    const repos = selectPublicRepos(
      [
        repo({ name: 'old', pushed_at: '2026-01-01T00:00:00Z' }),
        repo({ name: 'secret', private: true }),
        repo({ name: 'internal', visibility: 'internal' }),
        repo({ name: 'patient', fork: true }),
        repo({ name: 'retired', archived: true }),
        repo({ name: 'new', pushed_at: '2026-11-26T00:00:00Z' }),
      ],
      { username: 'someone' },
    );
    expect(repos.map((r) => r.name)).toEqual(['new', 'old']);
  });

  it('leaves out the profile README repo and repos hidden in the admin (any case)', () => {
    const repos = selectPublicRepos(
      [repo({ name: 'SomeOne' }), repo({ name: 'blog' }), repo({ name: 'Jarvis' })],
      { username: 'someone', hidden: ['jarvis'] },
    );
    expect(repos.map((r) => r.name)).toEqual(['blog']);
  });

  it('keeps only safe links', () => {
    const [withSite] = selectPublicRepos([repo({ homepage: 'pantawizzy.online' })], {
      username: 'x',
    });
    expect(withSite?.homepage).toBe('https://pantawizzy.online/');
    const [badSite] = selectPublicRepos([repo({ homepage: 'javascript:alert(1)' })], {
      username: 'x',
    });
    expect(badSite?.homepage).toBeNull();
    // The repo link must point at github.com.
    expect(
      selectPublicRepos([repo({ html_url: 'https://evil.example/x' })], { username: 'x' }),
    ).toEqual([]);
  });

  it('ignores unexpected answers instead of failing', () => {
    expect(selectPublicRepos({ message: 'API rate limit exceeded' }, { username: 'x' })).toEqual(
      [],
    );
    expect(selectPublicRepos([{ name: 'broken' }], { username: 'x' })).toEqual([]);
  });

  it('turns repo names into readable titles', () => {
    expect(repoTitle('Tunza-Waleti--ipt-project-')).toBe('Tunza Waleti ipt project');
    expect(repoTitle('python_projects')).toBe('python projects');
  });

  it('settings: username format, home count and the default editor values', () => {
    const base = { show: true, homeCount: 3, hiddenRepos: [] };
    expect(githubInputSchema.safeParse({ ...base, username: 'wizzyindustry' }).success).toBe(true);
    expect(githubInputSchema.safeParse({ ...base, username: 'bad name' }).success).toBe(false);
    expect(githubInputSchema.safeParse({ ...base, username: '-dash' }).success).toBe(false);
    expect(githubInputSchema.safeParse({ ...base, homeCount: 9 }).success).toBe(false);

    const fields = CONTENT_FIELDS.github;
    let form = toFormValues(fields, { show: true, homeCount: 3, hiddenRepos: ['blog'] });
    form = setPath(form, 'username', ' wizzyindustry ');
    const parsed = githubInputSchema.parse(toSaveData(fields, form));
    expect(parsed).toEqual({
      show: true,
      username: 'wizzyindustry',
      homeCount: 3,
      hiddenRepos: ['blog'],
    });
  });
});

describe('portfolio categories', () => {
  it('a project may use any category slug, not only the two built-in ones', () => {
    const shape = portfolioItemSchema.shape.category;
    expect(shape.safeParse('mobile-apps').success).toBe(true);
    expect(shape.safeParse('Mobile Apps').success).toBe(false);
  });

  it('the list rejects duplicate slugs and points at the duplicate', () => {
    const name = { en: 'Apps', sw: '' };
    const result = categoriesInputSchema.safeParse({
      items: [
        { slug: 'apps', name },
        { slug: 'apps', name },
      ],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['items', 1, 'slug']);
    expect(categoriesInputSchema.safeParse({ items: BUILT_IN_CATEGORIES }).success).toBe(true);
  });

  it('names follow the language, with English and slug fallbacks', () => {
    const list = [{ slug: 'mobile-apps', name: { en: 'Mobile apps', sw: '' } }];
    expect(categoryName('web-development', BUILT_IN_CATEGORIES, 'sw')).toBe(
      'Utengenezaji wa Tovuti',
    );
    expect(categoryName('mobile-apps', list, 'sw')).toBe('Mobile apps');
    expect(categoryName('deleted-one', list, 'en')).toBe('Deleted one');
    expect(slugToLabel('ui-ux')).toBe('Ui ux');
  });
});
