'use client';

import { useTranslations } from 'next-intl';
import { describedBy, FormField } from '@/components/forms/FormField';
import { fieldClass } from '@/components/ui/field-styles';
import { FaqField, type FaqItem } from './FaqField';
import { fieldKey, fieldTextKey, type FieldDef } from './fields';
import { ImageField } from './ImageField';
import { ToolsField, type ToolItem } from './ToolsField';

export type Option = { value: string; label: string };

type Props = {
  field: FieldDef;
  value: unknown;
  error?: string;
  itemId: string;
  serviceOptions: Option[];
  portfolioOptions: Option[];
  onChange: (value: unknown) => void;
};

/** One editor field, chosen by its type. EN and SW inputs sit side by side. */
export function ContentField({
  field,
  value,
  error,
  itemId,
  serviceOptions,
  portfolioOptions,
  onChange,
}: Props) {
  const t = useTranslations('Admin.content');
  const key = fieldKey(field.path);
  const id = `field-${key}`;
  const label = t(`fields.${fieldTextKey(field)}`);
  const hint = field.hint ? t(`hints.${fieldTextKey(field)}`) : undefined;
  const optional = field.optional ? t('optional') : undefined;
  const aria = { 'aria-invalid': !!error, 'aria-describedby': describedBy(id, hint, error) };

  switch (field.type) {
    case 'checkbox':
      return (
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 font-medium">
            <input
              id={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="size-4"
              {...aria}
            />
            {label}
          </label>
          {hint && (
            <p id={`${id}-hint`} className="text-sm text-muted-foreground">
              {hint}
            </p>
          )}
          {error && (
            <p id={`${id}-error`} className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </div>
      );

    case 'bilingual':
    case 'bilingualLong':
    case 'bilingualList': {
      const v = (value as { en: string; sw: string }) ?? { en: '', sw: '' };
      const multiline = field.type !== 'bilingual';
      return (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 font-medium">
            {label}
            {optional && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">({optional})</span>
            )}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['en', 'sw'] as const).map((lang) => {
              const inputId = `${id}-${lang}`;
              const props = {
                id: inputId,
                value: v[lang],
                className: fieldClass,
                onChange: (e: { target: { value: string } }) =>
                  onChange({ ...v, [lang]: e.target.value }),
                ...aria,
              };
              return (
                <div key={lang} className="flex flex-col gap-1">
                  <label htmlFor={inputId} className="text-sm text-muted-foreground">
                    {t(`lang.${lang}`)}
                  </label>
                  {multiline ? (
                    <textarea rows={field.type === 'bilingualLong' ? 6 : 4} {...props} />
                  ) : (
                    <input {...props} />
                  )}
                </div>
              );
            })}
          </div>
          {hint && (
            <p id={`${id}-hint`} className="text-sm text-muted-foreground">
              {hint}
            </p>
          )}
          {error && (
            <p id={`${id}-error`} className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </fieldset>
      );
    }

    case 'services': {
      const selected = (value as string[]) ?? [];
      return (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 font-medium">{label}</legend>
          {serviceOptions.map((o) => (
            <label key={o.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4"
                checked={selected.includes(o.value)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...selected, o.value]
                      : selected.filter((s) => s !== o.value),
                  )
                }
              />
              {o.label}
            </label>
          ))}
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
        </fieldset>
      );
    }

    case 'faq':
      return (
        <FaqField
          label={label}
          hint={hint}
          items={(value as FaqItem[]) ?? []}
          error={error}
          onChange={onChange}
        />
      );

    case 'tools':
      return (
        <ToolsField
          id={id}
          label={label}
          hint={hint}
          items={(value as ToolItem[]) ?? []}
          error={error}
          onChange={onChange}
        />
      );

    case 'image':
    case 'gallery': {
      const paths =
        field.type === 'image' ? (value ? [value as string] : []) : ((value as string[]) ?? []);
      return (
        <ImageField
          id={id}
          itemId={itemId}
          label={label}
          paths={paths}
          multiple={field.type === 'gallery'}
          siteImage={field.siteImage}
          hint={hint}
          error={error}
          onChange={(next) => onChange(field.type === 'image' ? (next[0] ?? '') : next)}
        />
      );
    }

    default: {
      const common = {
        id,
        value: String(value ?? ''),
        className: fieldClass,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
        ...aria,
      };
      let control;
      if (field.type === 'textarea' || field.type === 'lines') {
        control = <textarea rows={4} {...common} />;
      } else if (field.type === 'select' || field.type === 'portfolioRef') {
        const options: Option[] =
          field.type === 'portfolioRef'
            ? portfolioOptions
            : (field.options ?? []).map((o) => ({
                value: o,
                label: t.has(`options.${o}`) ? t(`options.${o}`) : o,
              }));
        control = (
          <select {...common}>
            {field.optional && <option value="">—</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      } else {
        const type = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
        control = (
          <input type={type} inputMode={type === 'number' ? 'numeric' : undefined} {...common} />
        );
      }
      return (
        <FormField id={id} label={label} hint={hint} error={error} optionalLabel={optional}>
          {control}
        </FormField>
      );
    }
  }
}
