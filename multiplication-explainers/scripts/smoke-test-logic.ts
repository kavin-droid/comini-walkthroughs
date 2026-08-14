import { STAGE2_CONFIG, STAGE3_CONFIG } from "../lib/multiplication/config";
import { createSession, multiplicationReducer, getSteps, isAwaitingInteraction } from "../lib/multiplication/session";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function textOf(fragments: { text: string }[]): string {
  return fragments.map((f) => f.text).join("");
}

// --- Stage2: Arrays concept (redesigned), 3 groups of 4 ---
{
  const concept = STAGE2_CONFIG.concepts.find((c) => c.id === "arrays")!;
  assert(STAGE2_CONFIG.validate(3, 4, concept) === null, "stage2 3x4 valid");
  assert(STAGE2_CONFIG.validate(1, 4, concept) !== null, "stage2 groups below range rejected");
  assert(STAGE2_CONFIG.validate(6, 4, concept) !== null, "stage2 groups above range rejected");
  assert(STAGE2_CONFIG.validate(3, 11, concept) !== null, "stage2 perGroup above range rejected");

  const steps = concept.generate(3, 4);
  // intro + highlight-rows + highlight-dots + fade+outline + row-def + row-count + col-def
  // + col-count + question + reveal + done = 11
  assert(steps.length === 11, `arrays 3x4 step count 11, got ${steps.length}`);

  const s0 = steps[0];
  assert(s0.kind === "arrayBuild" && s0.rowsRevealed === 0, "step0 equation only, no rows yet");
  if (s0.kind === "arrayBuild") {
    assert(s0.equationDisplay === "visible", "step0 in-workspace equation visible");
    assert(s0.outline === "hidden", "step0 no outline yet");
    assert(s0.answer.every((p) => !p.highlight), "step0 no factor highlighted");
    assert(s0.answer.some((p) => p.kind === "ph"), "step0 total hidden");
  }

  const s1 = steps[1];
  assert(s1.kind === "arrayBuild" && s1.rowReveal !== null, "step1 rows reveal one at a time");
  if (s1.kind === "arrayBuild") {
    assert(s1.rowsRevealed === 0, "step1 rows start unrevealed");
    assert(s1.dotRowsRevealed === 0, "step1 no dot rows yet");
    assert(s1.answer[0].highlight === true, "step1 highlights the rows factor (3)");
  }

  const s2 = steps[2];
  assert(s2.kind === "arrayBuild" && s2.dotRowReveal !== null, "step2 fills dots row by row");
  if (s2.kind === "arrayBuild") {
    assert(s2.rowsRevealed === 3, "step2 all rows already settled");
    assert(s2.dotRowsRevealed === 0, "step2 dot rows start at 0");
    assert(s2.answer[2].highlight === true, "step2 highlights the per-row factor (4)");
  }

  const s3 = steps[3];
  assert(s3.kind === "arrayBuild", "step3 arrayBuild kind");
  if (s3.kind === "arrayBuild") {
    assert(s3.dotRowsRevealed === 3, "step3 all dot rows filled, settled");
    assert(s3.equationDisplay === "fadeOut", "step3 equation fades out");
    assert(s3.outline === "draw", "step3 outline draws in");
    assert(s3.caption?.some((f) => f.text.includes("array")) ?? false, "step3 caption names the array");
  }

  const rowDefStep = steps[4];
  assert(rowDefStep.kind === "arrayBuild", "step4 is arrayBuild kind");
  if (rowDefStep.kind === "arrayBuild") {
    assert(rowDefStep.equationDisplay === "hidden", "step4 equation hidden while naming parts");
    assert(rowDefStep.outline === "shown", "step4 outline already drawn, no animation");
    assert(rowDefStep.highlightLine?.type === "row" && rowDefStep.highlightLine.index === 0, "step4 highlights row 0");
    assert(rowDefStep.countReveal == null, "step4 (definition) has no counting-pointer animation");
    assert(textOf(rowDefStep.explanation).includes("side to side"), "step4 defines row direction");
  }

  const rowCountStep = steps[5];
  assert(rowCountStep.kind === "arrayBuild", "step5 is arrayBuild kind");
  if (rowCountStep.kind === "arrayBuild") {
    assert(rowCountStep.countReveal?.type === "row", "step5 has a row counting-pointer");
    assert(rowCountStep.countReveal?.labels.join(",") === "1,2,3", `step5 counts 1,2,3, got ${rowCountStep.countReveal?.labels.join(",")}`);
    assert(textOf(rowCountStep.explanation).includes("3 rows"), "step5 states 3 rows");
  }

  const colDefStep = steps[6];
  assert(colDefStep.kind === "arrayBuild", "step6 is arrayBuild kind");
  if (colDefStep.kind === "arrayBuild") {
    assert(colDefStep.highlightLine?.type === "column" && colDefStep.highlightLine.index === 0, "step6 highlights column 0");
    assert(colDefStep.countReveal == null, "step6 (definition) has no counting-pointer animation");
    assert(textOf(colDefStep.explanation).includes("up and down"), "step6 defines column direction");
  }

  const colCountStep = steps[7];
  assert(colCountStep.kind === "arrayBuild", "step7 is arrayBuild kind");
  if (colCountStep.kind === "arrayBuild") {
    assert(colCountStep.countReveal?.type === "column", "step7 has a column counting-pointer");
    assert(colCountStep.countReveal?.labels.join(",") === "1,2,3,4", `step7 counts 1,2,3,4, got ${colCountStep.countReveal?.labels.join(",")}`);
    assert(textOf(colCountStep.explanation).includes("4 columns"), "step7 states 4 columns");
  }

  const questionStep = steps[8];
  assert(questionStep.kind === "arrayBuild" && questionStep.question?.id === "arrayBuild-total-guess", "step8 asks for the total");
  if (questionStep.kind === "arrayBuild") {
    assert(questionStep.equationDisplay === "visible", "step8 equation returns");
    assert(questionStep.outline === "shown", "step8 outline stays drawn");
    assert(questionStep.answer.some((p) => p.kind === "ph"), "step8 total still hidden while asking");
    assert(questionStep.question?.correctValue === "12", "step8 correct answer is 12");
  }

  const revealStep = steps[9];
  assert(revealStep.kind === "arrayBuild", "step9 reveal");
  if (revealStep.kind === "arrayBuild") {
    assert(revealStep.countReveal?.type === "row", "step9 skip-counts by row");
    assert(revealStep.countReveal?.labels.join(",") === "4,8,12", `step9 skip-counts 4,8,12, got ${revealStep.countReveal?.labels.join(",")}`);
    assert(revealStep.answer.some((p) => p.kind === "new"), "step9 answer data carries the revealed total (AnswerCard shows it immediately)");
  }
  assert(revealStep.feedback?.questionId === "arrayBuild-total-guess", "step9 carries feedback for the guess");

  const finalStep = steps[10];
  assert(finalStep.kind === "arrayBuild" && finalStep.done === true, "step10 final done");
  if (finalStep.kind === "arrayBuild") {
    assert(finalStep.rows === 3 && finalStep.cols === 4, "final array rows=3 cols=4");
    assert(finalStep.highlightLine == null, "final array step has no leftover highlight");
    assert(textOf(finalStep.explanation).includes("12"), "final explanation mentions 12");
  }

  assert(!steps.some((s) => s.kind === "groups" || s.kind === "groupsToArray" || s.kind === "array"), "redesigned arrays never touches the old groups/array step kinds");

  const bigSteps = concept.generate(5, 10);
  assert(bigSteps.length === 11, "arrayBuild step count is fixed regardless of factor size");
}

// --- Stage2: "Repeated Addition" concept (labeled "Repeated Addition" in the UI, id kept as
// "equationGroups" internally - it replaced the retired plain groups-based flow), 3 groups of 4 ---
{
  const concept = STAGE2_CONFIG.concepts.find((c) => c.id === "equationGroups")!;
  assert(concept.label === "Repeated Addition", "equationGroups concept now labeled Repeated Addition");
  const steps = concept.generate(3, 4);
  assert(steps.length === 8, `equationGroups 3x4 step count 8, got ${steps.length}`);

  const s0 = steps[0];
  assert(s0.kind === "boxGroups" && s0.groupsRevealed === 0, "step0 equation only, no containers yet");
  if (s0.kind === "boxGroups") {
    assert(!s0.showPlus, "step0 no plus symbols yet");
    assert(s0.equationDisplay === "visible", "step0 in-workspace equation visible");
    assert(s0.answer.every((p) => !p.highlight), "step0 no factor highlighted");
    assert(s0.answer.some((p) => p.kind === "ph"), "step0 total hidden");
  }

  const s1 = steps[1];
  assert(s1.kind === "boxGroups" && s1.groupReveal !== null, "step1 containers reveal one at a time");
  if (s1.kind === "boxGroups") {
    assert(s1.groupsRevealed === 0, "step1 containers start unrevealed");
    assert(s1.dotsRevealed === 0, "step1 no dots yet");
    assert(s1.equationDisplay === "visible", "step1 in-workspace equation still visible");
    assert(s1.answer[0].highlight === true, "step1 highlights the groups factor (3)");
    assert(!s1.answer[2].highlight, "step1 does not highlight the per-group factor");
  }

  const s2 = steps[2];
  assert(s2.kind === "boxGroups" && s2.dotReveal !== null, "step2 fills dots via a reveal animation");
  if (s2.kind === "boxGroups") {
    assert(s2.groupsRevealed === 3, "step2 all containers already settled");
    assert(s2.groupReveal === null, "step2 no more container-reveal animation");
    assert(s2.dotsRevealed === 0, "step2 dots start at 0, filling container by container");
    assert(s2.equationDisplay === "visible", "step2 in-workspace equation stays visible for the whole dot-fill step");
    assert(s2.answer[2].highlight === true, "step2 highlights the per-group factor (4)");
    assert(!s2.answer[0].highlight, "step2 no longer highlights the groups factor");
  }

  // From here on (the "+" appearing between containers), the in-workspace equation stays hidden
  // and the sequence mirrors generateRepeatedAdditionSteps' post-groups steps beat for beat.
  const s3 = steps[3];
  assert(s3.kind === "boxGroups", "step3 boxGroups kind");
  if (s3.kind === "boxGroups") {
    assert(s3.dotsRevealed === 12, "step3 all dots filled, settled");
    assert(s3.showPlus === true, "step3 plus symbols now shown between containers");
    assert(s3.equationDisplay === "fadeOut", "step3 in-workspace equation fades out right at the start of this step");
    assert(s3.answer.some((p) => p.kind === "ph"), "step3 AnswerCard total still hidden (that copy never fades)");
    assert(s3.calloutAddition?.total === null, "step3 addition callout set up with hidden total, like repeatedAddition's addup-setup step");
    assert(s3.calloutAddition?.terms.join(",") === "4,4,4", "step3 callout terms 4,4,4");
    assert(!s3.question, "step3 no question yet (setup only)");
  }

  const s4 = steps[4];
  assert(s4.kind === "boxGroups" && s4.question?.id === "equationGroups-sum-guess", "step4 asks for the sum");
  assert(s4.question?.correctValue === "12", "step4 correct answer is 12");
  assert(textOf(s4.explanation).includes("4 + 4 + 4"), "step4 question posed as the addition expression");
  if (s4.kind === "boxGroups") {
    assert(s4.showPlus === true, "step4 plus symbols still shown while asking");
    assert(s4.equationDisplay === "hidden", "step4 in-workspace equation still hidden");
    assert(s4.calloutAddition?.total === null, "step4 same hidden-total callout shown while the question is live");
  }

  const s5 = steps[5];
  assert(s5.kind === "boxGroups" && s5.calloutAddition !== null, "step5 reveals repeated addition");
  if (s5.kind === "boxGroups" && s5.calloutAddition) {
    assert(s5.calloutAddition.total === 12, "step5 repeated addition totals 12");
    assert(s5.calloutAddition.terms.join(",") === "4,4,4", "step5 terms 4,4,4");
    assert(s5.calloutMul === null, "step5 no multiplication callout yet");
    assert(s5.containerCountReveal?.labels.join(",") === "4,8,12", `step5 skip-counts containers by 4s: 4,8,12, got ${s5.containerCountReveal?.labels.join(",")}`);
  }
  assert(s5.feedback?.questionId === "equationGroups-sum-guess", "step5 carries feedback for the guess");
  assert((s5.feedback?.feedbackDelayMs ?? 0) > 1000, "step5 feedback delayed to match the container skip-count animation");

  const s6 = steps[6];
  assert(s6.kind === "boxGroups", "step6 boxGroups kind");
  if (s6.kind === "boxGroups") {
    assert(s6.calloutAddition === null, "step6 addition callout steps aside for the multiplication reveal");
    assert(s6.calloutMul?.total === 12, "step6 multiplication callout shows the total, like repeatedAddition's calloutMul");
    assert(s6.equationDisplay === "hidden", "step6 in-workspace equation still hidden - calloutMul carries the reveal instead");
    assert(s6.answer.some((p) => p.kind === "new"), "step6 AnswerCard multiplication total now revealed");
    assert(s6.answer.every((p) => !p.highlight), "step6 no factor highlighted anymore");
    assert(textOf(s6.explanation).includes("faster way to add"), "step6 explanation matches repeatedAddition's mul-shortcut wording");
  }

  assert(steps[7].done === true, "equationGroups last step done");

  const bigSteps = concept.generate(5, 10);
  assert(bigSteps.length === 8, "equationGroups step count is fixed regardless of factor size");
}

// --- Stage3: commutative 3x4 (interactive: two predict-then-reveal count beats plus a
// rotate-prediction question around the rotation) ---
{
  const concept = STAGE3_CONFIG.concepts.find((c) => c.id === "commutative")!;
  const steps = concept.generate(3, 4);
  assert(steps.length === 8, `commutative step count 8, got ${steps.length}`);

  assert(steps[0].kind === "array" && steps[0].rows === 3 && steps[0].cols === 4, "step0 array 3x4");
  assert(steps[0].answer.some((p) => p.kind === "ph"), "step0 total still hidden");

  const q1 = steps[1];
  assert(q1.kind === "array" && q1.question?.id === "commutative-count-1", "step1 asks the first count question");
  if (q1.kind === "array" && q1.question) {
    assert(q1.question.correctValue === "12", "step1 correct answer is 12");
    assert(q1.question.options.some((o) => o.value === "12"), "step1 options include the correct value");
  }

  const reveal1 = steps[2];
  assert(reveal1.kind === "array" && reveal1.countReveal?.labels.join(",") === "4,8,12", "step2 skip-counts 4,8,12");
  assert(reveal1.answer.some((p) => p.kind === "new"), "step2 reveals the total");

  const q2 = steps[3];
  assert(q2.kind === "array" && q2.question?.id === "commutative-rotate-predict", "step3 asks the rotate-predict question");
  if (q2.kind === "array" && q2.question) {
    assert(q2.question.options.map((o) => o.value).join(",") === "yes,no", "step3 offers yes/no options");
    assert(q2.question.correctValue === "yes", "step3 correct answer is yes");
  }

  const rotateStep = steps[4];
  assert(rotateStep.kind === "compare", "step4 is compare");
  if (rotateStep.kind === "compare") {
    assert(rotateStep.right.rows === 4 && rotateStep.right.cols === 3, "step4 right rotated to 4x3");
    assert(
      rotateStep.right.rotateFrom?.rows === 3 && rotateStep.right.rotateFrom?.cols === 4,
      "step4 right rotateFrom is the original 3x4 (fades in, then rotates)",
    );
    assert(!rotateStep.left.dimmed, "step4 left not dimmed yet");
  }

  const q3 = steps[5];
  assert(q3.kind === "compare" && q3.question?.id === "commutative-count-2", "step5 asks the second count question");
  if (q3.kind === "compare") {
    assert(q3.left.dimmed === true, "step5 dims the original array to focus on the rotated one");
    assert(q3.right.rotateFrom == null, "step5 right no longer replays the rotate");
  }

  const reveal2 = steps[6];
  assert(reveal2.kind === "compare", "step6 compare");
  if (reveal2.kind === "compare") {
    assert(reveal2.left.dimmed === true, "step6 keeps the original dimmed during the second count");
    assert(reveal2.right.countReveal?.labels.join(",") === "3,6,9,12", "step6 skip-counts 3,6,9,12");
    assert(reveal2.feedback?.questionId === "commutative-count-2", "step6 carries feedback for the second question");
  }

  const finalStep = steps[7];
  assert(finalStep.done === true, "commutative last step done");
  if (finalStep.kind === "compare") {
    assert(!finalStep.left.dimmed, "final step undims the original array");
  }
}

// --- Stage3: distributive 4x7 (7 > 5, splitFactor takes the >5 branch; each part predicted on
// its own with the other side dimmed, then the total predicted too) ---
{
  const concept = STAGE3_CONFIG.concepts.find((c) => c.id === "distributive")!;
  const steps = concept.generate(4, 7);
  assert(steps.length === 9, `distributive step count 9, got ${steps.length}`);

  const introStep = steps[0];
  assert(introStep.kind === "array", "step0 is array kind");
  if (introStep.kind === "array") {
    assert(textOf(introStep.caption).replace(/\s+/g, "") === "4×7", `step0 caption uses × format, got ${textOf(introStep.caption)}`);
  }

  const splitStep = steps[1];
  assert(splitStep.kind === "array", "step1 is array kind");
  if (splitStep.kind === "array") {
    assert(splitStep.splitInteractive?.default === 5, `split defaults to 5 (7>5 branch), got ${splitStep.splitInteractive?.default}`);
    assert(splitStep.splitInteractive?.min === 1 && splitStep.splitInteractive?.max === 6, "split range is [1, b-1]");
    assert(textOf(splitStep.caption) === "Split the dots", `step1 caption simplified, got "${textOf(splitStep.caption)}"`);
  }

  const q1 = steps[2];
  assert(q1.kind === "compare" && q1.question?.id === "distributive-part1", "step2 asks about the first part");
  if (q1.kind === "compare") {
    assert(q1.left.cols === 5 && q1.right.cols === 2, "split 7 -> 5 + 2");
    assert(q1.right.allColor === "split-b", "right side colored split-b");
    assert(q1.right.dimmed === true, "step2 dims the second part while asking about the first");
    assert(q1.question?.correctValue === "20", "step2 correct answer is 20 (4x5)");
  }

  const reveal1 = steps[3];
  assert(reveal1.kind === "compare", "step3 compare");
  if (reveal1.kind === "compare") {
    assert(textOf(reveal1.left.caption).includes("20"), "step3 reveals 4x5=20 on the left");
    assert(reveal1.right.dimmed === true, "step3 keeps the second part dimmed");
    assert(reveal1.left.countReveal?.type === "row", "step3 skip-counts the left (part1) rows to validate the guess");
    assert(reveal1.left.countReveal?.labels.join(",") === "5,10,15,20", `step3 skip-counts 5,10,15,20, got ${reveal1.left.countReveal?.labels.join(",")}`);
    assert((reveal1.feedback?.feedbackDelayMs ?? 0) > 1000, "step3 feedback delayed to match the skip-count animation");
  }

  const q2 = steps[4];
  assert(q2.kind === "compare" && q2.question?.id === "distributive-part2", "step4 asks about the second part");
  if (q2.kind === "compare") {
    assert(q2.left.dimmed === true, "step4 dims the first part instead");
    assert(!q2.right.dimmed, "step4 second part now in focus");
    assert(q2.question?.correctValue === "8", "step4 correct answer is 8 (4x2)");
  }

  const reveal2 = steps[5];
  assert(reveal2.kind === "compare", "step5 compare");
  if (reveal2.kind === "compare") {
    assert(!reveal2.left.dimmed && !reveal2.right.dimmed, "step5 both parts back to full focus");
    assert(textOf(reveal2.right.caption).includes("8"), "step5 reveals 4x2=8 on the right");
    assert(reveal2.right.countReveal?.type === "row", "step5 skip-counts the right (part2) rows to validate the guess");
    assert(reveal2.right.countReveal?.labels.join(",") === "2,4,6,8", `step5 skip-counts 2,4,6,8, got ${reveal2.right.countReveal?.labels.join(",")}`);
    assert((reveal2.feedback?.feedbackDelayMs ?? 0) > 1000, "step5 feedback delayed to match the skip-count animation");
  }

  const q3 = steps[6];
  assert(q3.kind === "compare" && q3.question?.id === "distributive-total", "step6 asks for the total");
  if (q3.kind === "compare") {
    assert(q3.calloutAddition == null, "step6 total not yet revealed");
    assert(q3.question?.correctValue === "28", "step6 correct answer is 28");
    assert(q3.showPlusBetween === true, "step6 shows a plus symbol between the split panels");
  }

  const revealTotal = steps[7];
  assert(revealTotal.kind === "compare" && revealTotal.calloutAddition !== null, "step7 addition callout present");
  if (revealTotal.kind === "compare" && revealTotal.calloutAddition) {
    assert(revealTotal.calloutAddition.total === 28, "4x7=28 addition callout total");
    assert(revealTotal.calloutAddition.terms.join(",") === "20,8", "parts 4x5=20, 4x2=8");
    assert(revealTotal.left.countReveal == null && revealTotal.right.countReveal == null, "step7 (addition reveal) has no skip-count validation, unlike parts 1/2");
  }
  assert(steps[8].done === true, "distributive last step done");

  // even split branch: b=4 (<=5 -> ceil(4/2)=2,[2,2])
  const evenSteps = concept.generate(3, 4);
  const evenQ1 = evenSteps[2];
  if (evenQ1.kind === "compare") {
    assert(evenQ1.left.cols === 2 && evenQ1.right.cols === 2, "b=4 splits evenly into 2+2");
  }

  // A confirmed splitChoice (via SplitSlider -> SET_SPLIT) overrides the auto split everywhere
  // downstream - here 4x7 split at 3 instead of the auto default of 5.
  const chosenSteps = concept.generate(4, 7, 3);
  const chosenSplitStep = chosenSteps[1];
  if (chosenSplitStep.kind === "array") {
    assert(chosenSplitStep.splitInteractive?.default === 3, "splitChoice=3 becomes the slider's default");
  }
  const chosenQ1 = chosenSteps[2];
  if (chosenQ1.kind === "compare") {
    assert(chosenQ1.left.cols === 3 && chosenQ1.right.cols === 4, "splitChoice=3 splits 7 into 3+4");
    assert(chosenQ1.question?.correctValue === "12", "splitChoice=3 part1 is 4x3=12");
  }

  // An out-of-range splitChoice (stale from a different b) clamps into [1, b-1] instead of
  // producing an empty or negative part.
  const clampedSteps = concept.generate(2, 4, 99);
  const clampedSplitStep = clampedSteps[1];
  if (clampedSplitStep.kind === "array") {
    assert(clampedSplitStep.splitInteractive?.default === 3, `splitChoice=99 clamps to b-1=3, got ${clampedSplitStep.splitInteractive?.default}`);
  }
}

// --- Stage3: placeValue (multiply by 10), a=6. Fixed shape regardless of factor size now: only
// the first one migrates individually, then a tens-count question, then the rest migrate as one
// batch. ---
{
  const concept = STAGE3_CONFIG.concepts.find((c) => c.id === "placeValue")!;
  assert(concept.lockFactorB === true, "placeValue locks factor B");
  assert(STAGE3_CONFIG.validate(6, 4, concept) !== null, "placeValue rejects factor B != 10");
  assert(STAGE3_CONFIG.validate(6, 10, concept) === null, "placeValue accepts factor B == 10");

  const steps = concept.generate(6, 10);
  // start + demo + first-dot migrate + tens-guess question + batch migrate + settled + done = 7
  assert(steps.length === 7, `placeValue a=6 step count 7, got ${steps.length}`);

  const s0 = steps[0];
  assert(s0.kind === "placeValue" && s0.onesCount === 6 && s0.tensCount === 0, "step0 6 ones, 0 tens");

  const s1 = steps[1];
  assert(s1.kind === "placeValue" && s1.demo === true, "step1 is the demo/callout step");
  if (s1.kind === "placeValue") assert(s1.migrate === null, "step1 (callout) runs no migration animation yet");

  const s2 = steps[2];
  assert(s2.kind === "placeValue", "step2 is the first individual migration");
  if (s2.kind === "placeValue") {
    assert(s2.tensCount === 0 && s2.onesCount === 6, "step2 pre-migration counts 0 tens / 6 ones");
    assert(
      s2.migrate?.moveCount === 1 && s2.migrate?.tensCountAfter === 1 && s2.migrate?.onesCountAfter === 5,
      "step2 migrates exactly the first one",
    );
  }

  const q = steps[3];
  assert(q.kind === "placeValue" && q.question?.id === "placevalue-tens-guess", "step3 asks how many tens in total");
  if (q.kind === "placeValue") {
    assert(q.tensCount === 1 && q.onesCount === 5 && q.migrate === null, "step3 holds the settled 1-ten state, no animation");
    assert(q.question?.correctValue === "6", "step3 correct answer is 6 tens");
  }

  const batchStep = steps[4];
  assert(batchStep.kind === "placeValue", "step4 is the batch migration");
  if (batchStep.kind === "placeValue") {
    assert(batchStep.tensCount === 1 && batchStep.onesCount === 5, "step4 pre-batch counts 1 ten / 5 ones");
    assert(batchStep.migrate?.moveCount === 5, "step4 batches the remaining 5 ones together");
    assert(batchStep.migrate?.tensCountAfter === 6 && batchStep.migrate?.onesCountAfter === 0, "step4 batch target 6 tens / 0 ones");
  }

  const settled = steps[5];
  assert(settled.kind === "placeValue" && settled.tensCount === 6 && settled.onesCount === 0 && settled.migrate === null, "step5 settled 6 tens, 0 ones, no migration");
  assert(textOf(settled.explanation).includes("60"), "step5 explanation mentions 60");
  assert(steps[6].done === true, "placeValue last step done");
}

// --- Stage3: placeValue, a=2 (smallest allowed factor - confirms the flow is fixed-shape) ---
{
  const concept = STAGE3_CONFIG.concepts.find((c) => c.id === "placeValue")!;
  const steps = concept.generate(2, 10);
  assert(steps.length === 7, `placeValue a=2 step count 7 (same fixed shape as a=6), got ${steps.length}`);
  const batchStep = steps[4];
  assert(batchStep.kind === "placeValue" && batchStep.migrate?.moveCount === 1, "a=2's batch step still just moves the one remaining one");
  const settled = steps[5];
  assert(settled.kind === "placeValue" && settled.tensCount === 2 && settled.onesCount === 0, "a=2 settles at 2 tens, 0 ones");
  assert(steps[6].done === true, "a=2 last step done");
}

// --- Stage3: arrayMultiply (2-digit x 1-digit, array method), 23 x 4 = 92 ---
{
  const concept = STAGE3_CONFIG.concepts.find((c) => c.id === "regroupMultiply")!;
  assert(concept.label === "Regroup and Multiply", "arrayMultiply concept labeled correctly");
  assert(concept.factorAMin === 10 && concept.factorAMax === 99, "arrayMultiply overrides factorA to a 2-digit range");
  assert(concept.factorBMin === 2 && concept.factorBMax === 9, "arrayMultiply overrides factorB range");
  assert(concept.defaultFactorA === 23 && concept.defaultFactorB === 4, "arrayMultiply has its own 2-digit defaults");

  // Per-concept ranges are respected by validateStage3, distinct from every other Stage 3 concept.
  assert(STAGE3_CONFIG.validate(23, 4, concept) === null, "23x4 valid for arrayMultiply");
  assert(STAGE3_CONFIG.validate(3, 4, concept) !== null, "single-digit factorA rejected for arrayMultiply");
  assert(STAGE3_CONFIG.validate(23, 10, concept) !== null, "factorB=10 rejected for arrayMultiply (single-digit only)");
  const commutative = STAGE3_CONFIG.concepts.find((c) => c.id === "commutative")!;
  assert(STAGE3_CONFIG.validate(23, 4, commutative) !== null, "23 is out of range for every other Stage 3 concept");

  const steps = concept.generate(23, 4);
  assert(steps.length === 19, `arrayMultiply 23x4 step count 19, got ${steps.length}`);

  const s0 = steps[0];
  assert(s0.kind === "arrayMultiply" && s0.tens === 2 && s0.ones === 3 && s0.factor === 4, "step0 decomposes 23 into 2 tens, 3 ones");
  if (s0.kind === "arrayMultiply") {
    assert(s0.panelDocked === false, "step0 (intro) panel is full width, workspace hidden");
    assert(s0.highlightPhase === null && s0.rows === 0, "step0 nothing highlighted, no array yet");
  }

  const s1 = steps[1];
  assert(s1.kind === "arrayMultiply", "step1 focuses the ones phase before docking");
  if (s1.kind === "arrayMultiply") {
    assert(s1.panelDocked === false, "step1 still full width - highlight comes before the resize");
    assert(s1.highlightPhase === "ones" && s1.highlightNumber === true && s1.highlightFactor === true, "step1 highlights both the ones digit and the factor together");
  }

  const s2 = steps[2];
  assert(s2.kind === "arrayMultiply", "step2 docks and shows the ones equation");
  if (s2.kind === "arrayMultiply") {
    assert(s2.panelDocked === true, "step2 docks the panel and reveals the workspace");
    assert(s2.highlightPhase === "ones" && s2.highlightNumber === true && s2.highlightFactor === true, "step2 keeps both highlighted while the equation appears");
    assert(s2.rows === 0, "step2 shows the bare equation, no array yet");
  }
  assert(s2.answer.some((p) => p.highlight), "step2 equation highlights both factors (3 x 4)");

  const s3 = steps[3];
  assert(s3.kind === "arrayMultiply", "step3 reveals ones rows");
  if (s3.kind === "arrayMultiply") {
    assert(s3.highlightNumber === true && s3.highlightFactor === false, "step3 highlights the ones digit alone while rows build");
    assert(s3.rows === 3 && s3.cols === 4 && s3.usePacks === false, "step3 sets up a 3x4 dot array");
    assert(s3.rowReveal !== null && s3.dotRowReveal === null, "step3 rows fade in, no dots yet");
  }
  assert(
    s3.answer[0].highlight === true && s3.answer[2].highlight === false,
    "step3 equation highlights only the ones digit (3), not the factor, matching the rows visual",
  );

  const s4 = steps[4];
  assert(s4.kind === "arrayMultiply", "step4 reveals ones dots");
  if (s4.kind === "arrayMultiply") {
    assert(s4.highlightNumber === false && s4.highlightFactor === true, "step4 highlights the factor alone while dots fill in");
    assert(s4.rowsRevealed === 3 && s4.dotRowReveal !== null, "step4 rows already up, dots now fade in per row");
  }
  assert(
    s4.answer[0].highlight === false && s4.answer[2].highlight === true,
    "step4 equation highlights only the factor (4), not the row-count digit, matching the dots visual",
  );

  const s5 = steps[5];
  assert(s5.kind === "arrayMultiply" && s5.question?.id === "arrayMultiply-ones-guess", "step5 asks for the ones dot total");
  assert(s5.question?.correctValue === "12", "step5 correct answer is 3x4=12");
  if (s5.kind === "arrayMultiply") {
    assert(s5.highlightNumber === true && s5.highlightFactor === true, "step5 highlights both again for the question");
    assert(s5.rowsRevealed === 3 && s5.dotRowsRevealed === 3, "step5 full array already built");
  }

  const s6 = steps[6];
  assert(s6.kind === "arrayMultiply", "step6 reveals the ones product");
  if (s6.kind === "arrayMultiply") {
    assert(s6.onesPartialRevealed === true, "step6 writes the ones partial (12) into the panel");
    assert(s6.countReveal !== null, "step6 skip-counts the dots before feedback lands");
  }
  assert(s6.feedback?.questionId === "arrayMultiply-ones-guess", "step6 carries feedback for the ones guess");
  assert((s6.feedback?.feedbackDelayMs ?? 0) > 500, "step6 feedback delayed to match the skip-count");
  assert(s6.answer.some((p) => p.kind === "new" && p.text === "12"), "step6 equation reveals 3 x 4 = 12");

  const s7 = steps[7];
  assert(s7.kind === "arrayMultiply", "step7 focuses the tens phase before docking");
  if (s7.kind === "arrayMultiply") {
    assert(s7.panelDocked === false, "step7 undocks again to highlight the tens digit + factor first");
    assert(s7.highlightPhase === "tens" && s7.highlightNumber === true && s7.highlightFactor === true, "step7 highlights both together");
    assert(s7.onesPartialRevealed === true, "step7 keeps the ones partial visible in the panel");
  }

  const s8 = steps[8];
  assert(s8.kind === "arrayMultiply", "step8 docks and shows the tens equation");
  if (s8.kind === "arrayMultiply") {
    assert(s8.panelDocked === true, "step8 docks the panel again");
    assert(s8.rows === 0, "step8 shows the bare tens equation, no array yet");
  }

  const s9 = steps[9];
  assert(s9.kind === "arrayMultiply", "step9 reveals tens rows");
  if (s9.kind === "arrayMultiply") {
    assert(s9.highlightNumber === true && s9.highlightFactor === false, "step9 highlights the tens digit alone");
    assert(s9.rows === 2 && s9.cols === 4 && s9.usePacks === true, "step9 sets up a 2x4 ten-pack array");
    assert(s9.rowReveal !== null, "step9 ten-pack rows fade in");
  }

  const s10 = steps[10];
  assert(s10.kind === "arrayMultiply", "step10 reveals tens dots (packs)");
  if (s10.kind === "arrayMultiply") {
    assert(s10.highlightNumber === false && s10.highlightFactor === true, "step10 highlights the factor alone");
    assert(s10.rowsRevealed === 2 && s10.dotRowReveal !== null, "step10 packs fade in per row");
  }

  const s11 = steps[11];
  assert(s11.kind === "arrayMultiply" && s11.question?.id === "arrayMultiply-tens-guess", "step11 asks for the ten-pack total");
  assert(s11.question?.correctValue === "8", "step11 correct answer is 2x4=8 packs");

  const s12 = steps[12];
  assert(s12.kind === "arrayMultiply", "step12 reveals the tens product");
  if (s12.kind === "arrayMultiply") assert(s12.tensPartialRevealed === true, "step12 writes the tens partial (80) into the panel");
  assert(s12.feedback?.questionId === "arrayMultiply-tens-guess", "step12 carries feedback for the tens guess");
  assert(textOf(s12.explanation).includes("80"), "step12 explains 8 tens is 80");

  const s13 = steps[13];
  assert(s13.kind === "arrayMultiply", "step13 introduces adding the two partials");
  if (s13.kind === "arrayMultiply") {
    assert(s13.panelDocked === false, "step13 undocks a third time before the addition begins");
    assert(s13.partialHighlight === "both", "step13 highlights both partial-product rows in the panel");
  }
  assert(textOf(s13.explanation).includes("12") && textOf(s13.explanation).includes("80"), "step13 says we'll add 12 and 80");

  const s14 = steps[14];
  assert(s14.kind === "arrayMultiply", "step14 shows the ones-partial breakdown");
  if (s14.kind === "arrayMultiply") {
    assert(s14.panelDocked === true, "step14 docks again to show the breakdown");
    assert(s14.partialHighlight === "ones", "step14 highlights just the 12 row");
    assert(s14.onesBreakdownShown === true && s14.tensBreakdownShown === false, "step14 shows only the ones-partial breakdown so far");
    assert(s14.panelHiddenMobile === true, "step14 hides the panel on mobile - the breakdown needs the full width");
  }
  assert(textOf(s14.explanation).includes("1 ten") && textOf(s14.explanation).includes("2 ones"), "step14 explains 12 is 1 ten and 2 ones");

  const s15 = steps[15];
  assert(s15.kind === "arrayMultiply", "step15 adds the tens-partial breakdown");
  if (s15.kind === "arrayMultiply") {
    assert(s15.partialHighlight === "tens", "step15 highlights just the +80 row");
    assert(s15.onesBreakdownShown === true && s15.tensBreakdownShown === true, "step15 shows both breakdowns together");
    assert(s15.panelHiddenMobile === true, "step15 keeps the panel hidden on mobile");
  }
  assert(textOf(s15.explanation).includes("8 tens"), "step15 explains 80 is 8 tens and 0 ones");

  const s16 = steps[16];
  assert(s16.kind === "arrayMultiply" && s16.question?.id === "arrayMultiply-total-guess", "step16 asks for the final total");
  assert(s16.question?.correctValue === "92", "step16 correct answer is 23x4=92");
  if (s16.kind === "arrayMultiply") {
    assert(s16.onesBreakdownShown === true && s16.tensBreakdownShown === true, "step16 keeps both breakdowns on screen while asking");
    assert(s16.panelHiddenMobile === true, "step16 hides the numeric panel on mobile so the question gets full width");
  }

  const s17 = steps[17];
  assert(s17.kind === "arrayMultiply", "step17 reveals the total");
  if (s17.kind === "arrayMultiply") {
    assert(s17.totalRevealed === true, "step17 writes 92 into the panel");
    assert(s17.panelHiddenMobile === true, "step17 keeps the panel hidden on mobile through the counting animation");
    assert(s17.countCombine === true, "step17 counts the pieces before the feedback lands");
  }
  assert(s17.answer.some((p) => p.kind === "new" && p.text === "92"), "step17 answer revealed as 92");
  assert(s17.feedback?.questionId === "arrayMultiply-total-guess", "step17 carries feedback for the total guess");
  // Counting 2 ones then 9 tens (1 from 12 + 8 from 80) takes real time - the feedback line
  // waits comfortably longer than a plain instant reveal would (contrast step6/step12's shorter
  // single-phase counts).
  assert((s17.feedback?.feedbackDelayMs ?? 0) > 3000, "step17 feedback delayed to match counting ones then tens");
  assert(textOf(s17.explanation).includes("92"), "step17 explanation states the total 92");

  const s18 = steps[18];
  assert(s18.done === true, "arrayMultiply last step done");
  if (s18.kind === "arrayMultiply") assert(s18.panelDocked === false, "step18 undocks one last time to finish on the panel alone");
  assert(textOf(s18.explanation).includes("92"), "done explanation mentions 92");

  // Every docked step from the ones-partial breakdown through the total reveal hides the panel
  // on mobile (panelHiddenMobile) - collect them for a single assertion instead of repeating it.
  const mobileHiddenSteps = [14, 15, 16, 17].map((i) => steps[i]);
  assert(
    mobileHiddenSteps.every((st) => st.kind === "arrayMultiply" && st.panelHiddenMobile === true),
    "steps 14-17 (breakdown through reveal) all hide the panel on mobile",
  );

  // A second case (32 x 3 = 96) to confirm the shape generalizes beyond the default.
  const steps2 = concept.generate(32, 3);
  assert(steps2.length === 19, "arrayMultiply step count is fixed regardless of factors");
  const t0 = steps2[0];
  assert(t0.kind === "arrayMultiply" && t0.tens === 3 && t0.ones === 2 && t0.factor === 3, "32 decomposes into 3 tens, 2 ones");
  const t18 = steps2[18];
  assert(textOf(t18.explanation).includes("96"), "32x3 = 96");

  // Edge case: a large enough total (25 x 9 = 225) that the combined tens count crosses 10 -
  // the view regroups those into a "hundred" mid-count (see ArrayMultiplyView's HundredBlock);
  // the generator itself just needs to size feedbackDelayMs for the longer count (22 tens units
  // instead of 9), not do any hundreds-specific math of its own.
  const stepsBig = concept.generate(25, 9);
  const bigReveal = stepsBig[17];
  if (bigReveal.kind === "arrayMultiply") {
    assert((bigReveal.feedback?.feedbackDelayMs ?? 0) > (s17.feedback?.feedbackDelayMs ?? 0), "25x9's longer combined count takes longer than 23x4's");
  }
  assert(textOf(stepsBig[18].explanation).includes("225"), "25x9 = 225");

  // Edge case: ones digit x factor lands exactly on a multiple of 10 (5 x 2 = 10), so the
  // ones-partial breakdown has 0 loose ones - confirm it's handled, not skipped.
  const steps3 = concept.generate(15, 2);
  const e14 = steps3[14];
  if (e14.kind === "arrayMultiply") {
    assert(e14.onesBreakdownShown === true, "15x2's ones-partial breakdown still shows");
  }
}

// --- Session reducer: RESTART / ADVANCE_STEP / GO_BACK clamping, concept switch ---
{
  let s = createSession(3, 4, STAGE2_CONFIG);
  assert(s.stepIdx === 0 && s.a === 3 && s.b === 4, "initial session");
  s = multiplicationReducer(s, { type: "ADVANCE_STEP" }, STAGE2_CONFIG);
  assert(s.stepIdx === 1, "advance to step 1");
  const lastIdx = getSteps(STAGE2_CONFIG, s).length - 1;
  for (let i = 0; i < 20; i++) s = multiplicationReducer(s, { type: "ADVANCE_STEP" }, STAGE2_CONFIG);
  assert(s.stepIdx === lastIdx, `advance clamps at last step ${lastIdx}, got ${s.stepIdx}`);
  for (let i = 0; i < 20; i++) s = multiplicationReducer(s, { type: "GO_BACK" }, STAGE2_CONFIG);
  assert(s.stepIdx === 0, "go back clamps at 0");

  let s3 = createSession(3, 4, STAGE3_CONFIG);
  s3 = multiplicationReducer(s3, { type: "RESTART", a: 6, b: 10, conceptId: "placeValue" }, STAGE3_CONFIG);
  assert(s3.conceptId === "placeValue" && s3.a === 6 && s3.b === 10 && s3.stepIdx === 0, "restart switches concept and resets step");
  assert(getSteps(STAGE3_CONFIG, s3).length === 7, "restart's steps reflect the new concept (placeValue a=6 = 7 steps)");

  let s4 = createSession(4, 7, STAGE3_CONFIG);
  s4 = multiplicationReducer(s4, { type: "RESTART", a: 4, b: 7, conceptId: "distributive" }, STAGE3_CONFIG);
  assert(s4.splitChoice === null, "fresh distributive session has no split choice yet");
  s4 = multiplicationReducer(s4, { type: "ADVANCE_STEP" }, STAGE3_CONFIG);
  const distSteps = getSteps(STAGE3_CONFIG, s4);
  assert(isAwaitingInteraction(distSteps[s4.stepIdx], s4) === true, "nav is blocked on the split step before Split is ever pressed");
  const beforeIdx = s4.stepIdx;
  s4 = multiplicationReducer(s4, { type: "SET_SPLIT", value: 3 }, STAGE3_CONFIG);
  assert(s4.splitChoice === 3, "SET_SPLIT stores the chosen value");
  assert(s4.stepIdx === beforeIdx + 1, "SET_SPLIT advances one step, like SELECT_ANSWER");
  s4 = multiplicationReducer(s4, { type: "GO_BACK" }, STAGE3_CONFIG);
  assert(s4.splitChoice === 3, "splitChoice survives GO_BACK, same as answers");
  assert(isAwaitingInteraction(getSteps(STAGE3_CONFIG, s4)[s4.stepIdx], s4) === false, "nav is no longer blocked once a split choice already exists, same as an already-answered question");
  s4 = multiplicationReducer(s4, { type: "RESTART", a: 4, b: 7, conceptId: "distributive" }, STAGE3_CONFIG);
  assert(s4.splitChoice === null, "RESTART clears splitChoice");
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
