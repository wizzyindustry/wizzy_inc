import { describe, expect, it } from 'vitest';
import { CONTENT_FIELDS } from '@/components/admin/content/fields';
import { toFormValues, toSaveData } from '@/components/admin/content/form-values';
import { aboutInputSchema, settingsInputSchema } from '@/lib/schemas/content-admin';
import { contentMatchesType, svgLooksSafe } from '@/lib/security/file-type';

const svg = (body: string) => new TextEncoder().encode(body);

describe('SVG logo check', () => {
  it('accepts plain drawings, including internal #references', () => {
    expect(
      svgLooksSafe(
        svg(
          '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g"/></defs><rect fill="url(#g)" width="10" height="10"/><use href="#g"/></svg>',
        ),
      ),
    ).toBe(true);
    expect(contentMatchesType(svg('<svg viewBox="0 0 1 1"></svg>'), 'image/svg+xml')).toBe(true);
  });

  it.each([
    ['script', '<svg><script>alert(1)</script></svg>'],
    ['event handler', '<svg onload="alert(1)"></svg>'],
    ['javascript link', '<svg><a href="javascript:alert(1)">x</a></svg>'],
    ['outside link', '<svg><image xlink:href="https://evil.example/x.png"/></svg>'],
    ['embedded page', '<svg><foreignObject><iframe/></foreignObject></svg>'],
    ['entity trick', '<?xml version="1.0"?><!DOCTYPE x [<!ENTITY a "b">]><svg></svg>'],
    ['not an SVG', '<html><body>hi</body></html>'],
  ])('refuses %s', (_name, body) => {
    expect(svgLooksSafe(svg(body))).toBe(false);
  });
});

describe('About tools with logos', () => {
  const fields = CONTENT_FIELDS.about;

  it('loads older name-only tools and saves cards without empty rows or logos', () => {
    const form = toFormValues(fields, {
      intro: { en: 'Hi', sw: '' },
      graphicDesign: { en: 'G', sw: '' },
      webDevelopment: { en: 'W', sw: '' },
      tools: ['Figma', { name: 'Illustrator', logo: 'site/tools/1-ai.svg' }],
    });
    expect(form.tools).toEqual([
      { name: 'Figma', logo: '' },
      { name: 'Illustrator', logo: 'site/tools/1-ai.svg' },
    ]);
    const saved = toSaveData(fields, {
      ...form,
      tools: [...(form.tools as object[]), { name: '  ', logo: '' }],
    });
    expect(saved.tools).toEqual([
      { name: 'Figma' },
      { name: 'Illustrator', logo: 'site/tools/1-ai.svg' },
    ]);
    expect(aboutInputSchema.parse(saved).tools).toHaveLength(2);
  });

  it('a logo must be an uploaded file in site/tools', () => {
    const base = {
      intro: { en: 'Hi', sw: '' },
      graphicDesign: { en: 'G', sw: '' },
      webDevelopment: { en: 'W', sw: '' },
    };
    for (const logo of ['portfolio/x/a.png', 'site/tools/../quotes/a.pdf', 'https://x.com/a.png']) {
      expect(aboutInputSchema.safeParse({ ...base, tools: [{ name: 'X', logo }] }).success).toBe(
        false,
      );
    }
  });
});

describe('Hero background image', () => {
  it('must be an uploaded file in site/hero', () => {
    const settings = {
      phone: '+255700000000',
      whatsappNumber: '255700000000',
      email: 'a@example.com',
      location: { en: 'Dodoma', sw: '' },
      workingHours: { en: 'Mon–Sat', sw: '' },
      hero: { headline: { en: 'H', sw: '' }, subheadline: { en: 'S', sw: '' } },
    };
    const withImage = (image: string) => ({ ...settings, hero: { ...settings.hero, image } });
    expect(settingsInputSchema.safeParse(settings).success).toBe(true);
    expect(settingsInputSchema.safeParse(withImage('site/hero/1-bg.webp')).success).toBe(true);
    expect(settingsInputSchema.safeParse(withImage('site/tools/1-ai.svg')).success).toBe(false);
  });
});
