import type { CompareOrderConfig } from "./types";

function validateStage2(values: number[]): string | null {
  if (values.some((v) => Number.isNaN(v))) return "Please enter four valid numbers.";
  if (values.some((v) => v < 10 || v > 99)) {
    return "Each number must be a 2-digit number, between 10 and 99.";
  }
  return null;
}

function validateStage3(values: number[]): string | null {
  if (values.some((v) => Number.isNaN(v))) return "Please enter four valid numbers.";
  if (values.some((v) => v < 100 || v > 999)) {
    return "Each number must be a 3-digit number, between 100 and 999.";
  }
  return null;
}

export const STAGE2_CONFIG: CompareOrderConfig = {
  id: "stage2",
  places: [
    { key: "tens", label: "tens", digit: (v) => Math.floor(v / 10) },
    { key: "ones", label: "ones", digit: (v) => v % 10 },
  ],
  min: 10,
  max: 99,
  digitCount: 2,
  defaultValues: [21, 67, 49, 80],
  title: "Compare & Order",
  ageBand: "Ages 6–7",
  conceptLabel: "Compare & Order Numbers up to 99",
  progressionHref: "/stage3/",
  progressionLabel: "Stage 3 · Ages 7–8",
  poolGrid: "mobile",
  placeVisuals: true,
  validate: validateStage2,
  sizing: {
    cardValueFontSize: 26,
    placeColMinWidth: 42,
    placeColMinWidthNarrow: 36,
    trackSlotMinWidth: 56,
    trackSlotMinWidthNarrow: 44,
    trackSlotFontSize: 19,
    trackSlotFontSizeNarrow: 16,
    answerExprFontSize: 24,
    inputWidth: 78,
    inputFontSize: 20,
  },
};

export const STAGE3_CONFIG: CompareOrderConfig = {
  id: "stage3",
  places: [
    { key: "hundreds", label: "hundreds", digit: (v) => Math.floor(v / 100) },
    { key: "tens", label: "tens", digit: (v) => Math.floor(v / 10) % 10 },
    { key: "ones", label: "ones", digit: (v) => v % 10 },
  ],
  min: 100,
  max: 999,
  digitCount: 3,
  defaultValues: [214, 673, 489, 802],
  title: "Compare & Order",
  ageBand: "Ages 7–8",
  conceptLabel: "Compare & Order Numbers up to 999",
  progressionHref: "/stage2/",
  progressionLabel: "Stage 2 · Ages 6–7",
  poolGrid: "always",
  placeVisuals: false,
  validate: validateStage3,
  sizing: {
    cardValueFontSize: 24,
    placeColMinWidth: 38,
    placeColMinWidthNarrow: 32,
    trackSlotMinWidth: 62,
    trackSlotMinWidthNarrow: 48,
    trackSlotFontSize: 17,
    trackSlotFontSizeNarrow: 15,
    answerExprFontSize: 22,
    inputWidth: 84,
    inputFontSize: 19,
  },
};
