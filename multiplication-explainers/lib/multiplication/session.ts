import type { ConceptConfig, MultiplicationConfig, MultiplicationStep } from "./types";

export interface Session {
  a: number;
  b: number;
  conceptId: string;
  stepIdx: number;
  /** Selected option value per question id (see StepQuestion), keyed across the whole session -
   * not reset by GO_BACK, only by RESTART - so re-visiting an answered question via Previous
   * still shows its stored pick, matching the addition apps' `predictions` record. */
  answers: Record<string, string>;
  /** Distributive property only: the child's confirmed split point (columns in the first part),
   * chosen via SplitSlider - same persistence rule as `answers` (survives GO_BACK, reset by
   * RESTART). `null` means no choice has been made yet, and generateDistributiveSteps falls back
   * to its own auto-computed default. */
  splitChoice: number | null;
}

export type SessionAction =
  | { type: "ADVANCE_STEP" }
  | { type: "GO_BACK" }
  | { type: "RESTART"; a: number; b: number; conceptId: string }
  | { type: "SELECT_ANSWER"; questionId: string; value: string }
  | { type: "SET_SPLIT"; value: number };

export function createSession(a: number, b: number, config: MultiplicationConfig): Session {
  return { a, b, conceptId: config.concepts[0].id, stepIdx: 0, answers: {}, splitChoice: null };
}

export function getActiveConcept(config: MultiplicationConfig, session: Session): ConceptConfig {
  return config.concepts.find((c) => c.id === session.conceptId) ?? config.concepts[0];
}

export function getSteps(config: MultiplicationConfig, session: Session) {
  return getActiveConcept(config, session).generate(session.a, session.b, session.splitChoice);
}

/** True while the current step needs a confirmed interaction before the child can move on - an
 * unanswered MCQ (see StepQuestion), or the distributive property's split step before "Split" has
 * ever been pressed (see ArrayStep.splitInteractive / SET_SPLIT). Once a choice exists (even from
 * an earlier visit), revisiting either kind of step via Previous no longer blocks navigation -
 * same precedent as an already-answered question. Footer and PlaybackContext both read this so
 * autoplay pauses and the nav buttons hide in exactly the same cases. */
export function isAwaitingInteraction(step: MultiplicationStep, session: Session): boolean {
  if (step.question) return session.answers[step.question.id] === undefined;
  if (step.kind === "array" && step.splitInteractive) return session.splitChoice === null;
  return false;
}

export function multiplicationReducer(
  state: Session,
  action: SessionAction,
  config: MultiplicationConfig,
): Session {
  switch (action.type) {
    case "RESTART":
      return { a: action.a, b: action.b, conceptId: action.conceptId, stepIdx: 0, answers: {}, splitChoice: null };
    case "ADVANCE_STEP": {
      const stepCount = getSteps(config, state).length;
      return { ...state, stepIdx: Math.min(state.stepIdx + 1, stepCount - 1) };
    }
    case "GO_BACK":
      return { ...state, stepIdx: Math.max(state.stepIdx - 1, 0) };
    case "SELECT_ANSWER": {
      const stepCount = getSteps(config, state).length;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
        stepIdx: Math.min(state.stepIdx + 1, stepCount - 1),
      };
    }
    case "SET_SPLIT": {
      const nextState = { ...state, splitChoice: action.value };
      const stepCount = getSteps(config, nextState).length;
      return { ...nextState, stepIdx: Math.min(state.stepIdx + 1, stepCount - 1) };
    }
    default:
      return state;
  }
}
