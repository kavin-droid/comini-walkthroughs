import { STAGE2_CONFIG, STAGE3_CONFIG } from "../lib/rounding/config";
import { buildRoundingSteps, hopStartOf } from "../lib/rounding/steps";
import { createSession, roundingReducer } from "../lib/rounding/session";
import type { RoundingStep } from "../lib/rounding/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function last(steps: RoundingStep[]): RoundingStep {
  return steps[steps.length - 1];
}

// --- Stage2 (roundTo=10 fixed), numberMin/Max 10/99 ---
{
  const config = STAGE2_CONFIG;
  assert(config.roundToOptions.length === 1 && config.roundToOptions[0] === 10, "stage2 roundToOptions is [10] only");

  // exact: n=70
  {
    const steps = buildRoundingSteps(70, 10);
    assert(steps.length === 4, `stage2 exact n=70 has 4 steps, got ${steps.length}`);
    assert(steps[0].view === "split" && steps[1].view === "split", "steps 0-1 are split view");
    assert(steps[2].view === "line" && steps[2].isExact, "step 2 is the exact-case line view");
    const d = last(steps);
    assert(d.done && d.revealAnswer && d.rounded === 70, `exact n=70 rounds to 70, got ${d.rounded}`);
    assert(d.view === "line", "exact case ends on a line view (no closer/hop steps)");
  }

  // tie: n=75 -> rounds up to 80
  {
    const steps = buildRoundingSteps(75, 10);
    assert(steps.length === 8, `stage2 non-exact n=75 has 8 steps, got ${steps.length}`);
    assert(steps[2].placeTap === true, "step index 2 is the placeTap step");
    const closer = steps[6];
    assert(closer.view === "closer" && closer.isTie === true, "step 6 is the closer view and isTie");
    const d = last(steps);
    // closerSide is only null in the isExact path; a tie is not exact, so closerSide is still
    // computed from rounded===lower (here 'above', since a tie always rounds to upper).
    assert(d.rounded === 80 && d.closerSide === "above", `n=75 tie: rounded=80, closerSide='above', got rounded=${d.rounded} closerSide=${d.closerSide}`);
    // isTie always rounds to upper
    assert(closer.rounded === 80 && closer.upper === 80 && closer.lower === 70, `tie n=75: lower=70 upper=80 rounded=80, got lower=${closer.lower} upper=${closer.upper} rounded=${closer.rounded}`);
  }

  // below: n=73 -> 70
  {
    const steps = buildRoundingSteps(73, 10);
    const d = last(steps);
    assert(d.rounded === 70, `n=73 rounds to 70, got ${d.rounded}`);
    const closer = steps.find((s) => s.view === "closer")!;
    assert(closer.closerSide === "below", `n=73 closerSide should be 'below', got ${closer.closerSide}`);
    assert(closer.stepsToLower === 3 && closer.stepsToUpper === 7, `n=73 stepsToLower=3 stepsToUpper=7, got ${closer.stepsToLower}/${closer.stepsToUpper}`);
  }

  // above: n=78 -> 80
  {
    const steps = buildRoundingSteps(78, 10);
    const d = last(steps);
    assert(d.rounded === 80, `n=78 rounds to 80, got ${d.rounded}`);
    const closer = steps.find((s) => s.view === "closer")!;
    assert(closer.closerSide === "above", `n=78 closerSide should be 'above', got ${closer.closerSide}`);
    assert(closer.stepsToLower === 8 && closer.stepsToUpper === 2, `n=78 stepsToLower=8 stepsToUpper=2, got ${closer.stepsToLower}/${closer.stepsToUpper}`);
  }

  assert(config.validate(9) !== null, "stage2 validate rejects 9 (below min)");
  assert(config.validate(100) !== null, "stage2 validate rejects 100 (above max)");
  assert(config.validate(73) === null, "stage2 validate accepts 73");
}

// --- Stage3, roundTo=10, numberMin/Max 100/999 ---
{
  const config = STAGE3_CONFIG;
  assert(config.roundToOptions.join(",") === "10,100", "stage3 roundToOptions is [10,100]");

  // exact: n=350
  {
    const steps = buildRoundingSteps(350, 10);
    const d = last(steps);
    assert(d.done && d.rounded === 350, `roundTo=10 exact n=350 rounds to 350, got ${d.rounded}`);
    assert(steps.length === 4, "roundTo=10 exact path has 4 steps");
  }

  // tie: n=345 -> 350
  {
    const steps = buildRoundingSteps(345, 10);
    const closer = steps.find((s) => s.view === "closer")!;
    assert(closer.isTie, "n=345 roundTo=10 is a tie");
    const d = last(steps);
    assert(d.rounded === 350, `tie n=345 rounds up to 350, got ${d.rounded}`);
  }

  // below: n=343 -> 340
  {
    const steps = buildRoundingSteps(343, 10);
    const d = last(steps);
    assert(d.rounded === 340, `n=343 rounds to 340, got ${d.rounded}`);
    const closer = steps.find((s) => s.view === "closer")!;
    assert(closer.closerSide === "below", "n=343 closerSide is below");
  }

  // above: n=347 -> 350
  {
    const steps = buildRoundingSteps(347, 10);
    const d = last(steps);
    assert(d.rounded === 350, `n=347 rounds to 350, got ${d.rounded}`);
    const closer = steps.find((s) => s.view === "closer")!;
    assert(closer.closerSide === "above", "n=347 closerSide is above");
  }

  assert(config.validate(99) !== null, "stage3 validate rejects 99 (below min)");
  assert(config.validate(1000) !== null, "stage3 validate rejects 1000 (above max)");
  assert(config.validate(349) === null, "stage3 validate accepts 349");
}

// --- Stage3, roundTo=100, including the hopStart-offset quirk ---
{
  // exact: n=400
  {
    const steps = buildRoundingSteps(400, 100);
    const d = last(steps);
    assert(d.done && d.rounded === 400, `roundTo=100 exact n=400 rounds to 400, got ${d.rounded}`);
  }

  // tie: n=350 -> 400 (remainder 50 === half)
  {
    const steps = buildRoundingSteps(350, 100);
    const closer = steps.find((s) => s.view === "closer")!;
    assert(closer.isTie, "n=350 roundTo=100 is a tie (remainder 50 === half 50)");
    const d = last(steps);
    assert(d.rounded === 400, `tie n=350 roundTo=100 rounds up to 400, got ${d.rounded}`);
  }

  // below: n=340 -> 300 (tens digit 4 < 5)
  {
    const steps = buildRoundingSteps(340, 100);
    const d = last(steps);
    assert(d.rounded === 300, `n=340 roundTo=100 rounds to 300, got ${d.rounded}`);
    const closer = steps.find((s) => s.view === "closer")!;
    assert(closer.closerSide === "below" && closer.stepsToLower === 4 && closer.stepsToUpper === 6, `n=340 roundTo=100: stepsToLower=4 stepsToUpper=6, got ${closer.stepsToLower}/${closer.stepsToUpper}`);
  }

  // above: n=360 -> 400 (tens digit 6 >= 5)
  {
    const steps = buildRoundingSteps(360, 100);
    const d = last(steps);
    assert(d.rounded === 400, `n=360 roundTo=100 rounds to 400, got ${d.rounded}`);
  }

  // THE non-obvious hopStart quirk: n=349, roundTo=100 -> lower=300, stepsToLower=4 (tens
  // digit), hopStep=10 -> hopStart = 300 + 4*10 = 340, NOT the true value of n (349).
  {
    const steps = buildRoundingSteps(349, 100);
    const hopBack = steps.find((s) => s.view === "hop" && s.hopDirection === "back")!;
    assert(hopBack.lower === 300 && hopBack.stepsToLower === 4 && hopBack.hopStep === 10, `n=349 roundTo=100: lower=300 stepsToLower=4(tens digit) hopStep=10, got lower=${hopBack.lower} stepsToLower=${hopBack.stepsToLower} hopStep=${hopBack.hopStep}`);
    const hopStart = hopStartOf(hopBack);
    assert(hopStart === 340, `THE QUIRK: hopStart must be 340 (a tens-scaled offset), NOT 349 (the true n) - got ${hopStart}`);
    assert(hopStart !== hopBack.n, `hopStart (${hopStart}) is deliberately NOT equal to n (${hopBack.n})`);

    const closer = steps.find((s) => s.view === "closer")!;
    const closerHopStart = hopStartOf(closer);
    assert(closerHopStart === 340, `closer view also uses the same hopStart=340 quirk, got ${closerHopStart}`);

    const d = last(steps);
    assert(d.rounded === 300, `n=349 roundTo=100 rounds to 300 (correct final answer, quirk is animation-only), got ${d.rounded}`);
  }
}

// --- GO_BACK / re-forward round-trip: placed/mcqAnswered survive navigation ---
{
  // Use a non-tie, non-exact case so we get placeTap + closer steps.
  let s = createSession(73, 10); // stage2-style: below case, rounds 73 -> 70
  const placeTapIdx = s.steps.findIndex((st) => st.placeTap);
  const closerIdx = s.steps.findIndex((st) => st.view === "closer");
  assert(placeTapIdx >= 0 && closerIdx > placeTapIdx, "session has a placeTap step before a closer step");

  // Advance to the placeTap step and mark it placed (simulating a correct tap).
  for (let i = 0; i < placeTapIdx; i++) s = roundingReducer(s, { type: "ADVANCE_PHASE" });
  assert(s.stepIdx === placeTapIdx, "advanced to placeTap step");
  s = roundingReducer(s, { type: "PLACE_MARKER" });
  assert(s.placed === true, "placed=true after PLACE_MARKER");

  // Advance all the way to the closer step and answer it correctly.
  for (let i = placeTapIdx; i < closerIdx; i++) s = roundingReducer(s, { type: "ADVANCE_PHASE" });
  assert(s.stepIdx === closerIdx, "advanced to closer step");
  s = roundingReducer(s, { type: "ANSWER_MCQ" });
  assert(s.mcqAnswered === true && s.mcqCorrect === true, "mcqAnswered=true, mcqCorrect=true after ANSWER_MCQ");

  // Go back to the placeTap step - placed must still be true (matches vanilla: the mutated
  // step.placed flag is never reset by goPrev()/goNext(), it's set once and stays).
  for (let i = closerIdx; i > placeTapIdx; i--) s = roundingReducer(s, { type: "GO_BACK" });
  assert(s.stepIdx === placeTapIdx, "went back to placeTap step");
  assert(s.placed === true, "placed is still true after navigating back (matches vanilla behavior)");
  assert(s.mcqAnswered === true, "mcqAnswered is still true even though we're not on the closer step (session-level flag, not per-step)");

  // Go forward again to the closer step - mcqAnswered must still be true (options render as
  // already-answered/disabled, matching vanilla's mutated step.mcqAnswered persisting).
  for (let i = placeTapIdx; i < closerIdx; i++) s = roundingReducer(s, { type: "ADVANCE_PHASE" });
  assert(s.stepIdx === closerIdx, "re-advanced to closer step");
  assert(s.mcqAnswered === true && s.mcqCorrect === true, "mcqAnswered/mcqCorrect preserved across the round-trip");

  // RESTART must reset everything.
  s = roundingReducer(s, { type: "RESTART", n: 78, roundTo: 10 });
  assert(s.n === 78 && s.stepIdx === 0 && s.placed === false && s.mcqAnswered === false && s.mcqCorrect === null, "RESTART resets stepIdx/placed/mcqAnswered/mcqCorrect and rebuilds steps for the new number");
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
