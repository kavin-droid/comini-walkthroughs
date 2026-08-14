"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

/** Returns true once `timeoutMs` has passed with no genuine user activity (pointerdown/keydown)
 * AND no change in `resetDeps` (e.g. the current phase) - whichever comes first restarts the
 * clock. The scheduling here deliberately knows nothing about WHAT the caller will do with
 * `isIdle` (show a hint, dim the UI, etc.) - keep that decision entirely in the caller, gated at
 * render time. Folding a "should we even bother" condition into the reset logic itself is the
 * bug this shape avoids: the timer must stay simple and always-armed, or it silently stops
 * restarting the moment that condition happens to be false. */
export function useIdle(timeoutMs: number, resetDeps: DependencyList): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  useEffect(() => {
    window.addEventListener("pointerdown", resetTimer);
    window.addEventListener("keydown", resetTimer);
    return () => {
      window.removeEventListener("pointerdown", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return isIdle;
}
