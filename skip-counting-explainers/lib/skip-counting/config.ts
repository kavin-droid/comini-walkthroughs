import type { SkipCountingConfig } from "./types";

function validateSkipCounting(
  startVal: number,
  dir: 1 | -1,
  step: 1 | 2 | 5 | 10,
  jumps: number,
): string | null {
  if (Number.isNaN(startVal) || Number.isNaN(jumps)) {
    return "Please enter valid numbers.";
  }
  if (startVal < 1 || startVal > 100) {
    return "Start must be between 1 and 100.";
  }
  if (jumps < 3 || jumps > 8) {
    return "Jumps must be between 3 and 8.";
  }
  const end = startVal + dir * step * jumps;
  if (dir === 1 && end > 100) {
    return "Too many jumps for this start. Try a smaller number.";
  }
  if (dir === -1 && end < 1) {
    return "Too many jumps for this start. Try a smaller number.";
  }
  return null;
}

export const SKIP_COUNTING_CONFIG: SkipCountingConfig = {
  title: "Skip Counting",
  ageBand: "Ages 6–7",
  conceptLabel: "Skip Counting (On/Back by 1s, 2s, 5s, 10s)",
  minStart: 1,
  maxStart: 100,
  minJumps: 3,
  maxJumps: 8,
  defaultStart: 14,
  defaultDir: 1,
  defaultStep: 2,
  defaultJumps: 5,
  stepOptions: [1, 2, 5, 10],
  validate: validateSkipCounting,
};
