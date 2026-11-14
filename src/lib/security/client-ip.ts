/** Minimal header reader so this works with both `Headers` and Next's `headers()`. */
type HeaderReader = { get(name: string): string | null };

/**
 * Best-effort client IP for rate limiting. Behind Firebase App Hosting's load balancer the
 * original client is the first entry of X-Forwarded-For. Returns "unknown" if absent, so
 * all header-less requests share one (strict) bucket rather than bypassing the limit.
 */
export function getClientIp(headers: HeaderReader): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
