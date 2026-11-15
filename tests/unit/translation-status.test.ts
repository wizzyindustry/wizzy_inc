import { describe, expect, it } from 'vitest';
import { CONTENT_FIELDS } from '@/components/admin/content/fields';
import { missingSwahili } from '@/components/admin/content/translation-status';

describe('missingSwahili (FR-9 / translation drift)', () => {
  it('lists bilingual fields with English but no Swahili', () => {
    const service = {
      title: { en: 'Logo design', sw: 'Usanifu wa nembo' },
      summary: { en: 'Logos', sw: '   ' }, // whitespace counts as empty
      body: { en: '', sw: '' }, // nothing to translate yet
      inclusions: { en: ['3 concepts'], sw: [] },
      faq: [{ q: { en: 'Q?', sw: 'S?' }, a: { en: 'A.', sw: '' } }],
    };
    expect(missingSwahili(CONTENT_FIELDS.services, service)).toEqual([
      'summary',
      'inclusions',
      'faq',
    ]);
  });

  it('finds nothing when every field is translated', () => {
    const pkg = {
      name: { en: 'Basic', sw: 'Msingi' },
      features: { en: ['A'], sw: ['A'] },
    };
    expect(missingSwahili(CONTENT_FIELDS.packages, pkg)).toEqual([]);
  });

  it('checks nested settings fields', () => {
    const settings = {
      hero: { headline: { en: 'H', sw: '' }, subheadline: { en: 'S', sw: 'S' } },
      location: { en: 'Dodoma', sw: 'Dodoma' },
      workingHours: { en: 'Mon–Sat', sw: '' },
    };
    expect(missingSwahili(CONTENT_FIELDS.settings, settings)).toEqual([
      'hero.headline',
      'workingHours',
    ]);
  });

  it('flags About page text that has English only', () => {
    const about = {
      intro: { en: 'Hello', sw: 'Habari' },
      graphicDesign: { en: 'Logos', sw: '' },
      webDevelopment: { en: 'Sites', sw: 'Tovuti' },
      tools: ['Figma'],
    };
    expect(missingSwahili(CONTENT_FIELDS.about, about)).toEqual(['graphicDesign']);
  });
});
