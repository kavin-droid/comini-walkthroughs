/** Generates exactly 3 MCQ options: the correct answer plus 2 distractors (correct +/- a random
 * 1-3 offset, deduped, clamped to [0,9]), shuffled via Fisher-Yates. A place-value digit MCQ is
 * always in the 0-9 range regardless of place. */
export function generateMcqOptions(correct: number): number[] {
  const candidates = new Set<number>([correct]);
  let guard = 0;
  while (candidates.size < 3 && guard < 60) {
    const delta = Math.floor(Math.random() * 3) + 1;
    const candidate = correct + (Math.random() < 0.5 ? -delta : delta);
    if (candidate >= 0 && candidate <= 9) {
      candidates.add(candidate);
    }
    guard++;
  }
  const arr = Array.from(candidates);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
