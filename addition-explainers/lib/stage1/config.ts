import type { Stage1Config } from "./types";

function validateStage1(a1: number, a2: number): string | null {
  if (a1 < 1 || a1 > 9 || a2 < 1 || a2 > 9) {
    return "Both numbers must be between 1 and 9.";
  }
  if (a1 + a2 > 10) {
    return "Try two numbers that make 10 or less.";
  }
  return null;
}

export const STAGE1_CONFIG: Stage1Config = {
  id: "stage1",
  addendMin: 1,
  addendMax: 9,
  defaultA1: 3,
  defaultA2: 2,
  validate: validateStage1,
  mcqMax: 12,
  title: "Adding",
  ageBand: "Ages 5–6",
  conceptLabel: "Putting Dots Together",
};
