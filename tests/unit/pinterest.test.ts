import { describe, expect, it } from 'vitest';
import { CONTENT_FIELDS } from '@/components/admin/content/fields';
import { setPath, toFormValues, toSaveData } from '@/components/admin/content/form-values';
import {
  decodeEntities,
  mergePins,
  parsePinterestFeed,
  type Pin,
} from '@/lib/pinterest/parse-feed';
import { pinterestInputSchema } from '@/lib/schemas/content-admin';

/** A board feed in the shape Pinterest serves (descriptions are escaped HTML). */
const item = (o: { id: string; title?: string; img?: string; date?: string; text?: string }) => `
  <item>
    <title>${o.title ?? ' '}</title>
    <link>https://www.pinterest.com/pin/${o.id}/</link>
    <description>&lt;a href=&quot;https://www.pinterest.com/pin/${o.id}/&quot;&gt;&lt;img src=&quot;${o.img ?? `https://i.pinimg.com/236x/aa/bb/${o.id}.jpg`}&quot;&gt;&lt;/a&gt;${o.text ?? ''}</description>
    <pubDate>${o.date ?? 'Sun, 08 Nov 2026 20:54:59 GMT'}</pubDate>
  </item>`;
const feed = (items: string, title = 'poster design') =>
  `<?xml version="1.0"?><rss version="2.0"><channel><title>${title}</title>${items}</channel></rss>`;

describe('Pinterest board feed', () => {
  it('reads pins: bigger picture, pin link, board name, date', () => {
    const pins = parsePinterestFeed(
      feed(item({ id: 'e1_Abc-9', title: 'Charity poster &amp; flyer', text: 'For UHH' })),
      'poster-design',
    );
    expect(pins).toEqual([
      {
        id: 'e1_Abc-9',
        title: 'Charity poster & flyer',
        description: 'For UHH',
        image: 'https://i.pinimg.com/564x/aa/bb/e1_Abc-9.jpg',
        url: 'https://www.pinterest.com/pin/e1_Abc-9/',
        board: 'poster-design',
        boardTitle: 'Poster design',
        publishedAt: '2026-11-08T20:54:59.000Z',
      },
    ]);
  });

  it('pins without a title get an empty title; a description equal to the title is dropped', () => {
    const [untitled, same] = parsePinterestFeed(
      feed(item({ id: '1' }) + item({ id: '2', title: 'Logo', text: 'Logo' })),
      'b',
    );
    expect(untitled?.title).toBe('');
    expect(same?.description).toBe('');
  });

  it('skips pictures from other hosts and links that are not pins', () => {
    const xml = feed(
      item({ id: '1', img: 'https://evil.example/x.jpg' }) +
        item({ id: '2' }).replace('https://www.pinterest.com/pin/2/', 'javascript:alert(1)'),
    );
    expect(parsePinterestFeed(xml, 'b')).toEqual([]);
  });

  it('ignores anything that is not a feed (e.g. an error page)', () => {
    expect(parsePinterestFeed('<html>Not found</html>', 'b')).toEqual([]);
  });

  it('decodes entities', () => {
    expect(decodeEntities('Tom &amp; Jerry &#39;s &#x2019; &quot;x&quot;')).toBe(
      'Tom & Jerry \'s ’ "x"',
    );
  });
});

describe('pins from several boards', () => {
  const pin = (id: string, date: string, image = `https://i.pinimg.com/564x/${id}.jpg`): Pin => ({
    id,
    title: id,
    description: '',
    image,
    url: `https://www.pinterest.com/pin/${id}/`,
    board: 'b',
    boardTitle: 'B',
    publishedAt: date,
  });

  it('newest first, hidden pins left out, the same picture only once', () => {
    const same = 'https://i.pinimg.com/564x/same.jpg';
    const merged = mergePins(
      [
        [pin('old', '2026-01-01T00:00:00Z'), pin('copy-old', '2026-02-01T00:00:00Z', same)],
        [pin('new', '2026-11-01T00:00:00Z'), pin('copy-new', '2026-03-01T00:00:00Z', same)],
        [pin('hidden', '2026-12-01T00:00:00Z')],
      ],
      ['hidden'],
    );
    expect(merged.map((p) => p.id)).toEqual(['new', 'copy-new', 'old']);
  });

  it('hiding a picture also hides its older copies', () => {
    const same = 'https://i.pinimg.com/564x/same.jpg';
    const merged = mergePins(
      [
        [
          pin('copy-new', '2026-03-01T00:00:00Z', same),
          pin('copy-old', '2026-02-01T00:00:00Z', same),
        ],
      ],
      ['copy-new'],
    );
    expect(merged).toEqual([]);
  });
});

describe('Admin → Pinterest settings', () => {
  it('boards are one per line; username and board names are checked', () => {
    const fields = CONTENT_FIELDS.pinterest;
    let form = toFormValues(fields, { show: true, homeCount: 6, boards: [], hiddenPins: [] });
    form = setPath(form, 'username', 'panta_wizzy');
    form = setPath(form, 'boards', 'poster-design\n\n flyer \nbrochure-design');
    const parsed = pinterestInputSchema.parse(toSaveData(fields, form));
    expect(parsed.boards).toEqual(['poster-design', 'flyer', 'brochure-design']);
    expect(parsed.homeCount).toBe(6);

    const base = { show: true, homeCount: 3, boards: ['flyer'], hiddenPins: [] };
    expect(pinterestInputSchema.safeParse({ ...base, username: 'bad name' }).success).toBe(false);
    expect(
      pinterestInputSchema.safeParse({ ...base, username: 'ok_1', boards: ['../x'] }).success,
    ).toBe(false);
  });
});
