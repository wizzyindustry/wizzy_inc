/**
 * Colours for generated images (share image, favicon). Image generation can't read CSS
 * variables, so these mirror src/styles/tokens.css — a unit test keeps them in sync.
 * Brand colours are still placeholders (TODO: real content).
 */
export const OG_COLORS = {
  primary: '#1d4ed8', // --color-primary
  primaryForeground: '#ffffff', // --color-primary-foreground
} as const;
