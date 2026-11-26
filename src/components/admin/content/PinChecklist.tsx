'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { listPinterestPins, refreshPinterestPins } from '@/app/admin/content/actions';
import { Button } from '@/components/ui/Button';
import { useAdminSession } from '../AdminSession';

type PinSummary = { id: string; title: string; image: string; boardTitle: string };

type Props = {
  id: string;
  label: string;
  hint?: string;
  username: string;
  boards: string[];
  /** Ids of pins the owner chose not to show. */
  hidden: string[];
  error?: string;
  onChange: (hidden: string[]) => void;
};

/**
 * Admin → Pinterest: the pins of the chosen boards with a "Show on the website" checkbox.
 * Unticked pins are saved in `hiddenPins`. Secret boards have no public feed, so never appear.
 */
export function PinChecklist({
  id,
  label,
  hint,
  username,
  boards,
  hidden,
  error,
  onChange,
}: Props) {
  const t = useTranslations('Admin.content.pinterest');
  const { getIdToken } = useAdminSession();
  const [pins, setPins] = useState<PinSummary[] | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = username.trim() !== '' && boards.length > 0;

  const load = useCallback(
    async (name: string, list: string[]) => {
      if (!name.trim() || list.length === 0) return;
      setBusy(true);
      setStatus(null);
      try {
        const result = await listPinterestPins(await getIdToken(), {
          username: name.trim(),
          boards: list,
        });
        if (result.ok) {
          setPins(result.data.pins);
          setMissing(result.data.missingBoards);
        } else {
          setPins(null);
          setStatus({
            kind: 'error',
            text: t(
              result.error === 'pinterestUsername'
                ? 'badUsername'
                : result.error === 'pinterestBoards'
                  ? 'badBoards'
                  : 'loadFailed',
            ),
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

  // Load once for the saved settings; after changes the owner presses "Load".
  const [initial] = useState({ username, boards });
  useEffect(() => {
    void load(initial.username, initial.boards);
  }, [initial, load]);

  async function refreshSite() {
    setBusy(true);
    setStatus(null);
    try {
      const result = await refreshPinterestPins(await getIdToken());
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

  const toggle = (pinId: string, show: boolean) =>
    onChange(show ? hidden.filter((h) => h !== pinId) : [...hidden, pinId]);

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
          disabled={busy || !ready}
          onClick={() => void load(username, boards)}
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
      {!ready && <p className="text-sm text-muted-foreground">{t('needSetup')}</p>}
      {missing.length > 0 && (
        <p className="text-sm font-medium text-danger">
          {t('missingBoards', { boards: missing.join(', ') })}
        </p>
      )}
      {pins && pins.length === 0 && <p className="text-sm text-muted-foreground">{t('noPins')}</p>}

      {pins && pins.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {pins.map((pin) => {
            const name = pin.title || pin.boardTitle;
            return (
              <li key={pin.id}>
                <label className="flex flex-col gap-1.5">
                  <Image
                    src={pin.image}
                    alt=""
                    width={160}
                    height={200}
                    unoptimized
                    className={`aspect-[4/5] w-full rounded-md border border-border object-cover ${hidden.includes(pin.id) ? 'opacity-40' : ''}`}
                  />
                  <span className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0"
                      checked={!hidden.includes(pin.id)}
                      onChange={(e) => toggle(pin.id, e.target.checked)}
                      aria-label={t('showPin', { name })}
                    />
                    <span className="line-clamp-2">{name}</span>
                  </span>
                </label>
              </li>
            );
          })}
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
