/** "#1D4ED8" -> "rgb(29, 78, 216)" (brand colour cards on the Press page). */
export function hexToRgb(hex: string): string {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
