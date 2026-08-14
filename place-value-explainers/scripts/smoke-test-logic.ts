import { STAGE2_CONFIG, STAGE3_CONFIG } from "../lib/place-value/config";
import { createSession, placeValueReducer, getSteps } from "../lib/place-value/session";
import { makeQuizOptions } from "../lib/place-value/quiz";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function textOf(fragments: { text: string }[]): string {
  return fragments.map((f) => f.text).join("");
}

// --- Stage2: 72 -> 7 tens, 2 ones ---
{
  const concept = STAGE2_CONFIG.concepts[0];
  assert(STAGE2_CONFIG.validate(72) === null, "stage2 72 valid");
  assert(STAGE2_CONFIG.validate(9) !== null, "stage2 below range rejected");
  assert(STAGE2_CONFIG.validate(100) !== null, "stage2 above range rejected");

  const steps = concept.generate(72);
  assert(steps.length === 6, `stage2 72 step count 6, got ${steps.length}`);

  assert(steps[0].kind === "unitsField" && steps[0].phase === "loose", "step0 loose units field");
  assert(steps[1].kind === "unitsField" && steps[1].phase === "counting", "step1 counting, one group highlighted");
  assert(steps[2].kind === "quizTens", "step2 is the tens quiz");
  if (steps[2].kind === "quizTens") assert(steps[2].tens === 7, "step2 correct tens is 7");
  assert(steps[3].kind === "quizOnes", "step3 is the ones quiz");
  if (steps[3].kind === "quizOnes") assert(steps[3].ones === 2, "step3 correct ones is 2");
  assert(steps[4].kind === "bundled" && steps[4].showDecompose && !steps[4].showExpanded && !steps[4].done, "step4 bundled, decompose callout, not done");
  assert(steps[5].kind === "bundled" && steps[5].showDecompose && steps[5].showExpanded && steps[5].done, "step5 bundled, expanded callout, done");
  if (steps[5].kind === "bundled") {
    assert(textOf(steps[5].explanation).includes("70 + 2 = 72"), "final step explanation shows the expanded equation");
  }
}

// --- Stage2: 80 -> 8 tens, 0 ones (zero-ones branch) ---
{
  const concept = STAGE2_CONFIG.concepts[0];
  const steps = concept.generate(80);
  const bundled = steps[4];
  assert(bundled.kind === "bundled" && bundled.ones === 0, "80 bundled has 0 ones");
}

// --- Stage3: 234 -> 2 hundreds, 3 tens, 4 ones ---
{
  const concept = STAGE3_CONFIG.concepts[0];
  assert(STAGE3_CONFIG.validate(234) === null, "stage3 234 valid");
  assert(STAGE3_CONFIG.validate(99) !== null, "stage3 below range rejected");
  assert(STAGE3_CONFIG.validate(1000) !== null, "stage3 above range rejected");

  const steps = concept.generate(234);
  assert(steps.length === 5, `stage3 234 step count 5, got ${steps.length}`);

  assert(steps[0].kind === "rodsOnes" && steps[0].phase === "loose", "step0 loose");
  if (steps[0].kind === "rodsOnes") assert(steps[0].totalTens === 23, "step0 totalTens 23 (234/10)");
  assert(steps[1].kind === "rodsOnes" && steps[1].phase === "highlight", "step1 highlights one hundred");
  assert(steps[2].kind === "quizHundreds", "step2 is the hundreds quiz");
  if (steps[2].kind === "quizHundreds") assert(steps[2].hundreds === 2, "step2 correct hundreds is 2");
  assert(steps[3].kind === "cards" && steps[3].revealAnswer && steps[3].showDecompose && !steps[3].showExpanded && !steps[3].done, "step3 cards, decompose only, not done");
  assert(steps[4].kind === "cards" && steps[4].showExpanded && steps[4].done, "step4 cards, expanded form added, done");
  if (steps[4].kind === "cards") {
    assert(textOf(steps[4].explanation).includes("200 + 30 + 4 = 234"), "final step explanation shows the expanded equation");
  }
}

// --- Stage3: 305 -> 3 hundreds, 0 tens, 5 ones (zero-tens branch) ---
{
  const concept = STAGE3_CONFIG.concepts[0];
  const steps = concept.generate(305);
  const cards = steps[3];
  assert(cards.kind === "cards" && cards.tens === 0, "305 has 0 tens");
}

// --- Session reducer: RESTART / ADVANCE_STEP / GO_BACK clamping ---
{
  let s = createSession(72, STAGE2_CONFIG);
  assert(s.stepIdx === 0 && s.n === 72, "initial session");
  s = placeValueReducer(s, { type: "ADVANCE_STEP" }, STAGE2_CONFIG);
  assert(s.stepIdx === 1, "advance to step 1");
  const lastIdx = getSteps(STAGE2_CONFIG, s).length - 1;
  for (let i = 0; i < 20; i++) s = placeValueReducer(s, { type: "ADVANCE_STEP" }, STAGE2_CONFIG);
  assert(s.stepIdx === lastIdx, `advance clamps at last step ${lastIdx}, got ${s.stepIdx}`);
  for (let i = 0; i < 20; i++) s = placeValueReducer(s, { type: "GO_BACK" }, STAGE2_CONFIG);
  assert(s.stepIdx === 0, "go back clamps at 0");

  let s3 = createSession(234, STAGE3_CONFIG);
  s3 = placeValueReducer(s3, { type: "RESTART", n: 500, conceptId: "placeValue" }, STAGE3_CONFIG);
  assert(s3.n === 500 && s3.stepIdx === 0, "restart resets n and step");
}

// --- Quiz option generation ---
{
  for (const correct of [0, 1, 2, 7, 9, 23]) {
    const opts = makeQuizOptions(correct);
    assert(opts.includes(correct), `options for ${correct} include the correct value`);
    assert(opts.length === new Set(opts).size, `options for ${correct} have no duplicates`);
    assert(opts.every((v) => v >= 0), `options for ${correct} are all non-negative`);
    assert(opts.length >= 1 && opts.length <= 3, `options for ${correct} has 1-3 entries, got ${opts.length}`);
  }
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
