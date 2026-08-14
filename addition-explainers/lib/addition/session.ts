import { decomposeDigits } from "./digits";
import { generateMcqOptions } from "./mcq";
import { buildPhases, parsePhase } from "./phases";
import type { AdditionConfig, MovedCount, Place, PlaceRecord, RowKey, Session } from "./types";

const PLACE_KEYS: Place[] = ["hundreds", "tens", "ones"];

function fillPlaces<T>(value: (place: Place) => T): PlaceRecord<T> {
  return Object.fromEntries(PLACE_KEYS.map((p) => [p, value(p)])) as PlaceRecord<T>;
}

function setPlace<T>(record: PlaceRecord<T>, place: Place, value: T): PlaceRecord<T> {
  return { ...record, [place]: value };
}

export function createSession(a1: number, a2: number, config: AdditionConfig): Session {
  const d1 = decomposeDigits(a1);
  const d2 = decomposeDigits(a2);
  return {
    a1,
    a2,
    sum: a1 + a2,
    own: fillPlaces((place) => ({ n1: d1[place], n2: d2[place] })),
    phaseIdx: 0,
    predictions: fillPlaces(() => null),
    dragged: fillPlaces(() => 0),
    moved: fillPlaces((): MovedCount => ({ n1: 0, n2: 0 })),
    packed: fillPlaces(() => 0),
    awaitingPack: fillPlaces(() => false),
    mcqOptions: fillPlaces(() => null),
    carryIn: fillPlaces(() => 0),
    carryDragged: fillPlaces(() => false),
  };
}

/** The true raw target for a place - own digits plus whatever carried in. This is what the
 * child is actually predicting/dragging toward, not the post-regroup single digit. */
export function getPlaceTarget(place: Place, session: Session): number {
  return session.own[place].n1 + session.own[place].n2 + session.carryIn[place];
}

/** Loose (unpacked) dot count currently shown in a place's Total cell. */
export function getLooseCount(place: Place, session: Session): number {
  return session.dragged[place] - session.packed[place] * 10;
}

/** Runs whenever the given place's predict-* phase is (re-)entered: resets that place's
 * per-place sub-state and regenerates its MCQ options from the true (own + carryIn) target.
 * `dragged[place]` starts at 0 even when a carry is sitting there - the carry is no longer
 * silently pre-counted, it's dragged in explicitly from its own carry row (see CarryRow), same
 * as any own digit's dots (COMMIT_DRAG with rowKey "carry"). Also defensively zeroes the NEXT
 * place's carryIn/carryDragged - without this, re-entering a pack after going back via Prev
 * would double the next place's carry each time (the real bug this exists to prevent). */
function resetPlace(session: Session, place: Place, config: AdditionConfig): Session {
  const correct = getPlaceTarget(place, session);
  const nextPlace = config.processingOrder[config.processingOrder.indexOf(place) + 1] ?? null;
  let next: Session = {
    ...session,
    dragged: setPlace(session.dragged, place, 0),
    moved: setPlace(session.moved, place, { n1: 0, n2: 0 }),
    packed: setPlace(session.packed, place, 0),
    awaitingPack: setPlace(session.awaitingPack, place, false),
    predictions: setPlace(session.predictions, place, null),
    mcqOptions: setPlace(session.mcqOptions, place, generateMcqOptions(correct, config.mcqMax)),
    carryDragged: setPlace(session.carryDragged, place, false),
  };
  if (nextPlace) {
    next = {
      ...next,
      carryIn: setPlace(next.carryIn, nextPlace, 0),
      carryDragged: setPlace(next.carryDragged, nextPlace, false),
    };
  }
  return next;
}

function applyPhaseChange(session: Session, newPhaseIdx: number, config: AdditionConfig): Session {
  const phases = buildPhases(config);
  let next: Session = { ...session, phaseIdx: newPhaseIdx };
  const phaseObj = parsePhase(phases[newPhaseIdx]);
  if (phaseObj.type === "predict" && phaseObj.place) {
    next = resetPlace(next, phaseObj.place, config);
  }
  return next;
}

export type SessionAction =
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_BACK" }
  | { type: "SELECT_PREDICTION"; place: Place; value: number }
  | { type: "COMMIT_DRAG"; place: Place; rowKey: RowKey }
  | { type: "PACK_PLACE"; place: Place }
  | { type: "RESTART"; a1: number; a2: number };

export function additionReducer(
  session: Session,
  action: SessionAction,
  config: AdditionConfig,
): Session {
  const phases = buildPhases(config);

  switch (action.type) {
    case "ADVANCE_PHASE": {
      if (session.phaseIdx >= phases.length - 1) return session;
      return applyPhaseChange(session, session.phaseIdx + 1, config);
    }

    case "GO_BACK": {
      if (session.phaseIdx <= 0) return session;
      let newIdx = session.phaseIdx - 1;
      // A `drag-*` phase is a dead end when landed on directly (nothing left to drag once
      // every dot is already committed) - skip straight back to that place's predict phase.
      if (parsePhase(phases[newIdx]).type === "drag") {
        newIdx -= 1;
      }
      if (newIdx < 0) return session;
      return applyPhaseChange(session, newIdx, config);
    }

    case "SELECT_PREDICTION": {
      const withPrediction: Session = {
        ...session,
        predictions: setPlace(session.predictions, action.place, action.value),
      };
      if (session.phaseIdx >= phases.length - 1) return withPrediction;
      return applyPhaseChange(withPrediction, session.phaseIdx + 1, config);
    }

    case "COMMIT_DRAG": {
      const { place, rowKey } = action;
      const dragged = session.dragged[place] + 1;
      const packedSoFar = session.packed[place] * 10;
      const awaitingPack = dragged - packedSoFar === 10 ? true : session.awaitingPack[place];
      let next: Session = {
        ...session,
        dragged: setPlace(session.dragged, place, dragged),
        awaitingPack: setPlace(session.awaitingPack, place, awaitingPack),
      };
      if (rowKey === "carry") {
        next = { ...next, carryDragged: setPlace(next.carryDragged, place, true) };
      } else {
        const key = rowKey === "num1" ? "n1" : "n2";
        next = {
          ...next,
          moved: setPlace(next.moved, place, {
            ...next.moved[place],
            [key]: next.moved[place][key] + 1,
          }),
        };
      }
      return next;
    }

    case "PACK_PLACE": {
      const { place } = action;
      const nextPlace = config.processingOrder[config.processingOrder.indexOf(place) + 1] ?? null;
      let next: Session = {
        ...session,
        packed: setPlace(session.packed, place, session.packed[place] + 1),
        awaitingPack: setPlace(session.awaitingPack, place, false),
      };
      if (nextPlace) {
        next = {
          ...next,
          carryIn: setPlace(next.carryIn, nextPlace, next.carryIn[nextPlace] + 1),
        };
      }
      return next;
    }

    case "RESTART":
      return createSession(action.a1, action.a2, config);

    default:
      return session;
  }
}
