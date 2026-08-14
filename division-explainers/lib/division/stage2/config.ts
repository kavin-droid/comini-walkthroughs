import type { Stage2Config } from "./types";

export const STAGE2_META: Stage2Config = {
  title: "Division, Visualized",
  ageBand: "Ages 6–7",
  dividendMin: 6,
  dividendMax: 24,
  divisorMin: 2,
  divisorMax: 6,
  defaultDividend: 12,
  defaultDivisor: 3,
  defaultConcept: "sharing",
};

/** One emoji per friend container, cycled by index. Placeholder set - swap freely when real
 * avatar art is ready, nothing else in stage2 depends on these being emoji specifically. */
export const FRIEND_AVATARS = ["🧒", "👦", "👧", "🧑", "👨", "👩"];

export function validateStage2(total: number, divisor: number): string | null {
  if (Number.isNaN(total) || Number.isNaN(divisor)) return "Please enter valid numbers.";
  if (total < STAGE2_META.dividendMin || total > STAGE2_META.dividendMax) {
    return `The first number must be between ${STAGE2_META.dividendMin} and ${STAGE2_META.dividendMax}.`;
  }
  if (divisor < STAGE2_META.divisorMin || divisor > STAGE2_META.divisorMax) {
    return `The second number must be between ${STAGE2_META.divisorMin} and ${STAGE2_META.divisorMax}.`;
  }
  if (total % divisor !== 0) {
    const nearest = Math.round(total / divisor) * divisor;
    return `${total} doesn't split evenly into ${divisor}. Try a first number that splits evenly, like ${nearest}.`;
  }
  const quotient = total / divisor;
  if (quotient < 1 || quotient > 6) {
    return "Keep the answer between 1 and 6 so every round fits on screen. Try a smaller first number or a bigger second number.";
  }
  return null;
}
