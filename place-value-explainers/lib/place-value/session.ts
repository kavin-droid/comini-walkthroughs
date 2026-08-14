import type { ConceptConfig, PlaceValueConfig } from "./types";

export interface Session {
  n: number;
  conceptId: string;
  stepIdx: number;
}

export type SessionAction =
  | { type: "ADVANCE_STEP" }
  | { type: "GO_BACK" }
  | { type: "RESTART"; n: number; conceptId: string };

export function createSession(n: number, config: PlaceValueConfig): Session {
  return { n, conceptId: config.concepts[0].id, stepIdx: 0 };
}

export function getActiveConcept(config: PlaceValueConfig, session: Session): ConceptConfig {
  return config.concepts.find((c) => c.id === session.conceptId) ?? config.concepts[0];
}

export function getSteps(config: PlaceValueConfig, session: Session) {
  return getActiveConcept(config, session).generate(session.n);
}

export function placeValueReducer(
  state: Session,
  action: SessionAction,
  config: PlaceValueConfig,
): Session {
  switch (action.type) {
    case "RESTART":
      return { n: action.n, conceptId: action.conceptId, stepIdx: 0 };
    case "ADVANCE_STEP": {
      const stepCount = getSteps(config, state).length;
      return { ...state, stepIdx: Math.min(state.stepIdx + 1, stepCount - 1) };
    }
    case "GO_BACK":
      return { ...state, stepIdx: Math.max(state.stepIdx - 1, 0) };
    default:
      return state;
  }
}
