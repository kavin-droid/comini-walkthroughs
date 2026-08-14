import type { Stage3Config } from "./types";

export const STAGE3_META: Stage3Config = {
  title: "Division, Visualized",
  ageBand: "Ages 7–8",
  dividendMin: 12,
  dividendMax: 96,
  divisorOptions: [2, 3, 4, 5],
  defaultDividend: 76,
  defaultDivisor: 4,
};

/** One emoji per container, reusing the same placeholder set as stage2 for a consistent "friend"
 * visual identity across both stages. */
export const CONTAINER_AVATARS = ["🧒", "👦", "👧", "🧑", "👨"];

/** Remainders are now a supported outcome (the leftover ones after the final placement round),
 * so - unlike the original vanilla stage3 - dividend no longer has to divide evenly by divisor. */
export function validateStage3(dividend: number, divisor: number): string | null {
  if (Number.isNaN(dividend) || Number.isNaN(divisor)) return "Please enter valid numbers.";
  if (dividend < STAGE3_META.dividendMin || dividend > STAGE3_META.dividendMax) {
    return `The first number must be a 2-digit number between ${STAGE3_META.dividendMin} and ${STAGE3_META.dividendMax}.`;
  }
  if (!STAGE3_META.divisorOptions.includes(divisor)) {
    return "The second number must be 2, 3, 4 or 5.";
  }
  return null;
}
