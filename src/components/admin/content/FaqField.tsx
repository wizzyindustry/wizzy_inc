'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';

type Bilingual = { en: string; sw: string };
export type FaqItem = { q: Bilingual; a: Bilingual };

type Props = {
  label: string;
  items: FaqItem[];
  error?: string;
  onChange: (items: FaqItem[]) => void;
};

/** Service FAQ (question + answer, EN and SW side by side). */
export function FaqField({ label, items, error, onChange }: Props) {
  const t = useTranslations('Admin.content');
  const update = (index: number, part: 'q' | 'a', lang: 'en' | 'sw', text: string) =>
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [part]: { ...item[part], [lang]: text } } : item,
      ),
    );

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 font-medium">{label}</legend>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-3">
          {(['q', 'a'] as const).map((part) => (
            <div key={part} className="grid gap-2 sm:grid-cols-2">
              {(['en', 'sw'] as const).map((lang) => (
                <label key={lang} className="flex flex-col gap-1 text-sm">
                  {t(`faq.${part}`)} ({lang.toUpperCase()})
                  <textarea
                    rows={part === 'q' ? 1 : 3}
                    value={item[part][lang]}
                    onChange={(e) => update(i, part, lang, e.target.value)}
                    className={fieldClass}
                  />
                </label>
              ))}
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="self-start"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            {t('faq.remove')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-start"
        onClick={() => onChange([...items, { q: { en: '', sw: '' }, a: { en: '', sw: '' } }])}
      >
        {t('faq.add')}
      </Button>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </fieldset>
  );
}
