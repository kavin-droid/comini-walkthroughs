import { K, plural, Q, T, type NarrationFragment } from "./narration";
import type { Place, RoundingStep } from "./types";

export const SPLIT_BLOCK_TYPE: Record<Place, "hundred" | "ten" | "one"> = {
  hundreds: "hundred",
  tens: "ten",
  ones: "one",
};

type BaseFields = Pick<
  RoundingStep,
  | "n"
  | "roundTo"
  | "hopStep"
  | "hundreds"
  | "tens"
  | "ones"
  | "decisionPlace"
  | "lower"
  | "upper"
  | "isExact"
  | "isTie"
  | "rounded"
  | "closerSide"
  | "stepsToLower"
  | "stepsToUpper"
>;

type DefaultableFields = Pick<
  RoundingStep,
  | "view"
  | "highlightDecision"
  | "revealAnswer"
  | "done"
  | "hopTarget"
  | "hopDirection"
  | "hopCount"
  | "placeTap"
  | "showMarkerAt"
  | "settleTo"
  | "caption"
  | "bridge"
>;

type SnapInput = Partial<DefaultableFields> & { explanation: NarrationFragment[] };

/** Builds a single frame with shared defaults, mirroring the vanilla apps' `snap()` closure
 * inside `generateSteps`. */
function makeSnap(base: BaseFields) {
  const defaults: DefaultableFields = {
    view: "split",
    highlightDecision: false,
    revealAnswer: false,
    done: false,
    hopTarget: null,
    hopDirection: null,
    hopCount: 0,
    placeTap: false,
    showMarkerAt: null,
    settleTo: null,
    caption: null,
    bridge: false,
  };
  return function snap(o: SnapInput): RoundingStep {
    return { ...defaults, ...base, ...o };
  };
}

/**
 * Builds the flat step sequence for rounding `n` to the nearest `roundTo` (10 or 100). This is
 * a single generalized port of the vanilla stage3 app's `generateSteps(n, roundTo)` - which is
 * itself a strict generalization of stage2's `generateSteps(n)`: substituting roundTo=10 into
 * stage3's formulas (decisionPlace/hopStep/lower/upper/etc.) reproduces stage2's simpler math
 * exactly. Stage2's config always calls this with roundTo=10 fixed (no UI toggle shown).
 *
 * NARRATION NOTE: this generator's copy always uses stage3's phrasing (e.g. "Look at the ones
 * place... round to the nearest 10", "Which is closer?"), not stage2's original vanilla wording
 * ("Look at the ones side...", "Which ten is closer?") - stage3's phrasing is the one that must
 * stay correct across BOTH of its own roundTo values (10 and 100), so it is the canonical text
 * for this shared generator. This is a deliberate, disclosed deviation from stage2's original
 * vanilla copy - see the port's final report for the full list of affected strings.
 *
 * NON-OBVIOUS DETAIL (preserved byte-for-byte, do not "fix"): the hop views' animated marker
 * starts at `lower + stepsToLower * hopStep`, not at the true value of `n`. For roundTo=100 this
 * is a tens-digit-scaled offset from `lower`, not the real distance (e.g. n=349, roundTo=100 ->
 * lower=300, stepsToLower=4 (the tens digit), hopStep=10 -> hopStart=340, not 349). This is a
 * deliberate pedagogical simplification baked into the original vanilla design (hop count = digit
 * value, hop size = roundTo/10) - see hopStart in buildHopStep/buildCloserStep below.
 */
export function buildRoundingSteps(n: number, roundTo: number): RoundingStep[] {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor(n / 10) % 10;
  const ones = n % 10;
  const decisionPlace: "tens" | "ones" = roundTo === 10 ? "ones" : "tens";
  const decisionDigit = roundTo === 10 ? ones : tens;
  const hopStep = roundTo / 10;

  const lower = Math.floor(n / roundTo) * roundTo;
  const upper = lower + roundTo;
  const remainder = n - lower;
  const half = roundTo / 2;
  const isExact = remainder === 0;
  const isTie = remainder === half;
  const stepsToLower = decisionDigit;
  const stepsToUpper = 10 - decisionDigit;
  const rounded = isExact ? n : isTie ? upper : decisionDigit < 5 ? lower : upper;
  const closerSide: "below" | "above" | null = isExact ? null : rounded === lower ? "below" : "above";

  const snap = makeSnap({
    n,
    roundTo,
    hopStep,
    hundreds,
    tens,
    ones,
    decisionPlace,
    lower,
    upper,
    isExact,
    isTie,
    rounded,
    closerSide,
    stepsToLower,
    stepsToUpper,
  });

  const steps: RoundingStep[] = [];

  /* 1. Place value */
  const placeParts: NarrationFragment[] =
    hundreds > 0
      ? [
          Q(n),
          T(" has "),
          K(`${hundreds} ${plural(hundreds, "hundred")}`),
          T(", "),
          K(`${tens} ${plural(tens, "ten")}`),
          T(" and "),
          K(`${ones} ${plural(ones, "one")}`),
          T("."),
        ]
      : [
          Q(n),
          T(" has "),
          K(`${tens} ${plural(tens, "ten")}`),
          T(" and "),
          K(`${ones} ${plural(ones, "one")}`),
          T("."),
        ];
  steps.push(snap({ explanation: placeParts }));

  /* 2. Highlight the decision digit */
  steps.push(
    snap({
      highlightDecision: true,
      explanation: [
        T("Look at the "),
        K(`${decisionPlace}`),
        T(". It tells us how to round to the nearest "),
        T(String(roundTo)),
        T("."),
      ],
    }),
  );

  if (isExact) {
    // roundTo=10 -> "ends in 0"; roundTo=100 -> "ends in 00" (matches the number of trailing
    // zeros a multiple of roundTo always has - avoids the math-jargon term "multiple").
    const endsInSuffix = roundTo === 10 ? "0" : "00";
    steps.push(
      snap({
        view: "line",
        showMarkerAt: n,
        settleTo: n,
        caption: [Q(n), T(` already ends in ${endsInSuffix}.`)],
        explanation: [Q(n), T(` already ends in ${endsInSuffix}. It stays `), Q(n), T(".")],
      }),
    );
    steps.push(
      snap({
        view: "line",
        showMarkerAt: n,
        settleTo: n,
        revealAnswer: true,
        done: true,
        caption: [Q(n), T(" stays "), Q(n), T(".")],
        explanation: [K("Done!"), T(" "), Q(n), T(" rounds to "), Q(n), T(".")],
      }),
    );
    return steps;
  }

  /* 3. Tap where n goes */
  steps.push(
    snap({
      view: "line",
      placeTap: true,
      caption: [T(`Tap where ${n} goes`)],
      explanation: [T("Tap where "), Q(n), T(" sits on the line.")],
    }),
  );

  /* 4. Bridge */
  steps.push(
    snap({
      view: "line",
      showMarkerAt: n,
      bridge: true,
      caption: [Q(n), T(` is between ${lower} and ${upper}`)],
      explanation: [
        T("Now we will find out which is closer: "),
        Q(lower),
        T(" or "),
        Q(upper),
        T("."),
      ],
    }),
  );

  /* 5. Hop to lower */
  steps.push(
    snap({
      view: "hop",
      hopTarget: lower,
      hopDirection: "back",
      hopCount: stepsToLower,
      caption: [T(`Hop back to ${lower}`)],
      explanation: [T("Watch "), Q(n), T(" hop back to "), Q(lower), T(".")],
    }),
  );

  /* 6. Hop to upper */
  steps.push(
    snap({
      view: "hop",
      hopTarget: upper,
      hopDirection: "forward",
      hopCount: stepsToUpper,
      caption: [T(`Hop forward to ${upper}`)],
      explanation: [T("Now watch "), Q(n), T(" hop forward to "), Q(upper), T(".")],
    }),
  );

  /* 7. Closer MCQ */
  steps.push(
    snap({
      view: "closer",
      showMarkerAt: n,
      explanation: isTie
        ? [T("Both ways take "), K(`${stepsToLower} hops`), T(". Which one do we round up to?")]
        : [T("Which is closer: "), Q(lower), T(" or "), Q(upper), T("?")],
    }),
  );

  /* 8. Done */
  steps.push(
    snap({
      view: "done",
      showMarkerAt: rounded,
      settleTo: rounded,
      revealAnswer: true,
      done: true,
      caption: [Q(n), T(" rounds to "), Q(rounded)],
      explanation: [K("Done!"), T(" "), Q(n), T(" rounds to "), Q(rounded), T(".")],
    }),
  );

  return steps;
}

/** The hop views' (and closer view's) animated marker start position - see the non-obvious
 * detail documented on `buildRoundingSteps` above. Exposed separately so components can compute
 * it without re-deriving the formula. */
export function hopStartOf(step: RoundingStep): number {
  return step.lower + step.stepsToLower * step.hopStep;
}
