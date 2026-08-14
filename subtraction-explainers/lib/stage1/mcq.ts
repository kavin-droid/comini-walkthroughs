/** 3 deterministic options (no Math.random - this is called from inside step generators/render
 * paths that recompute on every step change via useMemo, so randomness here would make an MCQ's
 * options visibly reshuffle every time the child steps back and forward again). Distractors are
 * correct-1/correct+1 (clamped, deduped against a fallback of correct+2), then rotated by
 * `correct` itself so the right answer isn't always in the same slot across different presets.
 * Shared by take-away's "how many are left" MCQ and counting-back's "which number is the rabbit
 * on" MCQ. */
export function generateNumberOptions(correct: number): number[] {
  const candidates = new Set<number>([correct]);
  for (const delta of [-1, 1, -2, 2]) {
    if (candidates.size >= 3) break;
    const v = correct + delta;
    if (v >= 0) candidates.add(v);
  }
  const arr = Array.from(candidates).slice(0, 3);
  const rotateBy = correct % arr.length;
  return [...arr.slice(rotateBy), ...arr.slice(0, rotateBy)];
}
