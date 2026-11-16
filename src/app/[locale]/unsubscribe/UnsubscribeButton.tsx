'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { unsubscribe } from '../newsletter-actions';

type State = 'idle' | 'busy' | 'done' | 'notFound' | 'error';

/** "Unsubscribe" button: removes the email that this personal link belongs to. */
export function UnsubscribeButton({ token }: { token: string }) {
  const t = useTranslations('Unsubscribe');
  const [state, setState] = useState<State>('idle');

  async function onClick() {
    setState('busy');
    try {
      const formData = new FormData();
      formData.append('token', token);
      const { getAppCheckToken } = await import('@/lib/firebase/client');
      const appCheck = await getAppCheckToken();
      if (appCheck) formData.append('appCheckToken', appCheck);
      const result = await unsubscribe(formData);
      setState(result.ok ? 'done' : result.error === 'notFound' ? 'notFound' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done' || state === 'notFound') {
    return (
      <p role="status" className="mt-6 rounded-md border border-border p-4">
        {t(state)}
      </p>
    );
  }
  return (
    <div className="mt-6 flex flex-col items-start gap-3">
      <Button type="button" onClick={() => void onClick()} disabled={state === 'busy' || !token}>
        {state === 'busy' ? t('busy') : t('button')}
      </Button>
      {!token && <p className="text-sm text-muted-foreground">{t('noToken')}</p>}
      {state === 'error' && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t('error')}
        </p>
      )}
    </div>
  );
}
