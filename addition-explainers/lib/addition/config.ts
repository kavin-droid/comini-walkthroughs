import { decomposeDigits } from "./digits";
import type { AdditionConfig } from "./types";

function validateStage2(a1: number, a2: number): string | null {
  if (a1 < 10 || a1 > 89 || a2 < 10 || a2 > 89) {
    return "Use two numbers between 10 and 89.";
  }
  const d1 = decomposeDigits(a1);
  const d2 = decomposeDigits(a2);
  if (d1.ones + d2.ones > 9 || d1.tens + d2.tens > 9) {
    return "These numbers need packing. Try smaller ones here, like 24 and 35.";
  }
  return null;
}

function validateStage3(a1: number, a2: number): string | null {
  if (a1 < 100 || a1 > 899 || a2 < 100 || a2 > 899) {
    return "Use two numbers between 100 and 899.";
  }
  const d1 = decomposeDigits(a1);
  const d2 = decomposeDigits(a2);
  const carry1 = d1.ones + d2.ones >= 10 ? 1 : 0;
  const carry2 = d1.tens + d2.tens + carry1 >= 10 ? 1 : 0;
  const hundredsFinal = d1.hundreds + d2.hundreds + carry2;
  if (hundredsFinal > 9) {
    return "That answer is too big — it goes past 999. Try smaller numbers, like 168 and 257.";
  }
  return null;
}

export const STAGE2_CONFIG: AdditionConfig = {
  id: "stage2",
  places: ["tens", "ones"],
  processingOrder: ["ones", "tens"],
  allowCarry: false,
  addendMin: 10,
  addendMax: 89,
  defaultA1: 24,
  defaultA2: 35,
  validate: validateStage2,
  mcqMax: 18,
  title: "Adding",
  ageBand: "Ages 6–7",
  conceptLabel: "Adding Tens and Ones",
};

export const STAGE3_CONFIG: AdditionConfig = {
  id: "stage3",
  places: ["hundreds", "tens", "ones"],
  processingOrder: ["ones", "tens", "hundreds"],
  allowCarry: true,
  addendMin: 100,
  addendMax: 899,
  defaultA1: 168,
  defaultA2: 257,
  validate: validateStage3,
  mcqMax: 19,
  title: "Adding with Packing",
  ageBand: "Ages 7–8",
  conceptLabel: "Packing Tens and Hundreds",
};
