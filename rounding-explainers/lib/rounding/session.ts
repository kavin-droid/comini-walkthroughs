import { buildRoundingSteps } from "./steps";
import type { Session } from "./types";

export function createSession(n: number, roundTo: number): Session {
  return {
    n,
    roundTo,
    steps: buildRoundingSteps(n, roundTo),
    stepIdx: 0,
    placed: false,
    mcqAnswered: false,
    mcqCorrect: null,
  };
}

export type SessionAction =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "GO_TO_START" }
  | { type: "PLACE_MARKER" }
  | { type: "ANSWER_MCQ" }
  | { type: "RESTART"; n: number; roundTo: number };

/**
 * Mirrors the vanilla apps' goNext()/goPrev(): a plain index bump/decrement, nothing else. A
 * generated sequence has at most one `placeTap` step and at most one `closer` step, so - unlike
 * the vanilla step objects, which mutate `placed`/`mcqAnswered`/`mcqCorrect` on themselves in
 * place - lifting those three flags onto the Session is behaviorally identical: navigating back
 * to the placeTap or closer step never resets them (the vanilla version never resets that
 * mutated state on navigation either, it's set once per playthrough and stays set), so a child
 * who already answered correctly and then goes back and forward again sees the step in its
 * already-answered (static marker / disabled MCQ) state, exactly as before.
 */
export function roundingReducer(session: Session, action: SessionAction): Session {
  switch (action.type) {
    case "ADVANCE_PHASE": {
      if (session.stepIdx >= session.steps.length - 1) return session;
      return { ...session, stepIdx: session.stepIdx + 1 };
    }

    case "GO_BACK": {
      if (session.stepIdx <= 0) return session;
      return { ...session, stepIdx: session.stepIdx - 1 };
    }

    // Mirrors the vanilla apps' startPlay(): pressing play when already at the last step
    // restarts the walkthrough from step 0 (same n/roundTo, steps not regenerated) rather than
    // doing nothing.
    case "GO_TO_START": {
      if (session.stepIdx === 0) return session;
      return { ...session, stepIdx: 0 };
    }

    case "PLACE_MARKER":
      return { ...session, placed: true };

    case "ANSWER_MCQ":
      return { ...session, mcqAnswered: true, mcqCorrect: true };

    case "RESTART":
      return createSession(action.n, action.roundTo);

    default:
      return session;
  }
}
