/** "120+" -> { before: '', number: 120, decimals: 0, after: '+' }; null when there is no number. */
export function splitNumber(value: string) {
  const match = /^(\D*)(\d+(?:[.,]\d+)?)(.*)$/.exec(value);
  if (!match) return null;
  const digits = match[2]!.replace(',', '.');
  return {
    before: match[1]!,
    number: Number(digits),
    decimals: digits.includes('.') ? digits.split('.')[1]!.length : 0,
    after: match[3]!,
  };
}
