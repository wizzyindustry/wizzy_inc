'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';

type Bilingual = { en: string; sw: string };
export type FaqItem = { q: Bilingual; a: Bilingual };
export type PointItem = { title: Bilingual; text: Bilingual };

/** The two parts of each item: a short first line and a longer second one. */
const PARTS = { faq: ['q', 'a'], points: ['title', 'text'] } as const;
export type PairVariant = keyof typeof PARTS;
type PairItem = Record<string, Bilingual>;

type Props = {
  label: string;
  hint?: string;
  /** "faq": question + answer. "points": title + text (home "Why choose us"). */
  variant?: PairVariant;
  items: PairItem[];
  error?: string;
  onChange: (items: PairItem[]) => void;
};

/** List of bilingual pairs (FAQ or "Why choose us" points), EN and SW side by side. */
export function FaqField({ label, hint, variant = 'faq', items, error, onChange }: Props) {
  const t = useTranslations('Admin.content');
  const [first, second] = PARTS[variant];
  const update = (index: number, part: string, lang: 'en' | 'sw', text: string) =>
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [part]: { ...item[part]!, [lang]: text } } : item,
      ),
    );
  const empty = () => ({ [first]: { en: '', sw: '' }, [second]: { en: '', sw: '' } });

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 font-medium">{label}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-3">
          {[first, second].map((part) => (
            <div key={part} className="grid gap-2 sm:grid-cols-2">
              {(['en', 'sw'] as const).map((lang) => (
                <label key={lang} className="flex flex-col gap-1 text-sm">
                  {t(`${variant}.${part}`)} ({lang.toUpperCase()})
                  <textarea
                    rows={part === first ? 1 : 3}
                    value={item[part]?.[lang] ?? ''}
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
            {t(`${variant}.remove`)}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-start"
        onClick={() => onChange([...items, empty()])}
      >
        {t(`${variant}.add`)}
      </Button>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </fieldset>
  );
}
