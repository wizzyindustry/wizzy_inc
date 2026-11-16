'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ContentField, type Option } from './ContentField';
import { fieldTextKey, type FieldDef } from './fields';
import { toFormValues, type Values } from './form-values';

type Props = {
  field: FieldDef;
  label: string;
  hint?: string;
  items: Values[];
  error?: string;
  itemId: string;
  serviceOptions: Option[];
  portfolioOptions: Option[];
  errorFor?: (path: string) => string | undefined;
  onChange: (items: Values[]) => void;
};

/**
 * A list of small records (partners, impact numbers, offices, …). Each item is a card with
 * its own fields; items can be added, removed and moved up or down.
 */
export function ListField({
  field,
  label,
  hint,
  items,
  error,
  itemId,
  serviceOptions,
  portfolioOptions,
  errorFor,
  onChange,
}: Props) {
  const t = useTranslations('Admin.content');
  const listKey = fieldTextKey(field);
  const itemName = t(`listItem.${listKey}`);
  const itemFields = field.itemFields ?? [];

  const update = (index: number, path: string, value: unknown) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [path]: value } : item)));
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
        {items.map((item, i) => {
          const name = t('listField.itemTitle', { item: itemName, number: i + 1 });
          return (
            <li key={i} className="flex flex-col gap-4 rounded-md border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{name}</p>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label={t('listField.moveUp', { name })}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={t('listField.moveDown', { name })}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onChange(items.filter((_, j) => j !== i))}
                    aria-label={t('listField.remove', { name })}
                  >
                    {t('listField.removeShort')}
                  </Button>
                </div>
              </div>
              {itemFields.map((sub) => {
                const path = `${field.path}.${i}.${sub.path}`;
                return (
                  <ContentField
                    key={sub.path}
                    field={{ ...sub, path, labelKey: `${listKey}_${sub.path}` }}
                    value={item[sub.path]}
                    error={errorFor?.(path)}
                    itemId={itemId}
                    serviceOptions={serviceOptions}
                    portfolioOptions={portfolioOptions}
                    onChange={(v) => update(i, sub.path, v)}
                  />
                );
              })}
            </li>
          );
        })}
      </ol>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...items, toFormValues(itemFields, null)])}
      >
        {t('listField.add', { item: itemName })}
      </Button>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </fieldset>
  );
}
