export type Place = "hundreds" | "tens" | "ones";

export type PhaseType =
  | "intro"
  | "showA"
  | "showB"
  | "focus"
  | "predict"
  | "drag"
  | "compare"
  | "bridge"
  | "bridgecarry"
  | "reveal"
  | "done";

export interface PhaseObj {
  type: PhaseType;
  place: Place | null;
}

export type RowKey = "num1" | "num2" | "carry" | "total";

export interface PlaceOwn {
  n1: number;
  n2: number;
}

export interface MovedCount {
  n1: number;
  n2: number;
}

/** All three place keys are always present on every session, for every config, even
 * when a config's `places` only uses a subset (e.g. stage2 never touches "hundreds").
 * This keeps one reducer/session shape shared by both stages instead of two variants. */
export type PlaceRecord<T> = Record<Place, T>;

/** Which SPECIFIC dot indices (per place, per addend row) have been dragged - not just a count.
 * Lives outside the reducer (see AdditionGrid) since it's purely a rendering concern (which
 * physical dot ghosts), reset in lockstep with the reducer's own `moved[place]` count reset. */
export type GhostedIndices = PlaceRecord<{ n1: Set<number>; n2: Set<number> }>;

export interface Session {
  a1: number;
  a2: number;
  sum: number;
  own: PlaceRecord<PlaceOwn>;
  phaseIdx: number;
  predictions: PlaceRecord<number | null>;
  dragged: PlaceRecord<number>;
  moved: PlaceRecord<MovedCount>;
  packed: PlaceRecord<number>;
  awaitingPack: PlaceRecord<boolean>;
  mcqOptions: PlaceRecord<number[] | null>;
  carryIn: PlaceRecord<number>;
  /** Whether that place's carried-in pack (see carryIn) has itself been dragged into the total
   * yet - the carry is no longer silently pre-counted, it's a real draggable unit sitting in its
   * own carry row (see CarryRow) that must be dragged in just like any own digit's dots. */
  carryDragged: PlaceRecord<boolean>;
}

export interface AdditionConfig {
  id: "stage2" | "stage3";
  /** Display column order, big place to small (matches written notation). */
  places: Place[];
  /** Real addition algorithm order, small place to big (ones must resolve before tens, etc). */
  processingOrder: Place[];
  allowCarry: boolean;
  addendMin: number;
  addendMax: number;
  defaultA1: number;
  defaultA2: number;
  /** Returns an error string if invalid, else null. */
  validate: (a1: number, a2: number) => string | null;
  /** Upper clamp for MCQ distractor generation (max possible column sum for this stage). */
  mcqMax: number;
  title: string;
  ageBand: string;
  conceptLabel: string;
}
