import type { Concept } from "./types";

/** No picker UI for these anymore (round-21 removed the quick-select pills entirely, so the
 * Question card matches stage2's exactly - label, two inputs, Show, nothing else) - they now only
 * ever supply the starting default pair each concept opens with, in createStage1State. */
export const COUNT_BACK_PRESETS: { minuend: number; subtrahend: number }[] = [
  { minuend: 7, subtrahend: 3 },
  { minuend: 9, subtrahend: 4 },
  { minuend: 6, subtrahend: 5 },
];

export const TAKE_AWAY_PRESETS: { minuend: number; subtrahend: number }[] = [
  { minuend: 8, subtrahend: 3 },
  { minuend: 6, subtrahend: 2 },
  { minuend: 9, subtrahend: 6 },
];

/** No curriculum benchmark doc in this repo states an explicit numeric range for ages 5-6
 * counting-back/take-away (checked GUIDELINES.md and every stage1 source comment - round-20
 * research) - these mirror the existing presets' own range (single-digit, minuend up to 9) plus
 * one point of headroom to 10 (the standard "subtraction within 10" EYFS/Grade-K framing), staying
 * safely under stage2's two-digit floor of 11 so the stages never overlap in difficulty. */
export const STAGE1_MINUEND_MIN = 2;
export const STAGE1_MINUEND_MAX = 10;
export const STAGE1_SUBTRAHEND_MIN = 1;
export const STAGE1_SUBTRAHEND_MAX = 9;

export function validateStage1(minuend: number, subtrahend: number): string | null {
  if (!Number.isInteger(minuend) || minuend < STAGE1_MINUEND_MIN || minuend > STAGE1_MINUEND_MAX) {
    return `The starting number must be between ${STAGE1_MINUEND_MIN} and ${STAGE1_MINUEND_MAX}.`;
  }
  if (!Number.isInteger(subtrahend) || subtrahend < STAGE1_SUBTRAHEND_MIN || subtrahend > STAGE1_SUBTRAHEND_MAX) {
    return `The amount to take away must be between ${STAGE1_SUBTRAHEND_MIN} and ${STAGE1_SUBTRAHEND_MAX}.`;
  }
  if (subtrahend >= minuend) return "The amount to take away must be smaller than the starting number.";
  return null;
}

export const CONCEPT_ORDER: Concept[] = ["countBack", "takeAway"];

export const CONCEPT_LABEL: Record<Concept, string> = {
  countBack: "Counting Back",
  takeAway: "Take Away",
};

export const CONCEPT_ICON: Record<Concept, string> = {
  countBack: "🐰",
  takeAway: "🍎",
};

export const TITLE = "Subtraction, Visualized";
export const AGE_BAND = "Ages 5–6";
export const CONCEPT_SUBTITLE = "Counting Back and Take Away";
