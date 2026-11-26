/*
 * Reading a Pinterest board's public RSS feed (pinterest.com/<user>/<board>.rss): the latest
 * 25 pins of a PUBLIC board. Secret boards have no feed. No package: the feed is simple XML,
 * read with small regular expressions. Browser-safe and free of network code (unit tested).
 */

export type Pin = {
  /** Pinterest pin id from its address (digits, or a letter code in board feeds). */
  id: string;
  /** Pin title; empty when the pin has none (the card then shows the board name). */
  title: string;
  description: string;
  /** https://i.pinimg.com/564x/… picture. */
  image: string;
  /** https://www.pinterest.com/pin/<id>/ */
  url: string;
  /** Board slug from the address, e.g. "poster-design". */
  board: string;
  /** Board name as set on Pinterest, e.g. "Poster Design". */
  boardTitle: string;
  /** ISO date the pin was added (newest first). */
  publishedAt: string | null;
};

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Decode XML/HTML entities (&amp; &#39; &#x2019; …). */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n =
        code[1]?.toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

function tag(xml: string, name: string): string {
  const match = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(xml);
  if (!match) return '';
  return match[1]!.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1');
}

/** "<p>Hi</p> there" -> "Hi there". */
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Only pictures from Pinterest's image host, upgraded from the small 236px to 564px. */
function pinImage(descriptionHtml: string): string | null {
  const src = /<img[^>]+src="([^"]+)"/i.exec(descriptionHtml)?.[1];
  if (!src) return null;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:' || url.hostname !== 'i.pinimg.com') return null;
    url.pathname = url.pathname.replace(/^\/\d+x\//, '/564x/');
    return url.toString();
  } catch {
    return null;
  }
}

/** Pin id from https://www.pinterest.com/pin/123/ (any pinterest.* country domain). */
function pinId(link: string): string | null {
  try {
    const url = new URL(link);
    if (url.protocol !== 'https:' || !/(^|\.)pinterest\.[a-z.]+$/.test(url.hostname)) return null;
    return /^\/pin\/([A-Za-z0-9_-]{1,120})\/?$/.exec(url.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Board name from the feed title, falling back to the slug ("poster-design" -> "Poster design"). */
function boardName(channelTitle: string, board: string): string {
  const text = decodeEntities(channelTitle).trim() || board.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** All pins of one board feed that have a picture and a valid pin link. */
export function parsePinterestFeed(xml: string, board: string): Pin[] {
  if (typeof xml !== 'string' || !xml.includes('<rss')) return [];
  const channel = xml.split('<item>')[0] ?? '';
  const boardTitle = boardName(tag(channel, 'title'), board);

  const pins: Pin[] = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const link = decodeEntities(tag(item!, 'link')).trim();
    const id = pinId(link);
    const descriptionHtml = decodeEntities(tag(item!, 'description'));
    const image = pinImage(descriptionHtml);
    if (!id || !image) continue;
    const date = new Date(tag(item!, 'pubDate'));
    const title = plainText(decodeEntities(tag(item!, 'title'))).slice(0, 200);
    const description = plainText(descriptionHtml).slice(0, 500);
    pins.push({
      id,
      title,
      // The feed repeats the title as the description; keep it only when it adds something.
      description: description === title ? '' : description,
      image,
      url: `https://www.pinterest.com/pin/${id}/`,
      board,
      boardTitle,
      publishedAt: Number.isNaN(date.getTime()) ? null : date.toISOString(),
    });
  }
  return pins;
}

/**
 * Pins of several boards together, newest first. Hidden pins are left out, and the same
 * picture pinned twice (or on two boards) is shown once, as its newest pin.
 */
export function mergePins(lists: Pin[][], hidden: readonly string[] = []): Pin[] {
  const skip = new Set(hidden);
  const seenIds = new Set<string>();
  const seenImages = new Set<string>();
  const sorted = lists
    .flat()
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  const all: Pin[] = [];
  for (const pin of sorted) {
    if (skip.has(pin.id)) {
      seenImages.add(pin.image); // hiding a picture also hides its older copies
      continue;
    }
    if (seenIds.has(pin.id) || seenImages.has(pin.image)) continue;
    seenIds.add(pin.id);
    seenImages.add(pin.image);
    all.push(pin);
  }
  return all;
}
