import { K, Q, T } from "./narration";
import type { TakeAwayStep } from "./types";

/** Take-away model: a ten-frame of identical objects, emptied one drag/tap at a time from the
 * last slot backward into a visible "outside" tray, then an MCQ asks how many remain - round-13
 * flow:
 *   1. intro - equation only.
 *   2. shown - highlight the minuend, apples fade in one by one with a running count.
 *   3..N. remove-k (k=1..subtrahend) - highlight the subtrahend, drag/tap the next apple out
 *      (arrow annotation shown by the scene, not this file) - every remove step doubles as
 *      "just removed k-1" AND "prompting removal k" until the last one, same merge pattern as
 *      countBack's hops. The removed pile in the tray stays fully visible all the way through.
 *   N+1. ask - "how many are left" MCQ appears, and ONLY NOW does the removed pile start to fade
 *      (round-13: visible right up to this question, not before).
 *   N+2. reveal.
 */
export function generateTakeAwaySteps(minuend: number, subtrahend: number): TakeAwayStep[] {
  const steps: TakeAwayStep[] = [];
  const remaining = minuend - subtrahend;

  steps.push({
    id: "intro",
    view: "takeAway",
    minuend,
    subtrahend,
    shown: false,
    removedCount: 0,
    highlight: "none",
    revealAnswer: false,
    narration: [T("Let's find "), Q(`${minuend} − ${subtrahend}`), T(".")],
  });

  steps.push({
    id: "shown",
    view: "takeAway",
    minuend,
    subtrahend,
    shown: true,
    removedCount: 0,
    highlight: "minuend",
    revealAnswer: false,
    narration: [T("Here are "), K(String(minuend)), T(" apples.")],
  });

  for (let k = 0; k < subtrahend; k++) {
    steps.push({
      id: `remove-${k + 1}`,
      view: "takeAway",
      minuend,
      subtrahend,
      shown: true,
      removedCount: k,
      highlight: "subtrahend",
      requiresTap: true,
      tapTargetIndex: minuend - 1 - k,
      revealAnswer: false,
      narration:
        k === 0
          ? [T("Take away "), K(String(subtrahend)), T(". Tap one out.")]
          : [T("Tap out "), K(String(k + 1)), T(".")],
    });
  }

  steps.push({
    id: "ask",
    view: "takeAway",
    minuend,
    subtrahend,
    shown: true,
    removedCount: subtrahend,
    highlight: "none",
    fadeRemoved: true,
    askRemaining: true,
    requiresTap: true,
    revealAnswer: false,
    narration: [T("How many apples are in the box now?")],
  });

  steps.push({
    id: "reveal",
    view: "takeAway",
    minuend,
    subtrahend,
    shown: true,
    removedCount: subtrahend,
    highlight: "none",
    fadeRemoved: true,
    askRemaining: true,
    revealAnswer: true,
    narration: [
      K(String(minuend)),
      T(" take away "),
      K(String(subtrahend)),
      T(" is "),
      Q(String(remaining)),
      T("."),
    ],
  });

  return steps;
}
