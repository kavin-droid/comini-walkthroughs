import { generateMcqOptions } from "../mcq";
import type { Stage3Session, UnpackStage } from "./types";

export function createStage3Session(dividend: number, divisor: number): Stage3Session {
  return {
    dividend,
    divisor,
    tensDigit: Math.floor(dividend / 10),
    onesDigit: dividend % 10,
    tensPredicted: null,
    tensGuess: null,
    mcqOptionsTens: null,
    tensCountProgress: 0,
    tensSharePlaced: 0,
    tensContainerCounts: new Array(divisor).fill(0),
    tensLeftover: 0,
    leftoverCountProgress: 0,
    unpackStages: [],
    onesTotal: dividend % 10,
    onesPredicted: null,
    onesGuess: null,
    mcqOptionsOnes: null,
    onesCountProgress: 0,
    onesSharedRounds: 0,
    remainder: 0,
    phase: "numerals",
  };
}

export type Stage3Action =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "SELECT_TENS_PREDICTION"; value: number }
  | { type: "COUNT_TENS_TICK" }
  | { type: "CONTINUE_AFTER_COUNT_TENS" }
  | { type: "SHARE_TENS_TICK" }
  | { type: "FINISH_SHARE_TENS" }
  | { type: "COUNT_LEFTOVER_TICK" }
  | { type: "CONTINUE_AFTER_COUNT_LEFTOVER" }
  | { type: "TAP_UNPACK"; index: number }
  | { type: "UNPACK_MOVE_DONE"; index: number }
  | { type: "UNPACK_FADE_DONE"; index: number }
  | { type: "FINISH_UNPACK" }
  | { type: "SELECT_ONES_PREDICTION"; value: number }
  | { type: "COUNT_ONES_TICK" }
  | { type: "CONTINUE_AFTER_COUNT_ONES" }
  | { type: "TAP_SHARE_ONES_ROUND" }
  | { type: "RESTART"; dividend: number; divisor: number };

/** Method B, granular tap-driven version:
 *   numerals (just "76 / 4", centered - nothing else on screen) -> intro (the WorkingAnswer
 *   bracket FLIPs into its sidebar spot; whole dividend "76" highlights together as the
 *   place-value breakdown fades in) -> reveal-friends (divisor highlights, friends fade in - the
 *   ONLY thing that changes this step, breakdown stays put) -> focus-tens ("we'll focus on the
 *   tens first" - narrows the WorkingAnswer highlight to just the tens digit, nothing else changes
 *   yet) -> predict-tens (ones column fades out, MCQ asked; a highlight outline fades in on the
 *   tens column, "we'll start here") -> count-tens (the highlight outline fades out as counting
 *   begins; auto count-by-groups-of-divisor demo, THEN pauses with feedback once counting finishes
 *   - count+feedback share one screen) -> share-tens (a separate, purely auto-animated
 *   distribution step, no pause) -> count-leftover (counts the leftover packs out "1.. 2.. 3..",
 *   THEN pauses on a "can't share evenly" callout) -> unpack-intro (an "Unpack!" callout, nothing
 *   else changes) -> unpack (tap/drag each leftover pack, THEN pauses once every pack has unpacked
 *   - each unpacked spot leaves a ghost outline behind rather than vanishing, so the "hand-off" to
 *   ones only happens on an explicit Next) -> focus-ones -> predict-ones (MCQ) -> count-ones (auto
 *   count-by-divisor demo, THEN pauses with feedback once counting finishes, same
 *   count+feedback-then-separate-distribution split as count-tens/share-tens) -> share-ones (tap
 *   each round) -> remainder -> recap -> notation -> done.
 * share-tens/count-leftover/unpack are skipped when there's nothing to place/unpack; share-ones is
 * skipped when the predicted ones digit is 0. numerals/intro/reveal-friends/focus-tens/
 * predict-tens/count-tens(settled)/count-leftover(settled)/unpack(settled)/predict-ones/
 * count-ones(settled) are the reviewable GO_BACK checkpoints, matching the earlier dead-end
 * convention. */
export function stage3Reducer(state: Stage3Session, action: Stage3Action): Stage3Session {
  switch (action.type) {
    case "RESTART":
      return createStage3Session(action.dividend, action.divisor);

    case "ADVANCE_PHASE": {
      if (state.phase === "numerals") return { ...state, phase: "intro" };
      if (state.phase === "intro") return { ...state, phase: "reveal-friends" };
      if (state.phase === "reveal-friends") return { ...state, phase: "focus-tens" };
      if (state.phase === "focus-tens") {
        const correct = Math.floor(state.tensDigit / state.divisor);
        return { ...state, phase: "predict-tens", mcqOptionsTens: generateMcqOptions(correct, 9) };
      }
      if (state.phase === "unpack-intro") return { ...state, phase: "unpack" };
      if (state.phase === "focus-ones") {
        const correct = Math.floor(state.onesTotal / state.divisor);
        return { ...state, phase: "predict-ones", mcqOptionsOnes: generateMcqOptions(correct, 9) };
      }
      if (state.phase === "remainder") return { ...state, phase: "recap" };
      if (state.phase === "recap") return { ...state, phase: "notation" };
      if (state.phase === "notation") return { ...state, phase: "done" };
      return state;
    }

    case "SELECT_TENS_PREDICTION": {
      if (state.phase !== "predict-tens") return state;
      const tensPredicted = Math.floor(state.tensDigit / state.divisor);
      const tensLeftover = state.tensDigit - tensPredicted * state.divisor;
      return { ...state, tensPredicted, tensGuess: action.value, tensLeftover, phase: "count-tens", tensCountProgress: 0 };
    }

    /** Ticks forward ONE block at a time (not a whole group) - "1.. 2.. 3.. 4" - so a group only
     * reads as complete once its last member has individually landed. */
    case "COUNT_TENS_TICK": {
      if (state.phase !== "count-tens" || state.tensCountProgress >= state.tensDigit) return state;
      return { ...state, tensCountProgress: state.tensCountProgress + 1 };
    }

    /** Dispatched from the Next button once counting has finished and the child has seen the
     * feedback callout - a deliberate, manual hand-off into the (separate) distribution step. */
    case "CONTINUE_AFTER_COUNT_TENS": {
      if (state.phase !== "count-tens") return state;
      if (state.tensPredicted !== null && state.tensPredicted > 0) return { ...state, phase: "share-tens" };
      if (state.tensLeftover > 0) return { ...state, phase: "count-leftover", leftoverCountProgress: 0 };
      return { ...state, phase: "focus-ones" };
    }

    case "SHARE_TENS_TICK": {
      if (state.phase !== "share-tens" || state.tensPredicted === null) return state;
      const target = state.tensPredicted * state.divisor;
      if (state.tensSharePlaced >= target) return state;
      const tensContainerCounts = state.tensContainerCounts.slice();
      tensContainerCounts[state.tensSharePlaced % state.divisor]++;
      return { ...state, tensContainerCounts, tensSharePlaced: state.tensSharePlaced + 1 };
    }

    /** Auto-dispatched by the ticker once the distribution finishes - no pause here (the
     * reflection pause already happened in count-tens), it just hands off to whatever's next. */
    case "FINISH_SHARE_TENS": {
      if (state.phase !== "share-tens" || state.tensPredicted === null) return state;
      if (state.tensSharePlaced < state.tensPredicted * state.divisor) return state;
      if (state.tensLeftover > 0) return { ...state, phase: "count-leftover", leftoverCountProgress: 0 };
      return { ...state, phase: "focus-ones" };
    }

    /** Ticks forward one leftover PACK at a time ("1.. 2.. 3.."), same per-block cadence as
     * count-tens - these packs are never groupable (that's the whole point, they're what's left
     * over), so there's no group/leftover split here, just a plain running count. */
    case "COUNT_LEFTOVER_TICK": {
      if (state.phase !== "count-leftover" || state.leftoverCountProgress >= state.tensLeftover) return state;
      return { ...state, leftoverCountProgress: state.leftoverCountProgress + 1 };
    }

    /** Dispatched from the Next button once the leftover packs have all been counted and the
     * child has seen the "can't share evenly" callout - hands off into unpack-intro's "Unpack!"
     * callout, which is its own separate step (nothing else changes there). */
    case "CONTINUE_AFTER_COUNT_LEFTOVER": {
      if (state.phase !== "count-leftover") return state;
      return { ...state, phase: "unpack-intro", unpackStages: new Array(state.tensLeftover).fill("packed") as UnpackStage[] };
    }

    case "TAP_UNPACK": {
      if (state.phase !== "unpack" || state.unpackStages[action.index] !== "packed") return state;
      const unpackStages = state.unpackStages.slice();
      unpackStages[action.index] = "moving";
      return { ...state, unpackStages };
    }

    /** The pack's FLIP travel from the tens pool to the ones column has landed - now it fades out
     * in place, before the equivalent ones units fade in. */
    case "UNPACK_MOVE_DONE": {
      if (state.phase !== "unpack" || state.unpackStages[action.index] !== "moving") return state;
      const unpackStages = state.unpackStages.slice();
      unpackStages[action.index] = "fading";
      return { ...state, unpackStages };
    }

    case "UNPACK_FADE_DONE": {
      if (state.phase !== "unpack" || state.unpackStages[action.index] !== "fading") return state;
      const unpackStages = state.unpackStages.slice();
      unpackStages[action.index] = "moved";
      return { ...state, unpackStages };
    }

    /** Dispatched from the Next button once every leftover pack has unpacked (ghosts showing) and
     * the child has seen it settle - mirrors CONTINUE_AFTER_COUNT_TENS's manual hand-off. */
    case "FINISH_UNPACK": {
      if (state.phase !== "unpack" || !state.unpackStages.every((s) => s === "moved")) return state;
      const onesTotal = state.onesDigit + state.tensLeftover * 10;
      return { ...state, onesTotal, phase: "focus-ones" };
    }

    case "SELECT_ONES_PREDICTION": {
      if (state.phase !== "predict-ones") return state;
      const onesPredicted = Math.floor(state.onesTotal / state.divisor);
      const remainder = state.onesTotal - onesPredicted * state.divisor;
      return { ...state, onesPredicted, onesGuess: action.value, remainder, phase: "count-ones", onesCountProgress: 0 };
    }

    /** Ticks forward one ONE unit at a time (not a whole group) - "1.. 2.. 3.. 4" within each
     * group of `divisor`, same per-block cadence as count-tens, so the count badge inside each
     * block can actually count up 1-2-3-4 instead of a whole group appearing at once. */
    case "COUNT_ONES_TICK": {
      if (state.phase !== "count-ones" || state.onesCountProgress >= state.onesTotal) return state;
      return { ...state, onesCountProgress: state.onesCountProgress + 1 };
    }

    /** Dispatched from the Next button once counting has finished and the child has seen the
     * feedback callout - the same deliberate hand-off as CONTINUE_AFTER_COUNT_TENS, keeping
     * "count" and "distribute" as separate steps here too. */
    case "CONTINUE_AFTER_COUNT_ONES": {
      if (state.phase !== "count-ones") return state;
      if (state.onesPredicted !== null && state.onesPredicted > 0) return { ...state, phase: "share-ones" };
      return { ...state, phase: "remainder" };
    }

    case "TAP_SHARE_ONES_ROUND": {
      if (state.phase !== "share-ones" || state.onesPredicted === null) return state;
      if (state.onesSharedRounds >= state.onesPredicted) return state;
      const onesSharedRounds = state.onesSharedRounds + 1;
      return {
        ...state,
        onesSharedRounds,
        phase: onesSharedRounds >= state.onesPredicted ? "remainder" : "share-ones",
      };
    }

    case "GO_BACK": {
      if (state.phase === "intro") return { ...state, phase: "numerals" };
      if (state.phase === "reveal-friends") return { ...state, phase: "intro" };
      if (state.phase === "focus-tens") return { ...state, phase: "reveal-friends" };
      if (state.phase === "predict-tens") return { ...state, phase: "focus-tens", mcqOptionsTens: null };
      if (state.phase === "count-tens") {
        return {
          ...state,
          phase: "predict-tens",
          tensPredicted: null,
          tensGuess: null,
          tensCountProgress: 0,
          tensSharePlaced: 0,
          tensContainerCounts: new Array(state.divisor).fill(0),
          tensLeftover: 0,
          leftoverCountProgress: 0,
          unpackStages: [],
        };
      }
      if (state.phase === "count-leftover") {
        // Steps back to the settled count-tens screen - tensPredicted/tensLeftover AND
        // share-tens's already-resolved output (tensSharePlaced/tensContainerCounts) are kept
        // intact, same as predict-ones's GO_BACK leaves count-tens's own state alone one level
        // down - share-tens itself is a dead end (not a target), but nothing upstream of THIS
        // transition needs resetting, only count-leftover's own downstream progress does.
        return { ...state, phase: "count-tens", leftoverCountProgress: 0, unpackStages: [] };
      }
      if (state.phase === "unpack-intro") return { ...state, phase: "count-leftover" };
      if (state.phase === "unpack") {
        // Redo the unpacking from scratch rather than fast-forwarding past it.
        return { ...state, phase: "unpack-intro", unpackStages: new Array(state.tensLeftover).fill("packed") as UnpackStage[] };
      }
      if (state.phase === "predict-ones") {
        // Steps back to the settled count-tens screen (counting + feedback already resolved),
        // not all the way to predict-tens - share-tens/unpack-intro/unpack/focus-ones are dead
        // ends, but count-tens is itself a reviewable checkpoint now.
        return {
          ...state,
          phase: "count-tens",
          onesTotal: state.onesDigit,
          onesPredicted: null,
          onesGuess: null,
          mcqOptionsOnes: null,
          onesCountProgress: 0,
          onesSharedRounds: 0,
          remainder: 0,
        };
      }
      if (state.phase === "count-ones") {
        return {
          ...state,
          phase: "predict-ones",
          onesPredicted: null,
          onesGuess: null,
          onesCountProgress: 0,
          onesSharedRounds: 0,
          remainder: 0,
        };
      }
      if (state.phase === "remainder") {
        return {
          ...state,
          phase: "predict-ones",
          onesPredicted: null,
          onesGuess: null,
          onesCountProgress: 0,
          onesSharedRounds: 0,
          remainder: 0,
        };
      }
      if (state.phase === "recap") return { ...state, phase: "remainder" };
      if (state.phase === "notation") return { ...state, phase: "recap" };
      if (state.phase === "done") return { ...state, phase: "notation" };
      return state;
    }

    default:
      return state;
  }
}
