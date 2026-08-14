"use client";

import { useEffect, useRef, useState } from "react";

const IDLE_MS = 5000;
const HINT_VISIBLE_MS = 2400;

/** Shows a one-shot hint immediately when `active` first turns true (teach the gesture up
 * front), then re-shows it any time the child goes IDLE_MS without a fresh activity signal
 * (`notifyActivity`, call on every drag attempt whether or not it lands).
 *
 * The idle check always polls the RAW elapsed time since the last activity - it never folds the
 * (volatile) `showHint` boolean itself into that check, only into what gets rendered. Folding a
 * "am I currently showing" flag into the trigger condition would let a hint hiding itself (via
 * its own auto-hide timeout) suppress the next idle re-arm, or double-fire if two effects raced -
 * gating display and scheduling activity are kept as two separate concerns on purpose. */
export function useDragHint(active: boolean) {
  const [showHint, setShowHint] = useState(false);
  const lastActivity = useRef(Date.now());

  function notifyActivity() {
    lastActivity.current = Date.now();
  }

  useEffect(() => {
    if (!active) {
      setShowHint(false);
      return;
    }

    notifyActivity(); // anchor the first idle window to "just became active", not to a stale timestamp
    setShowHint(true);
    let hideTimer = window.setTimeout(() => setShowHint(false), HINT_VISIBLE_MS);

    const poll = window.setInterval(() => {
      if (Date.now() - lastActivity.current >= IDLE_MS) {
        notifyActivity();
        setShowHint(true);
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => setShowHint(false), HINT_VISIBLE_MS);
      }
    }, 1000);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { showHint, notifyActivity };
}
