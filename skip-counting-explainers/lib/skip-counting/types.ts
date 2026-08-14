export type Direction = 1 | -1;

export type StepSize = 1 | 2 | 5 | 10;

export type ViewMode = "line" | "grid";

export type PhaseType = "intro" | "jump" | "trip" | "pattern" | "gridTap" | "final";

export interface PhaseObj {
  type: PhaseType;
  /** 1-indexed jump number, only present for `jump` phases. */
  jumpIndex: number | null;
}

export interface Session {
  startVal: number;
  dir: Direction;
  step: StepSize;
  jumps: number;
  phaseIdx: number;
  /** The incorrectly-tapped number-line value the child is currently "hopped" onto, or null when
   * they're awaiting a fresh tap. While set, the number line shows them landed on this wrong
   * point (with the steps-off count) instead of the last confirmed point, tapping is disabled,
   * and the only way forward is the Try Again button (RETRY action) - which clears this back to
   * null without changing phaseIdx. Also cleared on any phase change. Line-view only. */
  lastWrongTap: number | null;
  /** Every hundred-grid cell the child has incorrectly tapped during the gridTap phases. Unlike
   * lastWrongTap, these accumulate and are never cleared by a phase change (or even RETRY, which
   * doesn't apply to the grid) - a cell ruled out stays ruled out (shown greyed and disabled) for
   * the rest of the grid-tap exercise, since it's genuinely not part of the answer regardless of
   * which sequence number is currently being asked for. Only RESTART clears it. */
  wrongGridTaps: number[];
  /** The most recent wrong grid tap, for transient "you just tapped X" narration feedback only -
   * cleared on every phase change like lastWrongTap, unlike wrongGridTaps which persists. */
  lastWrongGridTap: number | null;
}

export interface SkipCountingConfig {
  title: string;
  ageBand: string;
  conceptLabel: string;
  minStart: number;
  maxStart: number;
  minJumps: number;
  maxJumps: number;
  defaultStart: number;
  defaultDir: Direction;
  defaultStep: StepSize;
  defaultJumps: number;
  stepOptions: StepSize[];
  /** Returns an error string if invalid, else null. */
  validate: (startVal: number, dir: Direction, step: StepSize, jumps: number) => string | null;
}
