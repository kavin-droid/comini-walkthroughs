import {
  buildPhases,
  getPhaseCount,
  getTapTargetIndex,
  isInteractive,
  isInteractiveGridTap,
} from "./phases";
import { buildSequence } from "./sequence";
import type { Direction, Session, StepSize } from "./types";

export function createSession(startVal: number, dir: Direction, step: StepSize, jumps: number): Session {
  return {
    startVal,
    dir,
    step,
    jumps,
    phaseIdx: 0,
    lastWrongTap: null,
    wrongGridTaps: [],
    lastWrongGridTap: null,
  };
}

export type SessionAction =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "GO_TO_INTRO" }
  | { type: "TAP_NUMBER"; value: number }
  | { type: "RETRY" }
  | { type: "RESTART"; startVal: number; dir: Direction; step: StepSize; jumps: number };

function withPhase(session: Session, phaseIdx: number): Session {
  return { ...session, phaseIdx, lastWrongTap: null, lastWrongGridTap: null };
}

export function skipCountingReducer(session: Session, action: SessionAction): Session {
  switch (action.type) {
    case "ADVANCE_PHASE": {
      const lastIdx = getPhaseCount(session.jumps) - 1;
      if (session.phaseIdx >= lastIdx) return session;
      // An interactive tap phase (line or grid) can only be left via a correct TAP_NUMBER -
      // enforced here too, not just by disabling the Footer's Next button, so the invariant
      // holds regardless of caller (this is also what keeps autoplay from skipping the exercise).
      const phaseObj = buildPhases(session.jumps)[session.phaseIdx];
      if (isInteractive(phaseObj)) return session;
      return withPhase(session, session.phaseIdx + 1);
    }

    case "GO_BACK": {
      if (session.phaseIdx <= 0) return session;
      return withPhase(session, session.phaseIdx - 1);
    }

    // Mirrors the vanilla app's startPlay(): pressing play again after reaching the end
    // restarts the walkthrough from the intro rather than doing nothing.
    case "GO_TO_INTRO": {
      if (session.phaseIdx === 0) return session;
      return withPhase(session, 0);
    }

    case "TAP_NUMBER": {
      const phaseObj = buildPhases(session.jumps)[session.phaseIdx];
      const targetIdx = getTapTargetIndex(phaseObj);
      if (targetIdx === null) return session; // not an interactive tap phase - ignore
      // Line only: already showing a wrong hop - only Try Again (RETRY) can clear it.
      if (session.lastWrongTap !== null) return session;
      const seq = buildSequence(session.startVal, session.step, session.dir, session.jumps);
      const target = seq[targetIdx];
      if (action.value === target) {
        const lastIdx = getPhaseCount(session.jumps) - 1;
        return withPhase(session, Math.min(session.phaseIdx + 1, lastIdx));
      }
      if (isInteractiveGridTap(phaseObj)) {
        // Grid: no hop, no Try Again - a wrong tap just gives feedback and (only if the tapped
        // number is NOT anywhere in the trip) greys that cell out permanently. A tap on a number
        // that IS somewhere in the trip - just not this particular target yet - stays fully
        // tappable, since it's the right answer for a LATER gridTap phase; permanently disabling
        // it here would make that later question unanswerable.
        const isEverCorrect = seq.includes(action.value);
        if (!isEverCorrect && !session.wrongGridTaps.includes(action.value)) {
          return {
            ...session,
            wrongGridTaps: [...session.wrongGridTaps, action.value],
            lastWrongGridTap: action.value,
          };
        }
        return { ...session, lastWrongGridTap: action.value };
      }
      // Line: hop onto the wrong point instead of advancing - the child sees where it lands and
      // how far off it was, then must press Try Again (not just tap again) to retry.
      return { ...session, lastWrongTap: action.value };
    }

    case "RETRY": {
      if (session.lastWrongTap === null) return session;
      return { ...session, lastWrongTap: null };
    }

    case "RESTART":
      return createSession(action.startVal, action.dir, action.step, action.jumps);

    default:
      return session;
  }
}
