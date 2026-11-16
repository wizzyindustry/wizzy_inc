'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/field-styles';
import { ImageField } from './ImageField';

export type ToolItem = { name: string; logo: string };

type Props = {
  id: string;
  label: string;
  hint?: string;
  items: ToolItem[];
  error?: string;
  onChange: (items: ToolItem[]) => void;
};

/** About page "Tools we use": each tool has a name and an optional logo; order is editable. */
export function ToolsField({ id, label, hint, items, error, onChange }: Props) {
  const t = useTranslations('Admin.content.toolsField');
  const update = (index: number, patch: Partial<ToolItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, by: -1 | 1) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item!);
    onChange(next);
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 font-medium">{label}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-start"
          >
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              {t('name', { number: i + 1 })}
              <input
                id={`${id}-${i}-name`}
                value={item.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className={fieldClass}
              />
            </label>
            <div className="flex-1">
              <ImageField
                id={`${id}-${i}-logo`}
                itemId=""
                label={t('logo')}
                paths={item.logo ? [item.logo] : []}
                multiple={false}
                siteImage="tool"
                onChange={(paths) => update(i, { logo: paths[0] ?? '' })}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label={t('moveUp', { name: item.name || i + 1 })}
              >
                ↑
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                aria-label={t('moveDown', { name: item.name || i + 1 })}
              >
                ↓
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                {t('remove')}
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...items, { name: '', logo: '' }])}
      >
        {t('add')}
      </Button>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </fieldset>
  );
}
