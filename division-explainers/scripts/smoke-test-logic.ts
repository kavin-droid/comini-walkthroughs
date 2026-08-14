import { createStage1Session, stage1Reducer, validateStage1, type Stage1Session } from "../lib/division/stage1";
import { createStage2Session, stage2Reducer, validateStage2, type Stage2Session } from "../lib/division/stage2";
import { createStage3Session, stage3Quotient, stage3Reducer, validateStage3, type Stage3Session } from "../lib/division/stage3";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function tick(s: Stage2Session, n: number): Stage2Session {
  for (let i = 0; i < n; i++) s = stage2Reducer(s, { type: "TICK" });
  return s;
}
function containerCounts(s: Stage2Session): number[] {
  const containerTotal = Math.max(...s.placements) + 1;
  const counts = new Array(containerTotal).fill(0);
  for (let i = 0; i < s.dotsPlaced; i++) counts[s.placements[i]]++;
  return counts;
}

// --- Stage2 sharing: 12 / 3, full phase walk (new equation -> count -> share -> notation flow) ---
{
  let s = createStage2Session(12, 3, "sharing");
  assert(s.phase === "equation" && s.dotsPlaced === 0 && s.previewCount === 0 && s.quotient === 4, "sharing starts at equation");
  assert(s.placements.join(",") === "0,1,2,0,1,2,0,1,2,0,1,2", "sharing placements are round-robin");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> reveal-dividend
  assert(s.phase === "reveal-dividend", "equation -> reveal-dividend");
  s = tick(s, 12); // count out the dividend, one at a time
  assert(s.previewCount === 12, "reveal-dividend counts out all 12 items");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> reveal-divisor
  assert(s.phase === "reveal-divisor" && s.previewCount === 0, "reveal-dividend -> reveal-divisor resets the preview count");
  s = tick(s, 3); // count out the divisor
  assert(s.previewCount === 3, "reveal-divisor counts out all 3 friends");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> round1
  assert(s.phase === "round1", "reveal-divisor -> round1");
  s = tick(s, 3); // divisor dots
  assert(s.dotsPlaced === 3 && containerCounts(s).every((c) => c === 1), "round1: each friend has 1");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> predict
  assert(s.phase === "predict" && s.mcqOptions !== null && s.mcqOptions.includes(4), "predict phase has correct answer in options");

  s = stage2Reducer(s, { type: "SELECT_PREDICTION", value: 4 });
  assert(s.phase === "distribute" && s.predicted === 4, "answered predict, moved to distribute");

  s = tick(s, 9); // remaining dots to total=12
  assert(s.dotsPlaced === 12 && containerCounts(s).every((c) => c === 4), "distribute: every friend ends with 4");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> feedback
  assert(s.phase === "feedback", "distribute complete -> feedback (no equation yet)");
  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> reveal
  assert(s.phase === "reveal", "feedback -> reveal");
  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> notation
  assert(s.phase === "notation", "reveal -> notation (sharing only, full breakdown)");
  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> done
  assert(s.phase === "done" && s.quotient === 4, "sharing reaches done, quotient 4");

  // GO_BACK chain, all the way from feedback back to the very first phase.
  let back = createStage2Session(12, 3, "sharing");
  back = stage2Reducer(back, { type: "ADVANCE_PHASE" }); // reveal-dividend
  back = tick(back, 12);
  back = stage2Reducer(back, { type: "ADVANCE_PHASE" }); // reveal-divisor
  back = tick(back, 3);
  back = stage2Reducer(back, { type: "ADVANCE_PHASE" }); // round1
  back = tick(back, 3);
  back = stage2Reducer(back, { type: "ADVANCE_PHASE" }); // predict
  back = stage2Reducer(back, { type: "SELECT_PREDICTION", value: 4 });
  back = tick(back, 9);
  back = stage2Reducer(back, { type: "ADVANCE_PHASE" }); // feedback
  back = stage2Reducer(back, { type: "GO_BACK" });
  assert(back.phase === "predict" && back.dotsPlaced === 3, "GO_BACK from feedback restores round1-complete state");

  back = stage2Reducer(back, { type: "GO_BACK" });
  assert(
    back.phase === "reveal-divisor" && back.previewCount === 3 && back.predicted === null,
    "GO_BACK from predict lands on the settled reveal-divisor checkpoint, resets the prediction",
  );

  back = stage2Reducer(back, { type: "GO_BACK" });
  assert(back.phase === "reveal-dividend" && back.previewCount === 12, "GO_BACK from reveal-divisor lands on the settled reveal-dividend checkpoint");

  back = stage2Reducer(back, { type: "GO_BACK" });
  assert(back.phase === "equation" && back.previewCount === 0, "GO_BACK from reveal-dividend lands on equation");

  // GO_BACK from the tail end: done -> notation -> reveal.
  let tail = stage2Reducer(s, { type: "GO_BACK" }); // s is at "done" here
  assert(tail.phase === "notation", "GO_BACK from done lands on notation");
  tail = stage2Reducer(tail, { type: "GO_BACK" });
  assert(tail.phase === "reveal", "GO_BACK from notation lands on reveal");

  const noop = stage2Reducer(createStage2Session(12, 3, "sharing"), { type: "GO_BACK" });
  assert(noop.phase === "equation", "GO_BACK from equation (atStart) is a no-op");
}

// --- Stage2 grouping: 12 / 3 (group size 3), mirrors sharing's phase sequence ---
{
  let s = createStage2Session(12, 3, "grouping");
  assert(s.phase === "equation", "grouping now starts at equation too, same as sharing");
  assert(s.placements.join(",") === "0,0,0,1,1,1,2,2,2,3,3,3", "grouping placements are block-fill");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> reveal-dividend
  assert(s.phase === "reveal-dividend", "equation -> reveal-dividend");
  s = tick(s, 12);
  assert(s.previewCount === 12, "reveal-dividend counts out all 12 items");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> reveal-divisor
  assert(s.phase === "reveal-divisor" && s.previewCount === 0, "reveal-dividend -> reveal-divisor resets the preview count");
  s = tick(s, 1);
  assert(s.previewCount === 1 && s.dotsPlaced === 0, "grouping's reveal-divisor reveals a single friend first (not `divisor` friends)");

  // Same step, no separate round1 phase - ticking continues to fill that one friend with
  // `divisor` dots ("highlight the divisor, share that many to the friend" as one beat).
  s = tick(s, 3);
  assert(s.phase === "reveal-divisor", "filling the friend stays within reveal-divisor, no phase change yet");
  assert(containerCounts(s)[0] === 3 && containerCounts(s)[1] === 0, "grouping's reveal-divisor fill fills only group 0, demonstrating one full group");
  const overTick = stage2Reducer(s, { type: "TICK" });
  assert(overTick.dotsPlaced === 3, "grouping's reveal-divisor TICK is a no-op once the friend is fully filled");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> predict
  assert(s.phase === "predict" && s.mcqOptions !== null && s.mcqOptions.includes(4), "predict phase has correct answer in options");
  s = stage2Reducer(s, { type: "SELECT_PREDICTION", value: 4 });
  s = tick(s, 9); // continues dotsPlaced from 3 (reveal-divisor's fill) up to total=12
  assert(containerCounts(s).every((c) => c === 3), "grouping distribute: 4 groups of 3");

  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> feedback
  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> reveal
  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> notation (grouping gets this too now, for the bridge-arrows step)
  assert(s.phase === "notation", "grouping now reaches notation too, same as sharing");
  s = stage2Reducer(s, { type: "ADVANCE_PHASE" }); // -> done
  assert(s.phase === "done" && s.quotient === 4, "grouping reaches done, quotient 4");

  // GO_BACK from predict lands back on grouping's settled reveal-divisor (previewCount 1, not divisor).
  let back = stage2Reducer(s, { type: "GO_BACK" }); // done -> notation
  back = stage2Reducer(back, { type: "GO_BACK" }); // notation -> reveal
  back = stage2Reducer(back, { type: "GO_BACK" }); // reveal -> feedback
  back = stage2Reducer(back, { type: "GO_BACK" }); // feedback -> predict
  back = stage2Reducer(back, { type: "GO_BACK" }); // predict -> reveal-divisor
  assert(
    back.phase === "reveal-divisor" && back.previewCount === 1 && back.predicted === null,
    "GO_BACK from grouping's predict lands on the settled reveal-divisor checkpoint (1 friend), resets the prediction",
  );
}

// --- Stage2 validation ---
{
  assert(validateStage2(13, 3) !== null, "13/3 does not divide evenly -> error");
  assert(validateStage2(12, 7) !== null, "divisor 7 out of range -> error");
  assert(validateStage2(24, 2) !== null, "quotient 12 exceeds max 6 -> error");
  assert(validateStage2(12, 3) === null, "12/3 valid -> no error");
  assert(validateStage2(6, 6) === null, "boundary 6/6 valid -> no error");
}

function tickCountTens(s: Stage3Session, n: number): Stage3Session {
  for (let i = 0; i < n; i++) s = stage3Reducer(s, { type: "COUNT_TENS_TICK" });
  return s;
}
function tickShareTens(s: Stage3Session, n: number): Stage3Session {
  for (let i = 0; i < n; i++) s = stage3Reducer(s, { type: "SHARE_TENS_TICK" });
  return s;
}
function tickCountLeftover(s: Stage3Session, n: number): Stage3Session {
  for (let i = 0; i < n; i++) s = stage3Reducer(s, { type: "COUNT_LEFTOVER_TICK" });
  return s;
}
/** intro -> reveal-friends -> focus-tens -> predict-tens, the granular 3-step lead-in shared by
 * every test below (breakdown alone, then friends fade in alone, then "let's focus on tens",
 * THEN the MCQ). */
function advanceToPredictTens(s: Stage3Session): Stage3Session {
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // intro -> reveal-friends
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // reveal-friends -> focus-tens
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // focus-tens -> predict-tens
  return s;
}
/** Ticks a settled count-tens through share-tens (if anything to share) all the way to a settled
 * count-leftover, then continues into unpack-intro - the shared middle section every full-flow
 * test below needs. */
function advanceThroughLeftover(s: Stage3Session): Stage3Session {
  const tensPredicted = s.tensPredicted;
  if (tensPredicted !== null && tensPredicted > 0) {
    s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_TENS" }); // -> share-tens
    s = tickShareTens(s, tensPredicted * s.divisor);
    s = stage3Reducer(s, { type: "FINISH_SHARE_TENS" }); // -> count-leftover (tensLeftover > 0 in every caller here)
  } else {
    s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_TENS" }); // -> count-leftover directly
  }
  s = tickCountLeftover(s, s.tensLeftover);
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_LEFTOVER" }); // -> unpack-intro
  return s;
}
function tickCountOnes(s: Stage3Session, n: number): Stage3Session {
  for (let i = 0; i < n; i++) s = stage3Reducer(s, { type: "COUNT_ONES_TICK" });
  return s;
}
function tapShareRounds(s: Stage3Session, n: number): Stage3Session {
  for (let i = 0; i < n; i++) s = stage3Reducer(s, { type: "TAP_SHARE_ONES_ROUND" });
  return s;
}
/** Tap a leftover pack all the way through its unpack sequence: packed -> moving (FLIP to the
 * ones column) -> fading (out, in place) -> moved (its 10 ones fade in). */
function unpackOne(s: Stage3Session, index: number): Stage3Session {
  s = stage3Reducer(s, { type: "TAP_UNPACK", index });
  s = stage3Reducer(s, { type: "UNPACK_MOVE_DONE", index });
  s = stage3Reducer(s, { type: "UNPACK_FADE_DONE", index });
  return s;
}

// --- Stage3: 76 / 4, full phase walk (tens has enough, leftover regroups into ones, no remainder) ---
{
  let s = createStage3Session(76, 4);
  assert(s.phase === "numerals" && s.tensDigit === 7 && s.onesDigit === 6, "76/4 place value split");

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // numerals -> intro
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // intro -> reveal-friends
  assert(s.phase === "reveal-friends", "intro -> reveal-friends (friends fade in alone, breakdown untouched)");
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // reveal-friends -> focus-tens
  assert(s.phase === "focus-tens", "reveal-friends -> focus-tens (\"we'll focus on tens first\", ones still visible)");
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // focus-tens -> predict-tens
  assert(s.phase === "predict-tens" && s.mcqOptionsTens !== null && s.mcqOptionsTens.includes(1), "predict-tens options include correct 1");

  // GO_BACK from the new focus-tens checkpoint, both directions.
  let backToFocus = stage3Reducer(s, { type: "GO_BACK" }); // predict-tens -> focus-tens
  assert(backToFocus.phase === "focus-tens" && backToFocus.mcqOptionsTens === null, "GO_BACK from predict-tens lands on focus-tens, clears the MCQ options");
  backToFocus = stage3Reducer(backToFocus, { type: "GO_BACK" }); // focus-tens -> reveal-friends
  assert(backToFocus.phase === "reveal-friends", "GO_BACK from focus-tens lands on reveal-friends");

  // Tap a WRONG guess (0) - the real math must still use the correct value (1), only tensGuess records the tap.
  s = stage3Reducer(s, { type: "SELECT_TENS_PREDICTION", value: 0 });
  assert(s.phase === "count-tens" && s.tensPredicted === 1 && s.tensGuess === 0 && s.tensLeftover === 3, "wrong guess (0) doesn't corrupt the real math (still 1, leftover 3)");

  s = tickCountTens(s, s.tensDigit);
  assert(s.phase === "count-tens" && s.tensCountProgress === 7, "counting settles in place, one block at a time, through all 7 - does not auto-jump to share-tens");

  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_TENS" });
  assert(s.phase === "share-tens", "explicit Next after count+feedback -> separate distribution step");

  s = tickShareTens(s, s.tensPredicted! * s.divisor);
  assert(s.tensContainerCounts.every((n) => n === 1), "auto-share: 1 ten pack placed in each of the 4 containers");
  s = stage3Reducer(s, { type: "FINISH_SHARE_TENS" }); // ticker dispatches this automatically once tensSharePlaced hits target
  assert(s.phase === "count-leftover" && s.leftoverCountProgress === 0, "distribution auto-hands-off once done - leftover > 0 -> count-leftover, nothing counted yet");

  s = tickCountLeftover(s, s.tensLeftover);
  assert(s.phase === "count-leftover" && s.leftoverCountProgress === 3, "leftover counting settles in place, one pack at a time - does not auto-jump to unpack-intro");

  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_LEFTOVER" });
  assert(s.phase === "unpack-intro" && s.unpackStages.length === 3, "explicit Next after counting the leftover -> unpack-intro, 3 packs queued");

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // -> unpack
  assert(s.phase === "unpack", "unpack-intro Next -> unpack");

  for (let i = 0; i < 3; i++) s = unpackOne(s, i);
  assert(s.unpackStages.every((st) => st === "moved"), "all 3 leftover packs tapped and unpacked");
  s = stage3Reducer(s, { type: "FINISH_UNPACK" });
  assert(s.phase === "focus-ones" && s.onesTotal === 36, `unpack should yield 36 ones, got ${s.onesTotal}`);

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // -> predict-ones
  assert(s.mcqOptionsOnes !== null && s.mcqOptionsOnes.includes(9), "predict-ones options include correct 9");

  s = stage3Reducer(s, { type: "SELECT_ONES_PREDICTION", value: 9 });
  assert(s.phase === "count-ones" && s.onesPredicted === 9 && s.remainder === 0, "9 fours in 36 ones, remainder 0");

  s = tickCountOnes(s, s.onesTotal);
  assert(s.phase === "count-ones", "ones counting settles in place (with feedback) - does not auto-jump to share-ones");
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_ONES" });
  assert(s.phase === "share-ones", "explicit Next after count+feedback -> separate ones distribution step");

  s = tapShareRounds(s, 9);
  assert(s.phase === "remainder" && s.onesSharedRounds === 9, "9 tapped rounds complete -> remainder");

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // recap
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // notation
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // done
  assert(s.phase === "done" && stage3Quotient(s) === 19, `76/4 quotient should be 19, got ${stage3Quotient(s)}`);
}

// --- Stage3: 15 / 5, tens digit (1) below divisor -> predicted 0, share-tens skipped entirely ---
{
  let s = createStage3Session(15, 5);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // numerals -> intro
  s = advanceToPredictTens(s);
  assert(s.mcqOptionsTens !== null && s.mcqOptionsTens.includes(0), "predict-tens options include correct 0");

  s = stage3Reducer(s, { type: "SELECT_TENS_PREDICTION", value: 0 });
  assert(s.tensPredicted === 0 && s.tensLeftover === 1, "0 fives in 1 ten, leftover 1");
  s = tickCountTens(s, s.tensDigit);
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_TENS" });
  assert(s.phase === "count-leftover", "tensPredicted 0 -> share-tens skipped, straight to count-leftover");
  s = tickCountLeftover(s, s.tensLeftover);
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_LEFTOVER" });
  assert(s.phase === "unpack-intro", "leftover counted -> unpack-intro");

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // unpack
  s = unpackOne(s, 0);
  s = stage3Reducer(s, { type: "FINISH_UNPACK" });
  assert(s.onesTotal === 15, `unpack should yield 15 ones, got ${s.onesTotal}`);

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // predict-ones
  s = stage3Reducer(s, { type: "SELECT_ONES_PREDICTION", value: 3 });
  s = tickCountOnes(s, s.onesTotal);
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_ONES" });
  s = tapShareRounds(s, 3);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // recap
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // notation
  assert(stage3Quotient(s) === 3 && s.remainder === 0, `15/5 quotient should be 3 (no leading tens digit), got ${stage3Quotient(s)}`);
}

// --- Stage3: 77 / 4, genuine remainder (inexact division is now allowed) ---
{
  let s = createStage3Session(77, 4);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // numerals -> intro
  s = advanceToPredictTens(s);
  s = stage3Reducer(s, { type: "SELECT_TENS_PREDICTION", value: 1 });
  s = tickCountTens(s, s.tensDigit);
  s = advanceThroughLeftover(s);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // unpack
  for (let i = 0; i < s.unpackStages.length; i++) s = unpackOne(s, i);
  s = stage3Reducer(s, { type: "FINISH_UNPACK" });
  assert(s.onesTotal === 37, `77/4 should yield 37 ones before the final split, got ${s.onesTotal}`);

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // predict-ones
  s = stage3Reducer(s, { type: "SELECT_ONES_PREDICTION", value: 9 });
  assert(s.remainder === 1, `77/4 remainder should be 1, got ${s.remainder}`);
  // 37 ones, divisor 4: 9 complete groups (36 ones) + a partial leftover of 1 - the counting demo
  // ticks through all 37 individual ones, one at a time, to reveal that leftover.
  s = tickCountOnes(s, s.onesTotal);
  assert(s.onesCountProgress === 37, `count-ones should tick through every individual one including the leftover, got progress ${s.onesCountProgress}`);
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_ONES" });
  s = tapShareRounds(s, 9);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // recap
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // notation
  assert(stage3Quotient(s) === 19 && s.remainder === 1, `77/4 should be 19 remainder 1, got ${stage3Quotient(s)} r${s.remainder}`);
}

// --- Stage3 GO_BACK: predict-ones -> settled count-tens (keeps tens progress), then -> predict-tens (resets it) ---
{
  let s = createStage3Session(76, 4);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // numerals -> intro
  s = advanceToPredictTens(s);
  s = stage3Reducer(s, { type: "SELECT_TENS_PREDICTION", value: 1 });
  s = tickCountTens(s, s.tensDigit);
  s = advanceThroughLeftover(s);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // unpack
  for (let i = 0; i < s.unpackStages.length; i++) s = unpackOne(s, i);
  s = stage3Reducer(s, { type: "FINISH_UNPACK" });
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // predict-ones
  s = stage3Reducer(s, { type: "GO_BACK" });
  assert(
    s.phase === "count-tens" && s.tensPredicted === 1 && s.tensContainerCounts.every((n) => n === 1) && s.onesPredicted === null,
    "GO_BACK from predict-ones lands on the settled count-tens checkpoint, tens progress intact, ones reset",
  );

  s = stage3Reducer(s, { type: "GO_BACK" });
  assert(
    s.phase === "predict-tens" && s.tensPredicted === null && s.tensContainerCounts.every((n) => n === 0),
    "GO_BACK from count-tens resets the tens prediction back to predict-tens",
  );
}

// --- Stage3 GO_BACK: the new count-leftover/unpack-intro checkpoints ---
{
  let s = createStage3Session(76, 4);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // numerals -> intro
  s = advanceToPredictTens(s);
  s = stage3Reducer(s, { type: "SELECT_TENS_PREDICTION", value: 1 });
  s = tickCountTens(s, s.tensDigit);
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_TENS" }); // -> share-tens
  s = tickShareTens(s, s.tensPredicted! * s.divisor);
  s = stage3Reducer(s, { type: "FINISH_SHARE_TENS" }); // -> count-leftover
  s = tickCountLeftover(s, s.tensLeftover);
  s = stage3Reducer(s, { type: "CONTINUE_AFTER_COUNT_LEFTOVER" }); // -> unpack-intro

  s = stage3Reducer(s, { type: "GO_BACK" });
  assert(
    s.phase === "count-leftover" && s.leftoverCountProgress === 3,
    "GO_BACK from unpack-intro lands on the settled count-leftover screen, progress intact",
  );

  s = stage3Reducer(s, { type: "GO_BACK" });
  assert(
    s.phase === "count-tens" && s.tensPredicted === 1 && s.tensContainerCounts.every((n) => n === 1) && s.leftoverCountProgress === 0,
    "GO_BACK from count-leftover lands on the settled count-tens checkpoint (share-tens is a dead end), leftover progress reset",
  );
}

// --- Stage3 unpack: settles with ghosts once every pack is moved, FINISH_UNPACK is a manual,
// guarded hand-off (no-op if packs remain), and GO_BACK from both the settled unpack screen and
// the settled count-ones screen land on the expected checkpoints ---
{
  let s = createStage3Session(76, 4);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // numerals -> intro
  s = advanceToPredictTens(s);
  s = stage3Reducer(s, { type: "SELECT_TENS_PREDICTION", value: 1 });
  s = tickCountTens(s, s.tensDigit);
  s = advanceThroughLeftover(s);
  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // unpack

  s = stage3Reducer(s, { type: "TAP_UNPACK", index: 0 });
  assert(s.unpackStages[0] === "moving", "tap starts the pack's FLIP travel to the ones column");
  const guardedMove = stage3Reducer(s, { type: "UNPACK_FADE_DONE", index: 0 });
  assert(guardedMove.unpackStages[0] === "moving", "UNPACK_FADE_DONE is a no-op before the move has landed (still moving)");
  s = stage3Reducer(s, { type: "UNPACK_MOVE_DONE", index: 0 });
  assert(s.unpackStages[0] === "fading", "landed - now fades out in place");
  s = stage3Reducer(s, { type: "UNPACK_FADE_DONE", index: 0 });
  assert(s.unpackStages[0] === "moved", "faded - the pack is gone, its 10 ones fade in");
  const guarded = stage3Reducer(s, { type: "FINISH_UNPACK" });
  assert(guarded.phase === "unpack", "FINISH_UNPACK is a no-op while packs remain (2 of 3 still unpacked)");

  s = unpackOne(s, 1);
  s = unpackOne(s, 2);
  assert(s.phase === "unpack" && s.unpackStages.every((st) => st === "moved"), "all packs moved but still settled on unpack (ghosts showing), no auto-advance");

  s = stage3Reducer(s, { type: "GO_BACK" });
  assert(
    s.phase === "unpack-intro" && s.unpackStages.every((st) => st === "packed"),
    "GO_BACK from settled unpack redoes it - unpack-intro with every pack reset to packed",
  );

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // -> unpack
  for (let i = 0; i < s.unpackStages.length; i++) s = unpackOne(s, i);
  s = stage3Reducer(s, { type: "FINISH_UNPACK" });
  assert(s.phase === "focus-ones", "FINISH_UNPACK succeeds once every pack has moved");

  s = stage3Reducer(s, { type: "ADVANCE_PHASE" }); // predict-ones
  s = stage3Reducer(s, { type: "SELECT_ONES_PREDICTION", value: 9 });
  s = tickCountOnes(s, s.onesTotal);
  assert(s.phase === "count-ones", "ones counting settled, still on count-ones");

  s = stage3Reducer(s, { type: "GO_BACK" });
  assert(
    s.phase === "predict-ones" && s.onesPredicted === null && s.onesCountProgress === 0,
    "GO_BACK from settled count-ones resets to predict-ones",
  );
}

// --- Stage3 validation ---
{
  assert(validateStage3(77, 4) === null, "77/4 is now allowed - remainders are a supported outcome");
  assert(validateStage3(96, 6) !== null, "divisor 6 not in [2,3,4,5] -> error");
  assert(validateStage3(11, 4) !== null, "dividend 11 below min 12 -> error");
  assert(validateStage3(76, 4) === null, "76/4 valid -> no error");
}

function tick1(s: Stage1Session, n: number): Stage1Session {
  for (let i = 0; i < n; i++) s = stage1Reducer(s, { type: "TICK" });
  return s;
}
function share1(s: Stage1Session, n: number): Stage1Session {
  for (let i = 0; i < n; i++) s = stage1Reducer(s, { type: "SHARE_ITEM" });
  return s;
}
function trayCounts(s: Stage1Session): number[] {
  const counts = new Array(s.people).fill(0);
  for (let i = 0; i < s.dotsPlaced; i++) counts[s.placements[i]]++;
  return counts;
}

// --- Stage1 sharing: 10 items / 2 people, full phase walk ---
{
  let s = createStage1Session(10, 2);
  assert(s.phase === "pile-reveal" && s.dotsPlaced === 0 && s.previewCount === 0 && s.quotient === 5, "stage1 starts at pile-reveal");
  assert(s.placements.join(",") === "0,1,0,1,0,1,0,1,0,1", "stage1 placements are round-robin");

  s = tick1(s, 10);
  assert(s.previewCount === 10, "pile-reveal counts in all 10 items");
  const overTick = stage1Reducer(s, { type: "TICK" });
  assert(overTick.previewCount === 10, "pile-reveal TICK is a no-op once fully counted");

  s = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phase === "people-reveal" && s.previewCount === 0, "pile-reveal -> people-reveal resets previewCount");
  s = tick1(s, 2);
  assert(s.previewCount === 2, "people-reveal counts in both people");

  s = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phase === "distribute" && s.dotsPlaced === 0, "people-reveal -> distribute");

  const blocked = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  assert(blocked.phase === "distribute", "distribute can't be manually advanced before every item is shared");

  s = share1(s, 1);
  assert(s.dotsPlaced === 1 && trayCounts(s)[0] === 1 && trayCounts(s)[1] === 0, "first drag shares one item to person 0");
  s = share1(s, 1);
  assert(s.dotsPlaced === 2 && trayCounts(s)[1] === 1, "second drag shares one item to person 1 (round-robin)");

  s = share1(s, 8);
  assert(s.dotsPlaced === 10 && trayCounts(s).every((c) => c === 5), "distribute: both people end with 5 each");
  const overShare = stage1Reducer(s, { type: "SHARE_ITEM" });
  assert(overShare.dotsPlaced === 10, "SHARE_ITEM is a no-op once the pile is empty");

  s = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phase === "celebrate", "distribute complete -> celebrate");
  s = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phase === "recap", "celebrate -> recap");
  s = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phase === "done" && s.quotient === 5, "recap -> done, quotient 5");

  // GO_BACK chain, all the way from done back to the very first phase.
  s = stage1Reducer(s, { type: "GO_BACK" });
  assert(s.phase === "recap", "GO_BACK from done lands on recap");
  s = stage1Reducer(s, { type: "GO_BACK" });
  assert(s.phase === "celebrate", "GO_BACK from recap lands on celebrate");
  s = stage1Reducer(s, { type: "GO_BACK" });
  assert(s.phase === "distribute" && s.dotsPlaced === 10, "GO_BACK from celebrate lands on distribute, fully shared (not reset)");
  s = stage1Reducer(s, { type: "GO_BACK" });
  assert(s.phase === "people-reveal" && s.previewCount === 2 && s.dotsPlaced === 0, "GO_BACK from distribute resets sharing, lands on settled people-reveal");
  s = stage1Reducer(s, { type: "GO_BACK" });
  assert(s.phase === "pile-reveal" && s.previewCount === 10, "GO_BACK from people-reveal lands on settled pile-reveal");
  const atStart = stage1Reducer(s, { type: "GO_BACK" });
  assert(atStart.phase === "pile-reveal", "GO_BACK from pile-reveal (atStart) is a no-op");
}

// --- Stage1: 3 people, non-multiple-of-5 total ---
{
  let s = createStage1Session(9, 3);
  assert(s.quotient === 3 && s.placements.join(",") === "0,1,2,0,1,2,0,1,2", "9/3 placements round-robin across 3 people");
  s = tick1(s, 9);
  s = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  s = tick1(s, 3);
  s = stage1Reducer(s, { type: "ADVANCE_PHASE" });
  s = share1(s, 9);
  assert(trayCounts(s).every((c) => c === 3), "9/3: every person ends with 3");
}

// --- Stage1 validation ---
{
  assert(validateStage1(10, 2) === null, "10/2 valid -> no error");
  assert(validateStage1(1, 2) !== null, "total 1 below min 2 -> error");
  assert(validateStage1(21, 2) !== null, "total 21 above max 20 -> error");
  assert(validateStage1(10, 1) !== null, "people 1 below min 2 -> error");
  assert(validateStage1(10, 6) !== null, "people 6 above max 5 -> error");
  assert(validateStage1(10, 3) !== null, "10 doesn't divide evenly by 3 -> error");
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
