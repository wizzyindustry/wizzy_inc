import { todayInTanzania } from '@/lib/utils/format-date';
import { fieldVisible, type FieldDef } from './fields';

/*
 * Converting between stored documents and editor values.
 * In the editor: numbers and dates are strings (as <input> gives them), lists are text
 * with one item per line. `toSaveData` turns them back and drops empty optional fields.
 */

export type Values = Record<string, unknown>;

export function getPath(obj: Values, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Values | undefined)?.[k], obj);
}

/** Immutable set: returns a copy with `path` changed. */
export function setPath(obj: Values, path: string, value: unknown): Values {
  const [head, ...rest] = path.split('.') as [string, ...string[]];
  if (rest.length === 0) return { ...obj, [head]: value };
  const child = (obj[head] as Values | undefined) ?? {};
  return { ...obj, [head]: setPath(child, rest.join('.'), value) };
}

function removePath(obj: Values, path: string): Values {
  const [head, ...rest] = path.split('.') as [string, ...string[]];
  if (rest.length === 0) {
    const copy = { ...obj };
    delete copy[head];
    return copy;
  }
  const child = obj[head] as Values | undefined;
  return child ? { ...obj, [head]: removePath(child, rest.join('.')) } : obj;
}

const lines = (text: unknown) =>
  String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const emptyBilingual = { en: '', sw: '' };

function blank(field: FieldDef): unknown {
  switch (field.type) {
    case 'checkbox':
      return false; // new items start hidden (published: false)
    case 'bilingual':
    case 'bilingualLong':
    case 'bilingualList':
      return { ...emptyBilingual };
    case 'services':
    case 'gallery':
    case 'faq':
      return [];
    case 'number':
      return field.path === 'order' ? '0' : ''; // sort order defaults to 0
    case 'date':
      return todayInTanzania();
    case 'select':
      return field.optional ? '' : (field.options?.[0] ?? '');
    default:
      return '';
  }
}

/** Stored document (Timestamps already Dates) -> editor values. Missing fields get blanks. */
export function toFormValues(fields: FieldDef[], doc: Values | null): Values {
  let values: Values = {};
  for (const field of fields) {
    const stored = doc ? getPath(doc, field.path) : undefined;
    let value: unknown = stored ?? blank(field);
    if (stored !== undefined) {
      if (field.type === 'number' || (field.type === 'select' && field.numeric)) {
        value = String(stored);
      } else if (field.type === 'date' && stored instanceof Date) {
        value = todayInTanzania(stored);
      } else if (field.type === 'bilingualList') {
        const list = stored as { en?: string[]; sw?: string[] };
        value = { en: (list.en ?? []).join('\n'), sw: (list.sw ?? []).join('\n') };
      } else if (field.type === 'lines') {
        value = (stored as string[]).join('\n');
      }
    }
    values = setPath(values, field.path, value);
  }
  return values;
}

/** Editor values -> data for the server (which validates it with the Zod schema). */
export function toSaveData(fields: FieldDef[], values: Values): Values {
  let data: Values = {};
  for (const field of fields) {
    if (!fieldVisible(field, values)) continue; // e.g. Git link on a graphic design project
    const raw = getPath(values, field.path);
    let value: unknown = raw;
    switch (field.type) {
      case 'text':
      case 'textarea':
        value = String(raw ?? '').trim();
        break;
      case 'number':
        value = String(raw ?? '').trim() === '' ? '' : Number(raw);
        break;
      case 'select':
        value = field.numeric && raw !== '' ? Number(raw) : raw;
        break;
      case 'bilingual':
      case 'bilingualLong': {
        const b = (raw as { en?: string; sw?: string }) ?? emptyBilingual;
        value = { en: (b.en ?? '').trim(), sw: (b.sw ?? '').trim() };
        break;
      }
      case 'bilingualList': {
        const b = (raw as { en?: string; sw?: string }) ?? emptyBilingual;
        value = { en: lines(b.en), sw: lines(b.sw) };
        break;
      }
      case 'lines':
        value = lines(raw);
        break;
      case 'portfolioRef':
        value = raw || '';
        break;
    }
    const isEmpty =
      value === '' ||
      value === undefined ||
      (field.type.startsWith('bilingual') &&
        (value as { en: unknown }).en === '' &&
        (value as { sw: unknown }).sw === '');
    data =
      field.optional && isEmpty ? removePath(data, field.path) : setPath(data, field.path, value);
  }
  return data;
}
