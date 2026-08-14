import { generateMcqOptions } from "@/lib/addition/mcq";
import { buildPhases, parsePhase } from "./phases";
import type { Stage1Session } from "./types";

export function createSession(a1: number, a2: number): Stage1Session {
  return {
    a1,
    a2,
    sum: a1 + a2,
    phaseIdx: 0,
    draggedA: 0,
    draggedB: 0,
    mcqOptions: null,
    prediction: null,
  };
}

/** Runs whenever a phase is (re-)entered, including via GO_BACK: showSetA/showSetB/dragA all
 * restart the drag tally to zero. dragA is the one true "start dragging" moment going forward
 * (its own dead-end skip on GO_BACK means it's only ever landed on going forward) - but
 * showSetA/showSetB also need the reset, because GO_BACK's dragA/dragB skip can land directly on
 * either of them with a stale tally still set, which would render already-dragged dots as empty
 * ghost outlines under narration ("Here is 3.") that promises full, freshly-arriving dots.
 * predict always regenerates a fresh MCQ + clears any prior guess. */
function applyPhaseChange(session: Stage1Session, newPhaseIdx: number, mcqMax: number): Stage1Session {
  const phases = buildPhases();
  let next: Stage1Session = { ...session, phaseIdx: newPhaseIdx };
  const phaseObj = parsePhase(phases[newPhaseIdx]);
  if (phaseObj.type === "showSetA" || phaseObj.type === "showSetB" || phaseObj.type === "dragA") {
    next = { ...next, draggedA: 0, draggedB: 0 };
  }
  if (phaseObj.type === "predict") {
    next = { ...next, prediction: null, mcqOptions: generateMcqOptions(next.sum, mcqMax) };
  }
  return next;
}

export type Stage1Action =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "DRAG_A" }
  | { type: "DRAG_B" }
  | { type: "SELECT_PREDICTION"; value: number }
  | { type: "RESTART"; a1: number; a2: number };

export function stage1Reducer(session: Stage1Session, action: Stage1Action, mcqMax: number): Stage1Session {
  const phases = buildPhases();

  switch (action.type) {
    case "ADVANCE_PHASE": {
      if (session.phaseIdx >= phases.length - 1) return session;
      return applyPhaseChange(session, session.phaseIdx + 1, mcqMax);
    }

    case "GO_BACK": {
      if (session.phaseIdx <= 0) return session;
      let newIdx = session.phaseIdx - 1;
      // dragA/dragB are dead ends when landed on going backward - nothing left to (re)drag
      // once every dot is already committed - so keep stepping back past both.
      while (newIdx > 0 && (phases[newIdx] === "dragA" || phases[newIdx] === "dragB")) {
        newIdx -= 1;
      }
      return applyPhaseChange(session, newIdx, mcqMax);
    }

    case "DRAG_A": {
      if (session.draggedA >= session.a1) return session;
      return { ...session, draggedA: session.draggedA + 1 };
    }

    case "DRAG_B": {
      if (session.draggedB >= session.a2) return session;
      return { ...session, draggedB: session.draggedB + 1 };
    }

    case "SELECT_PREDICTION": {
      const withPrediction: Stage1Session = { ...session, prediction: action.value };
      if (session.phaseIdx >= phases.length - 1) return withPrediction;
      return applyPhaseChange(withPrediction, session.phaseIdx + 1, mcqMax);
    }

    case "RESTART":
      return createSession(action.a1, action.a2);

    default:
      return session;
  }
}
