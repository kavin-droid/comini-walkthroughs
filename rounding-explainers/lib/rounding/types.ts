import type { NarrationFragment } from "./narration";

export type Place = "hundreds" | "tens" | "ones";

export type View = "split" | "line" | "hop" | "closer" | "done";

export type Side = "below" | "above";

export type HopDirection = "back" | "forward";

/** A single frame of the walkthrough - a plain, readonly, pure-data snapshot produced by
 * `buildRoundingSteps`. Unlike the vanilla step objects (which mutate `placed`/`mcqAnswered`/
 * `mcqCorrect` on themselves in place as the child interacts), this carries no mutable
 * interaction state - that state is lifted onto `Session` instead (see session.ts), since a
 * generated sequence has at most one `placeTap` step and at most one `closer` step per
 * playthrough. */
export interface RoundingStep {
  readonly view: View;
  readonly n: number;
  readonly roundTo: number;
  readonly hopStep: number;

  readonly hundreds: number;
  readonly tens: number;
  readonly ones: number;
  /** Which place's digit decides the rounding direction: "ones" when roundTo=10, "tens" when
   * roundTo=100. */
  readonly decisionPlace: "tens" | "ones";

  readonly lower: number;
  readonly upper: number;
  readonly isExact: boolean;
  readonly isTie: boolean;
  readonly rounded: number;
  readonly closerSide: Side | null;
  readonly stepsToLower: number;
  readonly stepsToUpper: number;

  readonly highlightDecision: boolean;
  readonly revealAnswer: boolean;
  readonly done: boolean;

  readonly hopTarget: number | null;
  readonly hopDirection: HopDirection | null;
  readonly hopCount: number;

  readonly placeTap: boolean;

  readonly showMarkerAt: number | null;
  readonly settleTo: number | null;

  readonly caption: NarrationFragment[] | null;
  readonly explanation: NarrationFragment[];
  readonly bridge: boolean;
}

export interface Session {
  n: number;
  roundTo: number;
  steps: RoundingStep[];
  stepIdx: number;
  /** True once the child has correctly tapped the number line on this playthrough's single
   * `placeTap` step (a generated sequence has at most one). */
  placed: boolean;
  /** True once the child has correctly answered this playthrough's single `closer` MCQ step. */
  mcqAnswered: boolean;
  mcqCorrect: boolean | null;
}

export interface RoundingConfig {
  id: "stage2" | "stage3";
  title: string;
  ageBand: string;
  conceptLabel: string;
  /** Display place columns, big place to small - drives the split-view column set. */
  places: Place[];
  numberMin: number;
  numberMax: number;
  defaultNumber: number;
  roundToOptions: number[];
  defaultRoundTo: number;
  progressionHref: string;
  progressionLabel: string;
  /** Returns an error string if invalid, else null. */
  validate: (n: number) => string | null;
}
