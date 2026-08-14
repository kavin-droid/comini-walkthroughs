import { K, Q, T } from "./narration";
import type { CountBackStep } from "./types";

/** Counting-back model: a rabbit sits on the minuend and hops backward one number at a time along
 * a number line, landing on the answer. Flow (round-11/13 spec):
 *   1. intro - equation only, nothing placed yet.
 *   2. placed - highlight the minuend, rabbit appears on it.
 *   3. hop-1 - highlight the subtrahend, hop back ONE step automatically (never tap-gated).
 *   4..N. hop-k (k=2..subtrahend) - reached by TAPPING the correct next tick (see NumberLineScene's
 *      wrong-tap shake+flash handling) - every hop step doubles as "landed here" AND "prompting
 *      the next tap" until the last one.
 *   N+1. ask-position - once the rabbit has landed for good, an MCQ asks "which number is the
 *      rabbit on" before revealing the answer (round-13).
 *   N+2. reveal.
 * Every step is a pure function of (minuend, subtrahend, hopsDone) - the rabbit's on-screen
 * x-position is `minuend - hopsDone`, so simply changing `hopsDone` from one render to the next is
 * all a component needs for Framer Motion to glide it continuously between ticks - no manual
 * animation choreography here. */
export function generateCountBackSteps(minuend: number, subtrahend: number): CountBackStep[] {
  const lineMax = minuend;
  const steps: CountBackStep[] = [];

  steps.push({
    id: "intro",
    view: "countBack",
    minuend,
    subtrahend,
    lineMax,
    placed: false,
    hopsDone: 0,
    highlight: "none",
    revealAnswer: false,
    narration: [T("Let's find "), Q(`${minuend} − ${subtrahend}`), T(".")],
  });

  steps.push({
    id: "placed",
    view: "countBack",
    minuend,
    subtrahend,
    lineMax,
    placed: true,
    hopsDone: 0,
    highlight: "minuend",
    revealAnswer: false,
    narration: [T("Start at "), K(String(minuend)), T(".")],
  });

  for (let i = 1; i <= subtrahend; i++) {
    const landingValue = minuend - i;
    const requiresTap = i < subtrahend;
    steps.push({
      id: `hop-${i}`,
      view: "countBack",
      minuend,
      subtrahend,
      lineMax,
      placed: true,
      hopsDone: i,
      highlight: "subtrahend",
      requiresTap,
      nextHopTarget: requiresTap ? minuend - (i + 1) : undefined,
      revealAnswer: false,
      narration:
        i === 1
          ? [T("Count back "), K(String(subtrahend)), T(". Hop 1: "), Q(String(landingValue)), T(".")]
          : requiresTap
            ? [T("Tap the next spot to hop on.")]
            : [T("Hop "), K(String(i)), T(": "), Q(String(landingValue)), T(".")],
    });
  }

  const answer = minuend - subtrahend;

  steps.push({
    id: "ask-position",
    view: "countBack",
    minuend,
    subtrahend,
    lineMax,
    placed: true,
    hopsDone: subtrahend,
    highlight: "none",
    requiresTap: true,
    askPosition: true,
    revealAnswer: false,
    narration: [T("We hopped "), K(String(subtrahend)), T(" steps back. Where is the rabbit now?")],
  });

  steps.push({
    id: "reveal",
    view: "countBack",
    minuend,
    subtrahend,
    lineMax,
    placed: true,
    hopsDone: subtrahend,
    highlight: "none",
    askPosition: true,
    revealAnswer: true,
    narration: [
      T("Count back "),
      K(String(subtrahend)),
      T(" from "),
      K(String(minuend)),
      T(" is "),
      Q(String(answer)),
      T("."),
    ],
  });

  return steps;
}
