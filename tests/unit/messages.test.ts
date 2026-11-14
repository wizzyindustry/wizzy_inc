import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import sw from '../../messages/sw.json';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('translations', () => {
  it('en.json and sw.json have exactly the same keys', () => {
    expect(keys(sw).sort()).toEqual(keys(en).sort());
  });
});
