import { generateSteps } from "./steps";
import type { CompareOrderConfig, Session } from "./types";

export function createSession(values: number[], config: CompareOrderConfig): Session {
  return { values, steps: generateSteps(values, config.places), idx: 0, tapStatus: "idle", wrongTapValue: null };
}

export type SessionAction =
  | { type: "ADVANCE" }
  | { type: "GO_BACK" }
  | { type: "GOTO_START" }
  | { type: "VISUALIZE"; values: number[] }
  | { type: "TAP"; value: number }
  | { type: "CLEAR_WRONG" };

/** Landing on a different step always starts that step's question fresh - a correct/wrong tap
 * from a previous visit shouldn't leak forward (or, on GO_BACK, backward) into the next step. */
function gotoIdx(session: Session, idx: number): Session {
  return { ...session, idx, tapStatus: "idle", wrongTapValue: null };
}

export function compareOrderReducer(
  session: Session,
  action: SessionAction,
  config: CompareOrderConfig,
): Session {
  switch (action.type) {
    case "ADVANCE": {
      if (session.idx >= session.steps.length - 1) return session;
      const current = session.steps[session.idx];
      if (current.requiresTap && session.tapStatus !== "correct") return session;
      return gotoIdx(session, session.idx + 1);
    }

    case "GO_BACK":
      if (session.idx <= 0) return session;
      return gotoIdx(session, session.idx - 1);

    case "GOTO_START":
      return gotoIdx(session, 0);

    case "VISUALIZE":
      return createSession(action.values, config);

    case "TAP": {
      const step = session.steps[session.idx];
      if (!step.requiresTap || session.tapStatus === "correct") return session;
      if (action.value === step.winnerVal) {
        return { ...session, tapStatus: "correct", wrongTapValue: null };
      }
      return { ...session, tapStatus: "wrong", wrongTapValue: action.value };
    }

    case "CLEAR_WRONG":
      if (session.tapStatus !== "wrong") return session;
      return { ...session, tapStatus: "idle", wrongTapValue: null };

    default:
      return session;
  }
}
