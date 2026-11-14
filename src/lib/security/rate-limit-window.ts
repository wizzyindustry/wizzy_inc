export type WindowState = { count: number; windowStart: number };

export type RateLimitPolicy = { limit: number; windowMs: number };

/** Limits per public form action (per client IP). */
export const RATE_LIMITS = {
  quote: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 quote requests per hour
  contact: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 contact messages per hour
} as const satisfies Record<string, RateLimitPolicy>;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * Fixed-window counter. Pure function: given the stored state (or null) and the current
 * time, decide whether this request is allowed and what to store next.
 */
export function nextWindowState(
  previous: WindowState | null,
  now: number,
  { limit, windowMs }: RateLimitPolicy,
): { allowed: boolean; state: WindowState } {
  if (!previous || now - previous.windowStart >= windowMs) {
    return { allowed: true, state: { count: 1, windowStart: now } };
  }
  if (previous.count >= limit) {
    return { allowed: false, state: previous };
  }
  return { allowed: true, state: { count: previous.count + 1, windowStart: previous.windowStart } };
}
