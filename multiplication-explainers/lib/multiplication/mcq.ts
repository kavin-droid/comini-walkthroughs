import type { QuestionOption } from "./types";

/** Builds up to 4 numeric options (the correct value plus nearby distractors), clamped to
 * [min, max] and deduped. Deliberately not randomized (unlike the addition apps' MCQ helper):
 * `generate(a, b)` re-runs on every render (see MultiplicationContext), so anything using
 * `Math.random()` here would reshuffle the options - and jump the buttons under the child's
 * finger - on any unrelated re-render, not just when a new step is actually generated. */
export function numericMcqOptions(correct: number, min: number, max: number): QuestionOption[] {
  const offsets = [-2, -1, 1, 2, -3, 3];
  const values = new Set<number>([correct]);
  for (const offset of offsets) {
    if (values.size >= 4) break;
    const candidate = correct + offset;
    if (candidate >= min && candidate <= max) values.add(candidate);
  }
  return Array.from(values)
    .sort((x, y) => x - y)
    .map((v) => ({ value: String(v), label: String(v) }));
}

export const YES_NO_OPTIONS: QuestionOption[] = [
  { value: "yes", label: "Yes, same" },
  { value: "no", label: "No, different" },
];
