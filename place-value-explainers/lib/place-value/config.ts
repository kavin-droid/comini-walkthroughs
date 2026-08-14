import { generatePlaceValueSteps2 } from "./stage2";
import { generatePlaceValueSteps3 } from "./stage3";
import type { PlaceValueConfig } from "./types";

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

export const STAGE2_CONFIG: PlaceValueConfig = {
  id: "stage2",
  title: "Place Value",
  ageBand: "Ages 6–7",
  digits: 2,
  conceptSelectable: false,
  concepts: [
    {
      id: "placeValue",
      label: "Place Value of 2-Digit Numbers",
      generate: generatePlaceValueSteps2,
    },
  ],
  numberLabel: "Number",
  numberMin: 10,
  numberMax: 99,
  defaultNumber: 72,
  hasQuiz: true,
  validate: validateStage2,
  progressionHref: "/stage3/",
  progressionLabel: "Stage 3 · Ages 7–8",
};

export const STAGE3_CONFIG: PlaceValueConfig = {
  id: "stage3",
  title: "Place Value",
  ageBand: "Ages 7–8",
  digits: 3,
  conceptSelectable: false,
  concepts: [
    {
      id: "placeValue",
      label: "Place Value of 3-Digit Numbers",
      generate: generatePlaceValueSteps3,
    },
  ],
  numberLabel: "Number",
  numberMin: 100,
  numberMax: 999,
  defaultNumber: 234,
  hasQuiz: false,
  validate: validateStage3,
  progressionHref: "/stage2/",
  progressionLabel: "Stage 2 · Ages 6–7",
};
