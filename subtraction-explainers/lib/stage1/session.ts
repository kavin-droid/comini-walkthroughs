import { generateCountBackSteps } from "./countBack";
import { generateTakeAwaySteps } from "./takeAway";
import { COUNT_BACK_PRESETS, TAKE_AWAY_PRESETS } from "./config";
import type { AnyStage1Step, Concept } from "./types";

export interface NumberPair {
  minuend: number;
  subtrahend: number;
}

export interface Stage1State {
  concept: Concept;
  /** The active (minuend, subtrahend) pair per concept - remembered independently so switching
   * concepts and back doesn't lose the earlier pick. Starts at that concept's first preset (see
   * config.ts - the presets now only ever serve as this starting default, there's no picker UI
   * for them anymore, round-21); SET_CUSTOM overwrites it with a validated hand-entered pair
   * (round-20: "users should be able to update the question contents"). */
  numbers: Record<Concept, NumberPair>;
  stepIdx: number;
}

export function createStage1State(): Stage1State {
  return {
    concept: "countBack",
    numbers: { countBack: COUNT_BACK_PRESETS[0], takeAway: TAKE_AWAY_PRESETS[0] },
    stepIdx: 0,
  };
}

export function buildSteps(state: Stage1State): AnyStage1Step[] {
  const { minuend, subtrahend } = state.numbers[state.concept];
  if (state.concept === "countBack") {
    return generateCountBackSteps(minuend, subtrahend);
  }
  return generateTakeAwaySteps(minuend, subtrahend);
}

export type Stage1Action =
  | { type: "ADVANCE" }
  | { type: "BACK" }
  | { type: "SET_CONCEPT"; concept: Concept }
  | { type: "SET_CUSTOM"; concept: Concept; minuend: number; subtrahend: number }
  | { type: "RESTART" };

export function stage1Reducer(state: Stage1State, action: Stage1Action): Stage1State {
  switch (action.type) {
    case "ADVANCE": {
      const steps = buildSteps(state);
      if (state.stepIdx >= steps.length - 1) return state;
      return { ...state, stepIdx: state.stepIdx + 1 };
    }
    case "BACK": {
      if (state.stepIdx <= 0) return state;
      return { ...state, stepIdx: state.stepIdx - 1 };
    }
    case "SET_CONCEPT": {
      if (action.concept === state.concept) return state;
      return { ...state, concept: action.concept, stepIdx: 0 };
    }
    case "SET_CUSTOM": {
      return {
        ...state,
        numbers: { ...state.numbers, [action.concept]: { minuend: action.minuend, subtrahend: action.subtrahend } },
        stepIdx: 0,
      };
    }
    case "RESTART":
      return { ...state, stepIdx: 0 };
    default:
      return state;
  }
}
