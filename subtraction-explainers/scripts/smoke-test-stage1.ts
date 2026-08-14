import { generateCountBackSteps } from "../lib/stage1/countBack";
import { generateTakeAwaySteps } from "../lib/stage1/takeAway";
import { generateNumberOptions } from "../lib/stage1/mcq";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

// =================== Counting back: 7 - 3 (round-13 flow: intro, placed, hop-1..N, ask-position, reveal) ===================
{
  const steps = generateCountBackSteps(7, 3);
  assert(steps.length === 7, "7-3 count-back has 7 steps (intro, placed, hop-1, hop-2, hop-3, ask-position, reveal)");
  assert(steps[0].id === "intro" && !steps[0].placed, "step 0 is intro, rabbit not placed yet");
  assert(steps[1].id === "placed" && steps[1].placed && steps[1].hopsDone === 0 && steps[1].highlight === "minuend", "step 1 places the rabbit at the start, highlights the minuend");
  assert(steps[2].id === "hop-1" && steps[2].hopsDone === 1 && steps[2].highlight === "subtrahend", "step 2 (hop-1) highlights the subtrahend and hops automatically");
  assert(!!steps[2].requiresTap && steps[2].nextHopTarget === 5, "THE BUG CHECK: hop-1 already prompts for hop-2 (tap target = 7-2 = 5) - 'after the first jump, ask to tap'");
  assert(!!steps[3].requiresTap && steps[3].nextHopTarget === 4, "hop-2 prompts for hop-3 (tap target = 7-3 = 4)");
  assert(!steps[4].requiresTap, "THE BUG CHECK: the LAST hop (hop-3, hopsDone===subtrahend) does not require a hop-tap - it's the settled landing");
  assert(steps[4].hopsDone === 3, "hop-3 lands exactly on the answer position");
  const ask = steps[5];
  assert(ask.id === "ask-position" && !!ask.askPosition && !!ask.requiresTap && !ask.revealAnswer, "THE BUG CHECK: round-13 adds an ask-position MCQ once the rabbit has landed, before reveal");
  const reveal = steps[6];
  assert(reveal.id === "reveal" && reveal.revealAnswer && reveal.hopsDone === 3, "reveal step shows the answer, rabbit stays put");
  assert(steps.slice(0, 6).every((s) => !s.revealAnswer), "no earlier step leaks the answer");
}

// =================== Counting back: subtrahend of 1 (degenerate - hop-1 IS the last hop, never tap-gated) ===================
{
  const steps = generateCountBackSteps(5, 1);
  assert(steps.length === 5, "5-1 has 5 steps: intro, placed, hop-1, ask-position, reveal");
  assert(!steps[2].requiresTap, "THE BUG CHECK: with subtrahend=1, hop-1 is ALSO the last hop, so it never requires a hop-tap");
  assert(steps[2].hopsDone === 1, "the single hop lands on the answer (4)");
  assert(!!steps[3].askPosition, "ask-position still appears even with just one hop");
}

// =================== Take away: 8 - 3 (round-13 flow: intro, shown, remove-1..N, ask, reveal - no separate fade step) ===================
{
  const steps = generateTakeAwaySteps(8, 3);
  assert(steps.length === 7, "8-3 take-away has 7 steps (intro, shown, remove-1..3, ask, reveal) - no standalone fade step anymore");
  assert(steps[0].id === "intro" && !steps[0].shown, "step 0 is intro, apples not shown yet");
  assert(steps[1].id === "shown" && steps[1].shown && steps[1].highlight === "minuend", "step 1 highlights the minuend, apples appear");
  assert(steps[2].id === "remove-1" && steps[2].removedCount === 0 && steps[2].tapTargetIndex === 7 && steps[2].highlight === "subtrahend", "remove-1 highlights the subtrahend, targets the last apple (index 7 of 8)");
  assert(steps[3].removedCount === 1 && steps[3].tapTargetIndex === 6, "remove-2: 1 removed, next target index 6");
  const lastRemove = steps[4];
  assert(lastRemove.id === "remove-3" && lastRemove.removedCount === 2 && !lastRemove.fadeRemoved, "THE BUG CHECK: taken-away apples stay visible (fadeRemoved unset) through the very last removal");
  const ask = steps[5];
  assert(ask.id === "ask" && ask.removedCount === 3 && !!ask.fadeRemoved && !!ask.askRemaining && !!ask.requiresTap, "THE BUG CHECK: the tray only starts fading exactly AT the ask step, not before - round-13 ask");
  const reveal = steps[6];
  assert(reveal.id === "reveal" && reveal.revealAnswer && !!reveal.askRemaining, "reveal step shows the answer, MCQ area stays visually settled");
  assert(steps.slice(0, 5).every((s) => !s.askRemaining), "MCQ never appears before all removals are done");
}

// =================== Take away: subtrahend of 1 ===================
{
  const steps = generateTakeAwaySteps(5, 1);
  assert(steps.length === 5, "5-1 has 5 steps: intro, shown, remove-1, ask, reveal");
  assert(steps[2].tapTargetIndex === 4, "single removal targets the last (5th) object");
  assert(!steps[2].fadeRemoved && !!steps[3].fadeRemoved, "fade starts exactly at ask, even with only one removal");
}

// =================== MCQ options - deterministic, no Math.random (shared by both concepts' MCQs) ===================
{
  const optsA = generateNumberOptions(5);
  const optsB = generateNumberOptions(5);
  assert(JSON.stringify(optsA) === JSON.stringify(optsB), "THE BUG CHECK: options are deterministic for the same correct answer (no Math.random) - stepping back and forward must not reshuffle them");
  assert(optsA.includes(5), "the correct answer is always among the options");
  assert(new Set(optsA).size === optsA.length, "no duplicate options");
  assert(optsA.length === 3, "exactly 3 options");
  const opts0 = generateNumberOptions(0);
  assert(opts0.every((v) => v >= 0), "no negative distractors even when correct answer is 0");
}

console.log("\nSTAGE1 SMOKE TEST SCRIPT COMPLETE");
