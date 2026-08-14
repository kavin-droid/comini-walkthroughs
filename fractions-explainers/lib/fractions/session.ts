import type { ConceptConfig, FractionConfig } from "./types";

export interface Session {
  conceptId: string;
  fraction: string;
  piece1: string;
  piece2: string;
  stepIdx: number;
  /** Whether the *current* step (identified only by stepIdx, not remembered across visits) has
   * been answered correctly. Irrelevant for non-interactive steps. Reset to false any time
   * stepIdx changes, so re-entering a previously-solved interactive step via Previous always
   * asks again - there is no per-step history, only "is the step on screen right now solved". */
  solved: boolean;
}

export type SessionAction =
  | { type: "ADVANCE_STEP" }
  | { type: "GO_BACK" }
  | { type: "MARK_SOLVED" }
  | { type: "RESTART"; conceptId: string; fraction: string; piece1: string; piece2: string };

export function createSession(config: FractionConfig): Session {
  const concept = config.concepts[0];
  return {
    conceptId: concept.id,
    fraction: concept.defaultFraction,
    piece1: concept.defaultPiece1,
    piece2: concept.defaultPiece2,
    stepIdx: 0,
    solved: false,
  };
}

export function getActiveConcept(config: FractionConfig, session: Session): ConceptConfig {
  return config.concepts.find((c) => c.id === session.conceptId) ?? config.concepts[0];
}

export function getSteps(config: FractionConfig, session: Session) {
  const concept = getActiveConcept(config, session);
  return concept.generate(session.fraction, session.piece1, session.piece2);
}

export function fractionReducer(
  state: Session,
  action: SessionAction,
  config: FractionConfig,
): Session {
  switch (action.type) {
    case "RESTART":
      return {
        conceptId: action.conceptId,
        fraction: action.fraction,
        piece1: action.piece1,
        piece2: action.piece2,
        stepIdx: 0,
        solved: false,
      };
    case "ADVANCE_STEP": {
      const stepCount = getSteps(config, state).length;
      return { ...state, stepIdx: Math.min(state.stepIdx + 1, stepCount - 1), solved: false };
    }
    case "GO_BACK":
      return { ...state, stepIdx: Math.max(state.stepIdx - 1, 0), solved: false };
    case "MARK_SOLVED":
      return { ...state, solved: true };
    default:
      return state;
  }
}
