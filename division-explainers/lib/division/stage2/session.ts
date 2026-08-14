import { buildBlockFillPlacements, buildRoundRobinPlacements } from "../placement";
import { generateMcqOptions } from "../mcq";
import type { Stage2Concept, Stage2Session } from "./types";

export function buildPlacements(total: number, divisor: number, concept: Stage2Concept): number[] {
  return concept === "sharing"
    ? buildRoundRobinPlacements(total, divisor)
    : buildBlockFillPlacements(total, divisor);
}

export function createStage2Session(total: number, divisor: number, concept: Stage2Concept): Stage2Session {
  return {
    total,
    divisor,
    concept,
    quotient: total / divisor,
    placements: buildPlacements(total, divisor, concept),
    phase: "equation",
    dotsPlaced: 0,
    previewCount: 0,
    predicted: null,
    mcqOptions: null,
  };
}

export type Stage2Action =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "TICK" }
  | { type: "SELECT_PREDICTION"; value: number }
  | { type: "RESTART"; total: number; divisor: number; concept: Stage2Concept };

/** One flow for both concepts: equation -[Next]-> reveal-dividend (auto-counts the dividend's
 * dots, THEN pauses - settle-then-manual-Next, same split as stage3's count-tens) -[Next]->
 * reveal-divisor -[auto]-> predict -[MCQ]-> distribute -[auto]-> feedback -[Next]-> reveal
 * (equation + answer) -[Next]-> notation (full breakdown + bridge arrows) -> done.
 *
 * reveal-divisor means different things per concept (see types.ts): for sharing, it auto-counts
 * in `divisor` friends, then settles for a manual Next into round1 (dealing one dot to each).
 * Grouping has no round1 - reveal-divisor itself reveals the single friend (previewCount target
 * of 1, not `divisor`) and then, in that SAME step, keeps auto-ticking dotsPlaced 0..divisor to
 * fill that one friend - "highlight the divisor, share that many to the friend" as one
 * continuous beat, not two separate Next-gated steps. dotsPlaced 0..divisor already lands every
 * dot in container 0 for grouping's block-fill placement, so no extra branching is needed there.
 * Once full, it auto-advances straight to predict (mirroring round1's old auto-handoff).
 * distribute then continues dotsPlaced from wherever the fill left off (divisor, for grouping) up
 * to total, growing further containers as each group completes.
 *
 * round1/distribute stay dead ends for GO_BACK (auto-animating, not independently reviewable);
 * reveal-dividend/reveal-divisor become reviewable once settled, mirroring stage3's checkpoints. */
export function stage2Reducer(state: Stage2Session, action: Stage2Action): Stage2Session {
  switch (action.type) {
    case "RESTART":
      return createStage2Session(action.total, action.divisor, action.concept);

    case "TICK": {
      if (state.phase === "reveal-dividend") {
        if (state.previewCount >= state.total) return state;
        return { ...state, previewCount: state.previewCount + 1 };
      }
      if (state.phase === "reveal-divisor") {
        if (state.concept === "sharing") {
          if (state.previewCount >= state.divisor) return state;
          return { ...state, previewCount: state.previewCount + 1 };
        }
        // Grouping: reveal the single friend first, then - same step - keep ticking to fill it
        // with `divisor` dots, no separate round1 phase needed.
        if (state.previewCount < 1) return { ...state, previewCount: 1 };
        if (state.dotsPlaced >= state.divisor) return state;
        return { ...state, dotsPlaced: state.dotsPlaced + 1 };
      }
      if (state.phase !== "round1" && state.phase !== "distribute") return state;
      const target = state.phase === "round1" ? state.divisor : state.total;
      if (state.dotsPlaced >= target) return state;
      return { ...state, dotsPlaced: state.dotsPlaced + 1 };
    }

    case "ADVANCE_PHASE": {
      if (state.phase === "equation") return { ...state, phase: "reveal-dividend", previewCount: 0 };
      if (state.phase === "reveal-dividend") return { ...state, phase: "reveal-divisor", previewCount: 0 };
      if (state.phase === "reveal-divisor") {
        if (state.concept === "sharing") return { ...state, phase: "round1" };
        return { ...state, phase: "predict", mcqOptions: generateMcqOptions(state.quotient, 9) };
      }
      if (state.phase === "round1") {
        return { ...state, phase: "predict", mcqOptions: generateMcqOptions(state.quotient, 9) };
      }
      if (state.phase === "distribute") return { ...state, phase: "feedback" };
      if (state.phase === "feedback") return { ...state, phase: "reveal" };
      if (state.phase === "reveal") return { ...state, phase: "notation" };
      if (state.phase === "notation") return { ...state, phase: "done" };
      return state;
    }

    case "SELECT_PREDICTION": {
      if (state.phase !== "predict") return state;
      return { ...state, predicted: action.value, phase: "distribute" };
    }

    case "GO_BACK": {
      if (state.phase === "reveal-dividend") return { ...state, phase: "equation", previewCount: 0 };
      if (state.phase === "reveal-divisor") return { ...state, phase: "reveal-dividend", previewCount: state.total };
      if (state.phase === "predict") {
        const previewCount = state.concept === "sharing" ? state.divisor : 1;
        return { ...state, phase: "reveal-divisor", previewCount, dotsPlaced: 0, predicted: null, mcqOptions: null };
      }
      if (state.phase === "feedback") return { ...state, phase: "predict", dotsPlaced: state.divisor };
      if (state.phase === "reveal") return { ...state, phase: "feedback" };
      if (state.phase === "notation") return { ...state, phase: "reveal" };
      if (state.phase === "done") return { ...state, phase: "notation" };
      return state;
    }

    default:
      return state;
  }
}
