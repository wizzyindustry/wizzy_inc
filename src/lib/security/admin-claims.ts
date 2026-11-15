/**
 * The one rule for "is this user an admin?" (ARCHITECTURE-ESSENTIAL: Firebase Auth +
 * `admin` custom claim, never a check on the email address).
 */
export function hasAdminClaim(claims: Record<string, unknown> | null | undefined): boolean {
  return claims?.admin === true;
}
