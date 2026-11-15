/** Keep storage paths safe and readable: letters, digits, dot, dash, underscore. */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_');
  return cleaned.slice(-80) || 'file';
}
