import { STAGE2_CONFIG, STAGE3_CONFIG } from "../lib/compare-order/config";
import { generateSteps } from "../lib/compare-order/steps";
import { compareOrderReducer, createSession } from "../lib/compare-order/session";
import type { CompareOrderConfig } from "../lib/compare-order/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

/** Numeric ascending order with ties broken by original input position - matches the vanilla
 * algorithm's own tie-break (place-value digit comparison is equivalent to numeric comparison,
 * and fully-equal values fall back to origIndex). */
function expectedOrder(values: number[]): number[] {
  return values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v || a.i - b.i)
    .map((x) => x.v);
}

function runCase(config: CompareOrderConfig, values: number[], label: string) {
  const steps = generateSteps(values, config.places);
  const last = steps[steps.length - 1];
  assert(last.done && last.revealAnswer, `${label}: final step is done+revealAnswer`);
  const placedValues = last.placed.map((p) => p.value);
  assert(
    JSON.stringify(placedValues) === JSON.stringify(expectedOrder(values)),
    `${label}: placed order ${JSON.stringify(placedValues)} matches expected ${JSON.stringify(expectedOrder(values))}`,
  );
  assert(
    last.chainTokens !== null && last.chainTokens.length === values.length * 2 - 1,
    `${label}: chain has ${values.length} numbers and ${values.length - 1} symbols`,
  );
  // Every compare-phase step's pool+placed together still account for every original value
  // exactly once (intro-phase steps deliberately don't - numbers are still being introduced).
  steps
    .filter((s) => s.phase === "compare")
    .forEach((s, i) => {
      const all = [...s.pool.map((p) => p.value), ...s.placed.map((p) => p.value)].sort((a, b) => a - b);
      assert(
        JSON.stringify(all) === JSON.stringify(values.slice().sort((a, b) => a - b)),
        `${label}: compare step ${i} pool+placed accounts for all original values`,
      );
    });
  return last;
}

// --- Stage2: default values, all distinct, straightforward strict order ---
{
  const last = runCase(STAGE2_CONFIG, [21, 67, 49, 80], "stage2 defaults");
  const syms = last.chainTokens!.filter((t) => t.type === "sym").map((t) => t.text);
  assert(syms.every((s) => s === "<"), "stage2 defaults: all symbols are '<' (no ties)");
}

// --- Stage2: exact duplicate pair forces the "equal" branch and an origIndex tie-break ---
{
  const last = runCase(STAGE2_CONFIG, [30, 30, 50, 20], "stage2 duplicate pair");
  const syms = last.chainTokens!.filter((t) => t.type === "sym").map((t) => t.text);
  assert(JSON.stringify(syms) === JSON.stringify(["<", "=", "<"]), `stage2 duplicate pair: symbols ${JSON.stringify(syms)} === [<,=,<]`);
  const nums = last.chainTokens!.filter((t) => t.type === "num").map((t) => t.text);
  assert(JSON.stringify(nums) === JSON.stringify(["20", "30", "30", "50"]), `stage2 duplicate pair: chain ${JSON.stringify(nums)}`);
}

// --- Stage2: tens-tie resolved by ones (deeper-tie narration path) ---
{
  const steps = generateSteps([24, 21, 90, 15], STAGE2_CONFIG.places);
  const tieStep = steps.find((s) => s.tiedVals && s.tiedVals.length === 2 && s.hiPlace === "ones");
  assert(!!tieStep, "stage2 tens-tie: a deeper-tie step on 'ones' exists for 24 vs 21");
  assert(tieStep!.winnerVal === 21, "stage2 tens-tie: 21 wins the ones tie-break over 24");
}

// --- Stage3: default values, all distinct ---
{
  runCase(STAGE3_CONFIG, [214, 673, 489, 802], "stage3 defaults");
}

// --- Stage3: fully-equal triple plus one distinct, exercises 3-way "equal" tie ---
{
  const last = runCase(STAGE3_CONFIG, [300, 300, 300, 100], "stage3 triple tie");
  const syms = last.chainTokens!.filter((t) => t.type === "sym").map((t) => t.text);
  assert(JSON.stringify(syms) === JSON.stringify(["<", "=", "="]), `stage3 triple tie: symbols ${JSON.stringify(syms)} === [<,=,=]`);
}

// --- Stage3: hundreds-tie resolved down to ones (three-deep narration path) ---
{
  const steps = generateSteps([214, 213, 500, 100], STAGE3_CONFIG.places);
  const onesTie = steps.find((s) => s.hiPlace === "ones" && s.winnerVal !== null);
  assert(!!onesTie, "stage3 hundreds-tie: reaches a ones-place decision for 214 vs 213");
  assert(onesTie!.winnerVal === 213, "stage3 hundreds-tie: 213 wins on ones (4 vs 3)");
}

// --- Validation ---
{
  assert(STAGE2_CONFIG.validate([10, 99, 50, 20]) === null, "stage2 validate: in-range values pass");
  assert(STAGE2_CONFIG.validate([9, 20, 30, 40]) !== null, "stage2 validate: below-range value rejected");
  assert(STAGE2_CONFIG.validate([100, 20, 30, 40]) !== null, "stage2 validate: above-range value rejected");
  assert(STAGE3_CONFIG.validate([100, 999, 500, 200]) === null, "stage3 validate: in-range values pass");
  assert(STAGE3_CONFIG.validate([99, 200, 300, 400]) !== null, "stage3 validate: below-range value rejected");
  assert(STAGE3_CONFIG.validate([1000, 200, 300, 400]) !== null, "stage3 validate: above-range value rejected");
}

// --- Every decision step requires a tap with a value-free prompt and a real winner; the
// trivial "only one left" step never does (nothing to decide there). ---
{
  const steps = generateSteps([21, 67, 49, 80], STAGE2_CONFIG.places);
  const decisionSteps = steps.filter((s) => s.winnerVal !== null);
  assert(decisionSteps.length > 0, "decision steps: at least one exists");
  decisionSteps.forEach((s, i) => {
    if (s.pool.length === 1) {
      assert(!s.requiresTap, `decision step ${i} (only one left): does not require a tap`);
    } else {
      assert(s.requiresTap, `decision step ${i}: requires a tap`);
      assert(s.tapPrompt !== null && s.tapPrompt.length > 0, `decision step ${i}: has a tap prompt`);
      const promptText = s.tapPrompt!.map((f) => f.text).join("");
      assert(
        !promptText.includes(String(s.winnerVal)),
        `decision step ${i}: prompt "${promptText}" does not leak the winner value ${s.winnerVal}`,
      );
    }
  });
}

// --- Reducer: ADVANCE is blocked on an unanswered tap step, a correct TAP unblocks it, and a
// wrong TAP does not. ---
{
  const config = STAGE2_CONFIG;
  let s = createSession([21, 67, 49, 80], config);
  while (!s.steps[s.idx].requiresTap) {
    s = compareOrderReducer(s, { type: "ADVANCE" }, config);
  }
  const decisionStep = s.steps[s.idx];
  assert(decisionStep.requiresTap, "reducer: landed on a requiresTap step");
  const correctValue = decisionStep.winnerVal!;
  const wrongValue = decisionStep.pool.map((p) => p.value).find((v) => v !== correctValue)!;

  const idxBefore = s.idx;
  s = compareOrderReducer(s, { type: "TAP", value: wrongValue }, config);
  assert(s.tapStatus === "wrong" && s.wrongTapValue === wrongValue, "reducer: wrong tap recorded as wrong");
  s = compareOrderReducer(s, { type: "ADVANCE" }, config);
  assert(s.idx === idxBefore, "reducer: ADVANCE still blocked after a wrong tap");

  s = compareOrderReducer(s, { type: "TAP", value: correctValue }, config);
  assert(s.tapStatus === "correct" && s.wrongTapValue === null, "reducer: correct tap recorded as correct");
  s = compareOrderReducer(s, { type: "ADVANCE" }, config);
  assert(s.idx === idxBefore + 1, "reducer: ADVANCE proceeds after a correct tap");
  assert(s.tapStatus === "idle", "reducer: tapStatus resets to idle on the new step");

  // GO_BACK to the now-answered decision step must ask the question again, not leak the answer.
  s = compareOrderReducer(s, { type: "GO_BACK" }, config);
  assert(s.idx === idxBefore && s.tapStatus === "idle", "reducer: GO_BACK resets tapStatus to idle");
}

// --- Intro reveal sequence: exactly one step per number (its places stagger-reveal within that
// single step via CSS, not via separate steps), with earlier numbers staying fully present. ---
{
  const values = [21, 67, 49, 80];
  const steps = generateSteps(values, STAGE2_CONFIG.places);
  const introSteps = steps.filter((s) => s.phase === "intro");
  const compareSteps = steps.filter((s) => s.phase === "compare");
  assert(introSteps.length === values.length, "stage2 intro: exactly one step per number (4 steps)");
  assert(compareSteps.length === steps.length - introSteps.length, "stage2 intro: every other step is phase=compare");

  // Step 0 introduces number 1 alone; step 1 adds number 2 while number 1 stays in the pool.
  assert(introSteps[0].pool.length === 1 && introSteps[0].pool[0].value === 21, "stage2 intro step 0: only number 1 is present");
  assert(introSteps[0].focusOrigIndex === 0, "stage2 intro step 0: number 1 (origIndex 0) is in focus");
  assert(introSteps[1].pool.length === 2 && introSteps[1].pool[1].value === 67, "stage2 intro step 1: number 2 joins, number 1 still present");
  assert(introSteps[1].focusOrigIndex === 1, "stage2 intro step 1: number 2 (origIndex 1) is in focus, not number 1");
  assert(introSteps.every((s) => s.hiPlace === null), "stage2 intro: hiPlace is never set - the reveal is per-card via focusOrigIndex, not a shared column highlight");

  // By the end of the intro, all 4 numbers are present, matching the old opening compare step.
  const lastIntro = introSteps[introSteps.length - 1];
  assert(lastIntro.pool.length === 4, "stage2 intro: ends with all 4 numbers present");
  assert(compareSteps[0].pool.length === 4, "stage2 intro -> compare: first compare step has the full pool, matching the old opening step");

  // No intro step requires a tap or reveals the answer - purely narrated build-up.
  assert(introSteps.every((s) => !s.requiresTap && !s.done), "stage2 intro: no step requires a tap or is the done step");
}

// --- Intro reveal generalizes to stage3: still one step per number regardless of place count. ---
{
  const steps = generateSteps([214, 673, 489, 802], STAGE3_CONFIG.places);
  const introSteps = steps.filter((s) => s.phase === "intro");
  assert(introSteps.length === 4, "stage3 intro: exactly one step per number (4 steps), independent of the 3 places");
  assert(
    introSteps.every((s, i) => s.focusOrigIndex === i && s.pool.length === i + 1),
    "stage3 intro: each step focuses the next number and grows the pool by one",
  );
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
