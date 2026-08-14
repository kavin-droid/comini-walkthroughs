"use client";

import { useEffect, useState } from "react";

/** Mirrors `condition` while true; once it flips false, keeps returning true for `delayMs` longer
 * before finally following it down - so a "still counting" flag can drive a UI element that
 * lingers a beat after the count finishes instead of vanishing the instant the last item lands. */
export function useLingerAfter(condition: boolean, delayMs: number): boolean {
  const [linger, setLinger] = useState(condition);

  useEffect(() => {
    if (condition) {
      setLinger(true);
      return;
    }
    const timer = window.setTimeout(() => setLinger(false), delayMs);
    return () => window.clearTimeout(timer);
  }, [condition, delayMs]);

  return linger;
}
