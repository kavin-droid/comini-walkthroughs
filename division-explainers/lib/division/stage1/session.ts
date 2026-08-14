import { buildRoundRobinPlacements } from "../placement";
import type { Stage1Session } from "./types";

export function createStage1Session(total: number, people: number): Stage1Session {
  return {
    total,
    people,
    quotient: total / people,
    placements: buildRoundRobinPlacements(total, people),
    phase: "pile-reveal",
    dotsPlaced: 0,
    previewCount: 0,
  };
}

export type Stage1Action =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "TICK" }
  | { type: "SHARE_ITEM" }
  | { type: "RESTART"; total: number; people: number };

/** pile-reveal (auto-counts the pile in, then settles - manual Next) -[Next]-> people-reveal
 * (auto-counts people in, then settles) -[Next]-> distribute (drag each glowing item onto its
 * friend to share it - always drag-driven, never auto or timer-advanced, see
 * useStage1Playback) -[auto once dotsPlaced===total]-> celebrate -[Next/timer]-> recap
 * -[Next/timer]-> done. */
export function stage1Reducer(state: Stage1Session, action: Stage1Action): Stage1Session {
  switch (action.type) {
    case "RESTART":
      return createStage1Session(action.total, action.people);

    case "TICK": {
      if (state.phase === "pile-reveal") {
        if (state.previewCount >= state.total) return state;
        return { ...state, previewCount: state.previewCount + 1 };
      }
      if (state.phase === "people-reveal") {
        if (state.previewCount >= state.people) return state;
        return { ...state, previewCount: state.previewCount + 1 };
      }
      return state;
    }

    case "SHARE_ITEM": {
      if (state.phase !== "distribute" || state.dotsPlaced >= state.total) return state;
      return { ...state, dotsPlaced: state.dotsPlaced + 1 };
    }

    case "ADVANCE_PHASE": {
      if (state.phase === "pile-reveal") return { ...state, phase: "people-reveal", previewCount: 0 };
      if (state.phase === "people-reveal") return { ...state, phase: "distribute" };
      if (state.phase === "distribute") {
        if (state.dotsPlaced < state.total) return state;
        return { ...state, phase: "celebrate" };
      }
      if (state.phase === "celebrate") return { ...state, phase: "recap" };
      if (state.phase === "recap") return { ...state, phase: "done" };
      return state;
    }

    case "GO_BACK": {
      if (state.phase === "people-reveal") return { ...state, phase: "pile-reveal", previewCount: state.total };
      if (state.phase === "distribute") return { ...state, phase: "people-reveal", previewCount: state.people, dotsPlaced: 0 };
      if (state.phase === "celebrate") return { ...state, phase: "distribute", dotsPlaced: state.total };
      if (state.phase === "recap") return { ...state, phase: "celebrate" };
      if (state.phase === "done") return { ...state, phase: "recap" };
      return state;
    }

    default:
      return state;
  }
}
