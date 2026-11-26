'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { listGithubRepos, refreshGithubRepos } from '@/app/admin/content/actions';
import { Button } from '@/components/ui/Button';
import { useAdminSession } from '../AdminSession';

type Repo = { name: string; description: string | null };

type Props = {
  id: string;
  label: string;
  hint?: string;
  username: string;
  /** Names of repos the owner chose not to show. */
  hidden: string[];
  error?: string;
  onChange: (hidden: string[]) => void;
};

/**
 * Admin → GitHub: every public repo of the account with a "Show on the website" checkbox.
 * Unticked repos are saved in `hiddenRepos`. Private repos never appear here or on the site.
 */
export function RepoChecklist({ id, label, hint, username, hidden, error, onChange }: Props) {
  const t = useTranslations('Admin.content.github');
  const { getIdToken } = useAdminSession();
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      setBusy(true);
      setStatus(null);
      try {
        const result = await listGithubRepos(await getIdToken(), name.trim());
        if (result.ok) setRepos(result.data.repos);
        else {
          setRepos(null);
          setStatus({
            kind: 'error',
            text: t(result.error === 'githubUsername' ? 'userNotFound' : 'loadFailed'),
          });
        }
      } catch {
        setStatus({ kind: 'error', text: t('loadFailed') });
      } finally {
        setBusy(false);
      }
    },
    [getIdToken, t],
  );

  // Load once for the saved username; after typing a new one the owner presses "Load".
  const [initialUsername] = useState(username);
  useEffect(() => {
    void load(initialUsername);
  }, [initialUsername, load]);

  async function refreshSite() {
    setBusy(true);
    setStatus(null);
    try {
      const result = await refreshGithubRepos(await getIdToken());
      setStatus(
        result.ok
          ? { kind: 'ok', text: t('refreshed') }
          : { kind: 'error', text: t('refreshFailed') },
      );
    } catch {
      setStatus({ kind: 'error', text: t('refreshFailed') });
    } finally {
      setBusy(false);
    }
  }

  const isHidden = (name: string) => hidden.some((h) => h.toLowerCase() === name.toLowerCase());
  const toggle = (name: string, show: boolean) =>
    onChange(
      show ? hidden.filter((h) => h.toLowerCase() !== name.toLowerCase()) : [...hidden, name],
    );

  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="mb-1 font-medium">{label}</legend>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !username.trim()}
          onClick={() => void load(username)}
        >
          {t('load')}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={refreshSite}>
          {t('refresh')}
        </Button>
      </div>

      {busy && (
        <p role="status" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      )}
      {!username.trim() && <p className="text-sm text-muted-foreground">{t('needUsername')}</p>}

      {repos && repos.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('noRepos')}</p>
      )}
      {repos && repos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {repos.map((repo) => (
            <li key={repo.name}>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 size-4"
                  checked={!isHidden(repo.name)}
                  onChange={(e) => toggle(repo.name, e.target.checked)}
                  aria-label={t('showRepo', { name: repo.name })}
                />
                <span className="flex flex-col">
                  <span className="font-medium">{repo.name}</span>
                  {repo.description && (
                    <span className="text-sm text-muted-foreground">{repo.description}</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {status && (
        <p
          role={status.kind === 'error' ? 'alert' : 'status'}
          className={`text-sm font-medium ${status.kind === 'error' ? 'text-danger' : 'text-success'}`}
        >
          {status.text}
        </p>
      )}
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </fieldset>
  );
}
