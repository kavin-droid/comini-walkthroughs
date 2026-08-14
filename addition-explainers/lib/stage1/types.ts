/** Stage 1 has no place value at all - a single flat sequence: show two sets, drag them into
 * one box, predict the total, count it for real, then recap. */
export type Stage1PhaseType =
  | "intro"
  | "showSetA"
  | "showSetB"
  | "dragA"
  | "dragB"
  | "predict"
  | "count"
  | "done";

export interface Stage1PhaseObj {
  type: Stage1PhaseType;
}

export interface Stage1Session {
  a1: number;
  a2: number;
  sum: number;
  phaseIdx: number;
  /** How many of set A's dots have been dragged into the answer box (0..a1). */
  draggedA: number;
  /** How many of set B's dots have been dragged into the answer box (0..a2). */
  draggedB: number;
  mcqOptions: number[] | null;
  prediction: number | null;
}

export interface Stage1Config {
  id: "stage1";
  addendMin: number;
  addendMax: number;
  defaultA1: number;
  defaultA2: number;
  /** Returns an error string if invalid, else null. */
  validate: (a1: number, a2: number) => string | null;
  /** Upper clamp for MCQ distractor generation. */
  mcqMax: number;
  title: string;
  ageBand: string;
  conceptLabel: string;
}
