import { decomposeDigits } from "./digits";
import { buildRegroupPlan } from "./plan";
import { generateMcqOptions } from "./mcq";
import { buildPhases, parsePhase } from "./phases";
import type { Place, PlaceRecord, Session, SubtractionConfig } from "./types";

const PLACE_KEYS: Place[] = ["hundreds", "tens", "ones"];

function fillPlaces<T>(value: (place: Place) => T): PlaceRecord<T> {
  return Object.fromEntries(PLACE_KEYS.map((p) => [p, value(p)])) as PlaceRecord<T>;
}

function setPlace<T>(record: PlaceRecord<T>, place: Place, value: T): PlaceRecord<T> {
  return { ...record, [place]: value };
}

export function createSession(config: SubtractionConfig, minuend: number, subtrahend: number): Session {
  const m = decomposeDigits(minuend);
  const s = decomposeDigits(subtrahend);
  return {
    minuend,
    subtrahend,
    total: minuend - subtrahend,
    original: m,
    own: fillPlaces((place) => ({ start: m[place], take: s[place] })),
    regroupPlan: buildRegroupPlan(config, minuend, subtrahend),
    regrouped: fillPlaces(() => false),
    phaseIdx: 0,
    removed: fillPlaces(() => []),
    mcqOptions: fillPlaces(() => null),
  };
}

/** Undoes a place's committed regroup (borrow) - only relevant when GO_BACK lands the child
 * back on that place's own 'regroupAnnounce' step, to redo the tap-to-regroup cleanly. A no-op
 * if this place never needs to regroup, or its regroup hasn't been committed (yet/anymore). */
function undoRegroupIfNeeded(session: Session, place: Place): Session {
  const info = session.regroupPlan[place];
  if (!info.needsRegroup || !session.regrouped[place]) return session;
  const from = info.from!;
  return {
    ...session,
    own: setPlace(
      setPlace(session.own, from, { ...session.own[from], start: session.own[from].start + 1 }),
      place,
      { ...session.own[place], start: session.own[place].start - 10 },
    ),
    regrouped: setPlace(session.regrouped, place, false),
  };
}

/** Runs whenever the given place's predict-* phase is (re-)entered: resets that place's tap
 * progress and regenerates its MCQ options from the target (own.take). */
function resetPlaceInteraction(session: Session, place: Place): Session {
  return {
    ...session,
    removed: setPlace(session.removed, place, []),
    mcqOptions: setPlace(session.mcqOptions, place, generateMcqOptions(session.own[place].take)),
  };
}

function applyPhaseChange(session: Session, newPhaseIdx: number, phases: string[]): Session {
  let next: Session = { ...session, phaseIdx: newPhaseIdx };
  const phaseObj = parsePhase(phases[newPhaseIdx]);
  if (phaseObj.type === "regroupAnnounce" && phaseObj.place) {
    next = undoRegroupIfNeeded(next, phaseObj.place);
  }
  if (phaseObj.type === "predict" && phaseObj.place) {
    next = resetPlaceInteraction(next, phaseObj.place);
  }
  return next;
}

export type SessionAction =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "SELECT_PREDICTION"; place: Place; value: number }
  | { type: "COMMIT_REMOVE"; place: Place; index: number }
  | { type: "COMMIT_REGROUP"; place: Place }
  | { type: "RESTART"; minuend: number; subtrahend: number };

export function subtractionReducer(session: Session, action: SessionAction, config: SubtractionConfig): Session {
  const phases = buildPhases(config, session.regroupPlan);

  switch (action.type) {
    case "ADVANCE_PHASE": {
      if (session.phaseIdx >= phases.length - 1) return session;
      return applyPhaseChange(session, session.phaseIdx + 1, phases);
    }

    case "GO_BACK": {
      if (session.phaseIdx <= 0) return session;
      let newIdx = session.phaseIdx - 1;
      // 'drag'/'regroup' are dead ends when landed on directly - nothing left to tap once
      // already completed. Skip straight back to the phase that starts that interaction.
      const landedType = parsePhase(phases[newIdx]).type;
      if (landedType === "drag" || landedType === "regroup") {
        newIdx -= 1;
      }
      if (newIdx < 0) return session;
      return applyPhaseChange(session, newIdx, phases);
    }

    case "SELECT_PREDICTION": {
      // Only a correct guess ever reaches here - a wrong tap is handled entirely as local UI
      // feedback (shake + "Not quite") upstream.
      if (session.phaseIdx >= phases.length - 1) return session;
      return applyPhaseChange(session, session.phaseIdx + 1, phases);
    }

    case "COMMIT_REMOVE": {
      const { place, index } = action;
      const current = session.removed[place];
      // Records WHICH block was tapped, not just a count - the renderer ghosts exactly these
      // indices (round-23 fix: it used to ghost "the first N by position" regardless of which
      // block was actually tapped, so tapping the 3rd block could make a DIFFERENT one vanish).
      // Idempotent (re-tapping an already-removed block is a no-op) and still clamped at the
      // target - the auto-advance effect in SubtractionWalkthrough only fires when
      // `removed.length === take` exactly, and removed only ever grows during a drag phase, so
      // one over-eager extra tap must never push the count past take or the walkthrough could
      // never advance again.
      const target = session.own[place].take;
      if (current.includes(index) || current.length >= target) return session;
      return {
        ...session,
        removed: setPlace(session.removed, place, [...current, index]),
      };
    }

    case "COMMIT_REGROUP": {
      const { place } = action;
      const from = session.regroupPlan[place].from;
      if (!from) return session;
      return {
        ...session,
        own: setPlace(
          setPlace(session.own, from, { ...session.own[from], start: session.own[from].start - 1 }),
          place,
          { ...session.own[place], start: session.own[place].start + 10 },
        ),
        regrouped: setPlace(session.regrouped, place, true),
      };
    }

    case "RESTART":
      return createSession(config, action.minuend, action.subtrahend);

    default:
      return session;
  }
}
