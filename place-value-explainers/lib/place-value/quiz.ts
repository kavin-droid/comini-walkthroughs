/** Ported 1:1 from the vanilla stage2 app's makeQuizOptions(correct): the correct value plus up
 * to 2 distractors from [correct-1, correct+1, correct-2, correct+2] (skipping negatives and
 * duplicates), shuffled. Used for both the tens-count and ones-count quizzes. */
export function makeQuizOptions(correct: number): number[] {
  const picks: number[] = [];
  [correct - 1, correct + 1, correct - 2, correct + 2].forEach((v) => {
    if (picks.length < 2 && v >= 0 && v !== correct && picks.indexOf(v) === -1) picks.push(v);
  });
  const options = [correct, ...picks];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = options[i];
    options[i] = options[j];
    options[j] = tmp;
  }
  return options;
}
