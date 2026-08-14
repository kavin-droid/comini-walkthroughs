import { decomposeDigits } from "./digits";
import { checkBorrowFeasibility } from "./plan";
import type { SubtractionConfig } from "./types";

function validateStage2(minuend: number, subtrahend: number): string | null {
  if (minuend < 11 || minuend > 99) return "The starting number must be between 11 and 99.";
  if (subtrahend < 10 || subtrahend > 88) {
    return "The amount to take away must be a two-digit number, between 10 and 88.";
  }
  if (subtrahend >= minuend) return "The amount to take away must be smaller than the starting number.";
  const m = decomposeDigits(minuend);
  const s = decomposeDigits(subtrahend);
  if (s.ones > m.ones || s.tens > m.tens) {
    return 'This piece covers subtraction without regrouping. Pick a "take away" number where each digit is smaller, like 68 − 24, not 68 − 29.';
  }
  return null;
}

function validateStage3(minuend: number, subtrahend: number): string | null {
  if (minuend < 100 || minuend > 999) return "The starting number must be between 100 and 999.";
  if (subtrahend < 1 || subtrahend > 899) return "The amount to take away must be between 1 and 899.";
  if (subtrahend >= minuend) return "The amount to take away must be smaller than the starting number.";
  const feasibility = checkBorrowFeasibility(STAGE3_CONFIG, minuend, subtrahend);
  if (!feasibility.ok) return feasibility.reason;
  return null;
}

export const STAGE2_CONFIG: SubtractionConfig = {
  id: "stage2",
  places: ["tens", "ones"],
  processingOrder: ["ones", "tens"],
  allowRegroup: false,
  minuendMin: 11,
  minuendMax: 99,
  subtrahendMin: 10,
  subtrahendMax: 88,
  defaultMinuend: 68,
  defaultSubtrahend: 24,
  validate: validateStage2,
  title: "Subtraction, Visualized",
  ageBand: "Ages 6–7",
  conceptLabel: "2-Digit Subtraction",
};

export const STAGE3_CONFIG: SubtractionConfig = {
  id: "stage3",
  places: ["hundreds", "tens", "ones"],
  processingOrder: ["ones", "tens", "hundreds"],
  allowRegroup: true,
  minuendMin: 100,
  minuendMax: 999,
  subtrahendMin: 1,
  subtrahendMax: 899,
  defaultMinuend: 342,
  defaultSubtrahend: 168,
  validate: validateStage3,
  title: "Subtraction, Visualized",
  ageBand: "Ages 7–8",
  conceptLabel: "Subtraction with Unpacking",
};
