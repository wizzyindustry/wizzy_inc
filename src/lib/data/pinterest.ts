import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import type { Pin } from '@/lib/pinterest/parse-feed';
import { fetchPins } from '@/lib/pinterest/pins';
import { pinterestSettingsSchema, type PinterestSettings } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/** Admin → Pinterest (settings/pinterest). Null until saved: no Pinterest sections are shown. */
export const getPinterestSettings = cache(async (): Promise<PinterestSettings | null> =>
  orFallback(
    adminDb()
      .doc('settings/pinterest')
      .get()
      .then((snap) => parseDoc(pinterestSettingsSchema, snap)),
    null,
    'settings/pinterest',
  ),
);

/**
 * Pins of the chosen public boards for the portfolio and home pages, minus hidden ones.
 * Empty when switched off, not set up, or Pinterest can't be reached (no section shown).
 */
export const getPinterestPins = cache(
  async (): Promise<{ pins: Pin[]; settings: PinterestSettings | null }> => {
    const settings = await getPinterestSettings();
    if (!settings?.show || !settings.username || settings.boards.length === 0) {
      return { pins: [], settings };
    }
    const pins = await orFallback(
      fetchPins(settings.username, settings.boards, settings.hiddenPins),
      [],
      'pinterest pins',
    );
    return { pins, settings };
  },
);
