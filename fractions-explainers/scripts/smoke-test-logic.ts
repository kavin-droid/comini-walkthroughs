import { STAGE2_CONFIG, STAGE3_CONFIG } from "../lib/fractions/config";
import { createSession, fractionReducer, getSteps } from "../lib/fractions/session";
import { isInteractiveStep } from "../lib/fractions/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function textOf(fragments: { text: string }[]): string {
  return fragments.map((f) => f.text).join("");
}

function answerText(parts: { text: string }[]): string {
  return parts.map((p) => p.text).join("");
}

// --- Stage2: Understand Unit Fractions & Equivalence ---
{
  const concept = STAGE2_CONFIG.concepts.find((c) => c.id === "equivalence")!;

  const quarter = concept.generate("1/4", "", "");
  assert(quarter.length === 5, `1/4 step count 5 (split + highlight + tap + done, no branch), got ${quarter.length}`);
  assert(quarter[0].kind === "whole", "step0 whole");
  assert(quarter[1].kind === "strip" && quarter[1].shaded === 0, "step1 strip unshaded (split announcement)");
  const highlightStep = quarter[2];
  assert(highlightStep.kind === "strip" && highlightStep.shaded === 1, "step2 highlights exactly 1 piece");
  assert(textOf(highlightStep.explanation).includes("1/4"), "highlight step names the highlighted piece as 1/4");
  const tapStep = quarter[3];
  assert(tapStep.kind === "tapQuarters", "step3 is the interactive tap step");
  if (tapStep.kind === "tapQuarters") {
    assert(tapStep.target === 1, "1/4 needs exactly 1 tapped cell");
    assert(tapStep.referenceBar === null, "the single-fraction concept never shows a reference bar");
    assert(!textOf(tapStep.promptExplanation).match(/\d+ part/i), "prompt never states a tap count for 1/4");
    assert(textOf(tapStep.promptExplanation).includes("1/4"), "prompt asks in quarters notation (1/4)");
    assert(tapStep.activeColor === "piece1", "taps shade in piece1 color");
    assert(answerText(tapStep.promptAnswer).endsWith("?"), "answer hidden before solving");
    assert(answerText(tapStep.answer) === "1/4 = 1/4", "answer revealed once solved is 1/4 = 1/4");
    assert(textOf(tapStep.explanation).startsWith("Yes!"), "solved feedback opens with 'Yes!'");
  }
  assert(quarter[4].kind === "strip" && quarter[4].done === true, "step4 is the final done strip");
  assert(isInteractiveStep(tapStep), "tapQuarters reports as interactive");
  assert(!isInteractiveStep(quarter[1]), "a plain strip step does not report as interactive");

  const half = concept.generate("1/2", "", "");
  assert(half.length === 6, `1/2 step count 6 (has 1/2=2/4 branch), got ${half.length}`);
  const halfTap = half[3];
  assert(halfTap.kind === "tapQuarters" && halfTap.target === 2, "1/2 needs exactly 2 tapped cells");
  if (halfTap.kind === "tapQuarters") {
    assert(!textOf(halfTap.promptExplanation).match(/\d+ part/i), "prompt never states a tap count for 1/2");
    assert(textOf(halfTap.promptExplanation).includes("2/4"), "prompt asks for 2/4, not '1/2 or a half'");
  }
  const branchStep = half[4];
  assert(branchStep.kind === "strip" && branchStep.showHalves === true, "step4 shows the halves overlay for 1/2");
  if (branchStep.kind === "strip") {
    assert(branchStep.halvesShaded === 1, "1/2 -> 1 half shaded");
    assert(branchStep.callout?.join(",") === "1/2,2/4", "callout names 1/2 and 2/4");
  }
  assert(half[5].done === true, "step5 is the final done step");

  const threeQuarters = concept.generate("3/4", "", "");
  assert(threeQuarters.length === 5, `3/4 step count 5 (no branch), got ${threeQuarters.length}`);

  const whole = concept.generate("1", "", "");
  assert(whole.length === 6, `1 step count 6 (has 4/4=2/2=1 branch), got ${whole.length}`);
  const wholeTap = whole[3];
  assert(wholeTap.kind === "tapQuarters" && wholeTap.target === 4, "'1' needs all 4 cells tapped");
  if (wholeTap.kind === "tapQuarters") {
    assert(textOf(wholeTap.promptExplanation).includes("4/4"), "'1' prompt asks for 4/4, not 'the whole'");
  }
  assert(
    textOf(whole[0].explanation).includes("1 whole means"),
    "1's intro explanation is the special-cased 'whole' phrasing",
  );
}

// --- Stage2: Combine Unit Fractions ---
{
  const concept = STAGE2_CONFIG.concepts.find((c) => c.id === "combine")!;

  const quarterPlusQuarter = concept.generate("", "1/4", "1/4");
  assert(quarterPlusQuarter.length === 6, `1/4+1/4 step count 6 (simplifies to 1/2), got ${quarterPlusQuarter.length}`);
  assert(quarterPlusQuarter[0].kind === "whole", "step0 whole");
  assert(textOf(quarterPlusQuarter[0].explanation).startsWith("What does"), "intro asks 'What does ... give us?'");

  const tap1 = quarterPlusQuarter[1];
  assert(tap1.kind === "tapQuarters", "step1 asks for piece 1");
  if (tap1.kind === "tapQuarters") {
    assert(tap1.target === 1 && tap1.referenceBar === null, "piece1 (1/4): target 1, no reference bar yet");
    assert(tap1.activeColor === "piece1", "piece1 taps shade in piece1 color");
    assert(!textOf(tap1.promptExplanation).match(/\d+ part/i), "piece1 prompt never states a tap count");
    assert(textOf(tap1.explanation).startsWith("Yes!"), "piece1 solved feedback opens with 'Yes!'");
  }

  const tap2 = quarterPlusQuarter[2];
  assert(tap2.kind === "tapQuarters", "step2 asks for piece 2");
  if (tap2.kind === "tapQuarters") {
    assert(tap2.target === 1, "piece2 (1/4): target 1");
    assert(
      tap2.referenceBar?.shaded === 1 && tap2.referenceBar?.color === "piece1" && tap2.referenceBar?.caption === "1/4",
      "piece2 shows piece1's bar as a separate read-only reference, not shared cells",
    );
    assert(tap2.activeColor === "piece2", "piece2 taps shade in piece2 color");
    assert(!textOf(tap2.promptExplanation).match(/\d+ part/i), "piece2 prompt never states a tap count");
  }

  const combineStep = quarterPlusQuarter[3];
  assert(combineStep.kind === "tapCombineTotal", "step3 is the tap-the-third-bar combine step");
  if (combineStep.kind === "tapCombineTotal") {
    assert(combineStep.piece1Shaded === 1 && combineStep.piece2Shaded === 1, "1/4+1/4: both reference bars show 1 shaded");
    assert(combineStep.target === 2, "1/4+1/4: combined target is 2 (of 4)");
    assert(!textOf(combineStep.promptExplanation).match(/\d+ (part|piece)s? to tap/i), "combine prompt never states a tap count");
    assert(answerText(combineStep.answer) === "1/4 + 1/4 = 1/2", "1/4+1/4 simplifies to 1/2 in the revealed answer");
  }
  const simplifyStep = quarterPlusQuarter[4];
  assert(simplifyStep.kind === "strip" && simplifyStep.showHalves === true, "step4 names the simpler 1/2 form");
  assert(quarterPlusQuarter[5].done === true, "step5 is the final done step");

  const quarterPlusHalf = concept.generate("", "1/4", "1/2");
  assert(quarterPlusHalf.length === 5, `1/4+1/2 step count 5 (3/4 has no simpler form), got ${quarterPlusHalf.length}`);
  assert(!quarterPlusHalf.some((s) => s.kind === "strip" && s.showHalves), "1/4+1/2 never shows a halves overlay");
  const combine2 = quarterPlusHalf[3];
  assert(combine2.kind === "tapCombineTotal" && combine2.target === 3, "1/4+1/2 combined target is 3 (of 4)");
  assert(answerText(quarterPlusHalf[4].answer) === "1/4 + 1/2 = 3/4", "1/4+1/2 answer stays as 3/4");

  const halfPlusHalf = concept.generate("", "1/2", "1/2");
  assert(halfPlusHalf.length === 6, `1/2+1/2 step count 6 (simplifies to 1 whole), got ${halfPlusHalf.length}`);
  const tap1b = halfPlusHalf[1];
  assert(tap1b.kind === "tapQuarters" && tap1b.target === 2, "1/2+1/2: piece1 target 2");
  const tap2b = halfPlusHalf[2];
  assert(
    tap2b.kind === "tapQuarters" && tap2b.referenceBar?.shaded === 2 && tap2b.target === 2,
    "1/2+1/2: piece2 references piece1's 2-shaded bar, target 2",
  );
  assert(answerText(halfPlusHalf[5].answer) === "1/2 + 1/2 = 1", "1/2+1/2 simplifies to 1");
}

// --- Stage3 (unrouted for now, but the logic itself is untouched) ---
{
  const concept = STAGE3_CONFIG.concepts.find((c) => c.id === "equalParts")!;
  const twoThirds = concept.generate("2/3", "", "");
  assert(twoThirds.length === 7, `stage3 logic still generates 7 steps for 2/3, got ${twoThirds.length}`);
}

// --- Session reducer: solved gating, RESTART / ADVANCE_STEP / GO_BACK ---
{
  let s = createSession(STAGE2_CONFIG);
  assert(s.stepIdx === 0 && s.conceptId === "equivalence" && s.fraction === "1/2" && s.solved === false, "initial session unsolved");

  s = fractionReducer(s, { type: "MARK_SOLVED" }, STAGE2_CONFIG);
  assert(s.solved === true, "MARK_SOLVED sets solved");

  s = fractionReducer(s, { type: "ADVANCE_STEP" }, STAGE2_CONFIG);
  assert(s.stepIdx === 1 && s.solved === false, "advancing resets solved for the new step");

  s = fractionReducer(s, { type: "MARK_SOLVED" }, STAGE2_CONFIG);
  s = fractionReducer(s, { type: "GO_BACK" }, STAGE2_CONFIG);
  assert(s.stepIdx === 0 && s.solved === false, "going back also resets solved");

  const lastIdx = getSteps(STAGE2_CONFIG, s).length - 1;
  for (let i = 0; i < 20; i++) s = fractionReducer(s, { type: "ADVANCE_STEP" }, STAGE2_CONFIG);
  assert(s.stepIdx === lastIdx, `advance clamps at last step ${lastIdx}, got ${s.stepIdx}`);
  for (let i = 0; i < 20; i++) s = fractionReducer(s, { type: "GO_BACK" }, STAGE2_CONFIG);
  assert(s.stepIdx === 0, "go back clamps at 0");

  s = fractionReducer(
    s,
    { type: "RESTART", conceptId: "combine", fraction: "1/2", piece1: "1/2", piece2: "1/2" },
    STAGE2_CONFIG,
  );
  assert(
    s.conceptId === "combine" && s.piece1 === "1/2" && s.piece2 === "1/2" && s.stepIdx === 0 && s.solved === false,
    "restart switches concept, resets step and solved",
  );
  assert(getSteps(STAGE2_CONFIG, s).length === 6, "restart's steps reflect the new concept (1/2+1/2 = 6 steps)");
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
