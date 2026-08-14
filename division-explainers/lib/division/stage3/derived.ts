import type { Stage3Session } from "./types";

/** Combined quotient so far - valid to call at any phase; digits default to 0 before they're
 * predicted, so this can drive a live-updating answer card exactly like the old digit-by-digit
 * reveal. */
export function stage3Quotient(session: Stage3Session): number {
  return (session.tensPredicted ?? 0) * 10 + (session.onesPredicted ?? 0);
}
