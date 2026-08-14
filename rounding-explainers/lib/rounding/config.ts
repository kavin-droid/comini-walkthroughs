import type { RoundingConfig } from "./types";

function validateStage2(n: number): string | null {
  if (Number.isNaN(n)) return "Please enter a valid number.";
  if (n < 10 || n > 99) return "Number must be a 2-digit number, between 10 and 99.";
  return null;
}

function validateStage3(n: number): string | null {
  if (Number.isNaN(n)) return "Please enter a valid number.";
  if (n < 100 || n > 999) return "Number must be a 3-digit number, between 100 and 999.";
  return null;
}

export const STAGE2_CONFIG: RoundingConfig = {
  id: "stage2",
  title: "Rounding",
  ageBand: "Ages 6–7",
  conceptLabel: "Rounding to the Nearest 10",
  places: ["tens", "ones"],
  numberMin: 10,
  numberMax: 99,
  defaultNumber: 73,
  roundToOptions: [10],
  defaultRoundTo: 10,
  progressionHref: "/stage3/",
  progressionLabel: "Stage 3 · Ages 7–8",
  validate: validateStage2,
};

export const STAGE3_CONFIG: RoundingConfig = {
  id: "stage3",
  title: "Rounding",
  ageBand: "Ages 7–8",
  conceptLabel: "Rounding to the Nearest 10 or 100",
  places: ["hundreds", "tens", "ones"],
  numberMin: 100,
  numberMax: 999,
  defaultNumber: 349,
  roundToOptions: [10, 100],
  defaultRoundTo: 10,
  progressionHref: "/stage2/",
  progressionLabel: "Stage 2 · Ages 6–7",
  validate: validateStage3,
};
