import { actionWord, sequenceEnd, sessionSequence } from "./sequence";
import type { PhaseObj, Session } from "./types";

export interface NarrationFragment {
  text: string;
  emphasis?: "key" | "quote";
}

function K(text: string | number): NarrationFragment {
  return { text: String(text), emphasis: "key" };
}
function Q(text: string | number): NarrationFragment {
  return { text: String(text), emphasis: "quote" };
}
function T(text: string): NarrationFragment {
  return { text };
}

/** Ported from the vanilla app's buildJumpPhrase(), then simplified per the language audit: two
 * short sentences ("what happened" / "where it landed") instead of one colon-joined sentence, and
 * numerals throughout instead of number-words. For a step of 1, a single "count on/back" line;
 * for larger steps, names every skipped-over number before the landed one, so the gap being
 * jumped is explicit rather than implied. Used for jump 1 only - every jump after that is an
 * interactive tap phase with its own prompt/feedback (see buildTapFeedback below). */
function buildJumpPhrase(prev: number, cur: number, step: number, dir: 1 | -1): NarrationFragment[] {
  if (step === 1) {
    return [T(dir === 1 ? "Count 1 more. " : "Count back 1. "), T("Land on "), Q(cur), T(".")];
  }
  const skipped: number[] = [];
  if (dir === 1) {
    for (let n = prev + 1; n < cur; n++) skipped.push(n);
  } else {
    for (let n = prev - 1; n > cur; n--) skipped.push(n);
  }
  const fragments: NarrationFragment[] = [T(dir === 1 ? "Skip over " : "Skip back over ")];
  skipped.forEach((n, i) => {
    if (i > 0) fragments.push(T(", "));
    fragments.push(Q(n));
  });
  fragments.push(T(". Land on "), Q(cur), T("."));
  return fragments;
}

/** How many number-line steps separate a wrong tap from the real target - used both for the
 * on-canvas "steps off" label (see NumberLineView) and the narration feedback below. */
export function tapStepsOff(tapped: number, target: number): number {
  return Math.abs(target - tapped);
}

/** The "what comes next" question, shared verbatim between the number-line's interactive jump
 * phases and the hundred-grid's tap-through phases, so finding the same sequence a second time
 * on the grid feels like the same exercise, not a different one. */
function buildTapQuestion(currentValue: number, step: number, dir: 1 | -1): NarrationFragment[] {
  return [
    T("What number is "),
    K(`${step} ${dir === 1 ? "more" : "less"}`),
    T(" than "),
    Q(currentValue),
    T("?"),
  ];
}

/** Feedback for a tap the child just "hopped" onto: states how far off it landed - without
 * naming the target outright, so the child still has to do the counting themselves. A tap on the
 * wrong side of the current point entirely (not even heading toward the target) gets a simpler
 * "that's the wrong way" nudge instead of a step count, since "short"/"too far" doesn't apply
 * until they're at least counting in the right direction. The Try Again button (not this text)
 * is what invites another attempt, so this only ever states the fact. */
function buildTapFeedback(tapped: number, target: number, currentValue: number, dir: 1 | -1): NarrationFragment[] {
  const headingTowardTarget = tapped !== currentValue && Math.sign(tapped - currentValue) === dir;
  if (!headingTowardTarget) {
    return [
      Q(tapped),
      T(" is the wrong way. Go "),
      K(dir === 1 ? "forward" : "back"),
      T(" from "),
      Q(currentValue),
      T("."),
    ];
  }
  const neededSteps = tapStepsOff(tapped, target);
  const stepWord = neededSteps === 1 ? "step" : "steps";
  const overshot = dir === 1 ? tapped > target : tapped < target;
  return [
    Q(tapped),
    T(" is "),
    K(`${neededSteps} ${stepWord} ${overshot ? "too far" : "short"}`),
    T("."),
  ];
}

export function buildNarration(phaseObj: PhaseObj, session: Session): NarrationFragment[] {
  const { startVal, step, dir, jumps } = session;
  const seq = sessionSequence(session);
  const end = sequenceEnd(session);
  const word = actionWord(dir);

  switch (phaseObj.type) {
    case "intro":
      return [T("Let's "), K(word), T(" from "), Q(startVal), T(" in "), K(`${step}s`), T(".")];

    case "jump": {
      const i = phaseObj.jumpIndex!;
      if (i === 1) {
        return buildJumpPhrase(seq[0], seq[1], step, dir);
      }
      // Interactive tap phase: seq[i-1] is the last confirmed point, seq[i] the (unstated) target.
      const currentValue = seq[i - 1];
      const target = seq[i];
      if (session.lastWrongTap !== null) {
        return buildTapFeedback(session.lastWrongTap, target, currentValue, dir);
      }
      return buildTapQuestion(currentValue, step, dir);
    }

    case "trip":
      return [T("Here's the whole trip: "), Q(seq.join(" → ")), T(".")];

    case "pattern":
      return [
        T("Here's the same pattern on a "),
        K("hundred grid"),
        T(". Now tap "),
        K("your trip's numbers"),
        T(", in order!"),
      ];

    case "gridTap": {
      const i = phaseObj.jumpIndex!;
      if (i === 1) {
        return [T("Here's the first jump on the grid. "), T("Land on "), Q(seq[1]), T(".")];
      }
      const currentValue = seq[i - 1];
      if (session.lastWrongGridTap !== null) {
        const wrong = session.lastWrongGridTap;
        if (seq.includes(wrong)) {
          return [Q(wrong), T(" is on your trip, but not yet. Try again!")];
        }
        return [Q(wrong), T(" isn't on this trip. Try another number!")];
      }
      return buildTapQuestion(currentValue, step, dir);
    }

    case "final":
      return [
        K("All done!"),
        T(" "),
        T(dir === 1 ? "Skip counting" : "Counting back"),
        T(" from "),
        Q(startVal),
        T(" in "),
        K(`${step}s`),
        T(`, ${jumps} times, lands on `),
        Q(end),
        T("."),
      ];

    default:
      return [];
  }
}
