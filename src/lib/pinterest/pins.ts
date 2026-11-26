import 'server-only';
import { mergePins, parsePinterestFeed, type Pin } from './parse-feed';

/*
 * Pins from the public RSS feeds of the owner's Pinterest boards (no API key, no package).
 * Cached for an hour and tagged, so new pins appear within the hour, or straight away with
 * "Refresh the website now" in Admin → Pinterest (revalidateTag(PINTEREST_TAG)).
 */

export const PINTEREST_TAG = 'pinterest-pins';
const ONE_HOUR = 3600;

async function fetchBoard(
  username: string,
  board: string,
  cache: RequestInit & { next?: object },
  retry = true,
): Promise<Pin[]> {
  try {
    const res = await fetch(
      `https://www.pinterest.com/${encodeURIComponent(username)}/${encodeURIComponent(board)}.rss`,
      { headers: { 'user-agent': 'Mozilla/5.0 (compatible; wizzy-inc-website)' }, ...cache },
    );
    if (res.status === 404) throw new BoardNotFound(board);
    if (!res.ok) throw new Error(`Pinterest request failed (HTTP ${res.status})`);
    return parsePinterestFeed(await res.text(), board);
  } catch (error) {
    // Pinterest now and then fails a single request; try once more, except for unknown boards.
    if (retry && !(error instanceof BoardNotFound)) {
      return fetchBoard(username, board, cache, false);
    }
    throw error;
  }
}

class BoardNotFound extends Error {
  constructor(board: string) {
    super(`Pinterest board not found: ${board}`);
  }
}

/**
 * For public pages: all boards together, newest first, hidden pins left out. A board that
 * can't be read is skipped (logged) so one renamed board never hides the others.
 */
export async function fetchPins(
  username: string,
  boards: readonly string[],
  hidden: readonly string[] = [],
): Promise<Pin[]> {
  const results = await Promise.allSettled(
    boards.map((board) =>
      fetchBoard(username, board, { next: { revalidate: ONE_HOUR, tags: [PINTEREST_TAG] } }),
    ),
  );
  const lists: Pin[][] = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') lists.push(result.value);
    else console.error(`[data] pinterest board ${boards[i]} unavailable:`, result.reason?.message);
  });
  return mergePins(lists, hidden);
}

/** For the admin page: always fresh, nothing hidden, and which boards could not be read. */
export async function fetchPinsFresh(
  username: string,
  boards: readonly string[],
): Promise<{ pins: Pin[]; missingBoards: string[] }> {
  const results = await Promise.allSettled(
    boards.map((board) => fetchBoard(username, board, { cache: 'no-store' })),
  );
  const missingBoards = boards.filter((_, i) => results[i]!.status === 'rejected');
  const lists = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  return { pins: mergePins(lists), missingBoards };
}
