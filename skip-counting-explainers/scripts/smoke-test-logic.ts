import { SKIP_COUNTING_CONFIG } from "../lib/skip-counting/config";
import {
  buildPhases,
  getCurrent,
  getLanded,
  getTapTargetIndex,
  getView,
  isDone,
  isInteractive,
  isInteractiveGridTap,
  isInteractiveJump,
  isRevealAnswer,
} from "../lib/skip-counting/phases";
import { createSession, skipCountingReducer } from "../lib/skip-counting/session";
import { sessionSequence } from "../lib/skip-counting/sequence";
import { buildNarration } from "../lib/skip-counting/narration";
import type { Session } from "../lib/skip-counting/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function narrationText(session: Session) {
  const phaseObj = buildPhases(session.jumps)[session.phaseIdx];
  return buildNarration(phaseObj, session)
    .map((f) => f.text)
    .join("");
}

// --- Default playthrough: 14, skip count on by 2s, 5 jumps -> 14,16,18,20,22,24 ---
// Jump 1 is passive (Next/auto); jumps 2-5 are interactive tap-the-next-number phases.
{
  let s = createSession(14, 1, 2, 5);
  const phases = buildPhases(s.jumps);
  assert(phases.length === 14, `14 phases (intro + 5 jumps + trip + pattern + 5 gridTaps + final), got ${phases.length}`);
  assert(
    phases.map((p) => p.type).join(",") ===
      "intro,jump,jump,jump,jump,jump,trip,pattern,gridTap,gridTap,gridTap,gridTap,gridTap,final",
    "phase type order",
  );

  const seq = sessionSequence(s);
  assert(seq.join(",") === "14,16,18,20,22,24", `sequence, got ${seq.join(",")}`);

  assert(narrationText(s).includes("Let's skip count from 14 in 2s"), `intro narration, got "${narrationText(s)}"`);
  assert(getView(phases[0]) === "line", "intro is line view");
  assert(getLanded(phases[0], s.jumps) === 0 && getCurrent(phases[0], s.jumps) === -1, "intro landed=0 current=-1");
  assert(!isRevealAnswer(phases[0]), "intro does not reveal answer");
  assert(!isInteractiveJump(phases[0]), "intro is not interactive");

  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 1 (passive)
  assert(!isInteractiveJump(phases[s.phaseIdx]), "jump-1 is passive, not interactive");
  assert(getLanded(phases[s.phaseIdx], s.jumps) === 1 && getCurrent(phases[s.phaseIdx], s.jumps) === 1, "jump-1 landed/current");
  assert(narrationText(s).includes("Skip over 15"), `jump-1 narration, got "${narrationText(s)}"`);
  assert(narrationText(s).includes("Land on 16"), `jump-1 skipped-number phrase, got "${narrationText(s)}"`);

  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 2 (interactive)
  assert(isInteractiveJump(phases[s.phaseIdx]), "jump-2 is interactive");
  assert(getLanded(phases[s.phaseIdx], s.jumps) === 1 && getCurrent(phases[s.phaseIdx], s.jumps) === 1, "jump-2 awaiting: landed/current still 1 (16 not yet confirmed)");
  assert(getTapTargetIndex(phases[s.phaseIdx]) === 2, "jump-2 target index is 2 (value 18)");
  assert(
    narrationText(s).includes("What number is") && narrationText(s).includes("2 more") && narrationText(s).includes("16"),
    `jump-2 ask is phrased as a question, got "${narrationText(s)}"`,
  );

  // ADVANCE_PHASE must NOT skip an interactive phase, even if dispatched directly.
  const beforeInteractiveIdx = s.phaseIdx;
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phaseIdx === beforeInteractiveIdx, "ADVANCE_PHASE is refused during an interactive tap phase");

  // Wrong tap: undershoot in the right direction - hops onto 17 instead of advancing.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 17 });
  assert(s.phaseIdx === beforeInteractiveIdx, "wrong tap does not advance the phase");
  assert(s.lastWrongTap === 17, "wrong tap recorded (hopped onto 17)");
  assert(
    narrationText(s).includes("17") && narrationText(s).includes("1 step short"),
    `undershoot feedback, got "${narrationText(s)}"`,
  );

  // While the wrong hop is showing, another tap is ignored - only RETRY (Try Again) clears it.
  const beforeIgnoredTap = s;
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 22 });
  assert(s === beforeIgnoredTap, "TAP_NUMBER ignored while a wrong-tap hop is showing");

  // Try Again resets back to awaiting a fresh tap, same phase, question re-asked.
  s = skipCountingReducer(s, { type: "RETRY" });
  assert(s.phaseIdx === beforeInteractiveIdx && s.lastWrongTap === null, "RETRY clears the hop without changing phase");
  assert(narrationText(s).includes("What number is"), `question re-asked after retry, got "${narrationText(s)}"`);

  // Wrong tap: overshoot past the target.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 22 });
  assert(
    narrationText(s).includes("22") && narrationText(s).includes("4 steps too far"),
    `overshoot feedback, got "${narrationText(s)}"`,
  );
  s = skipCountingReducer(s, { type: "RETRY" });

  // Wrong tap: wrong direction entirely (behind the current point, going forward).
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 12 });
  assert(
    narrationText(s).includes("forward") && narrationText(s).includes("16"),
    `wrong-direction feedback, got "${narrationText(s)}"`,
  );
  s = skipCountingReducer(s, { type: "RETRY" });
  assert(s.lastWrongTap === null, "RETRY clears the wrong-direction hop too");

  // Correct tap advances to jump-3 and clears the wrong-tap state.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 18 });
  assert(s.phaseIdx === beforeInteractiveIdx + 1, "correct tap advances one phase");
  assert(s.lastWrongTap === null, "correct tap clears lastWrongTap");
  assert(getLanded(phases[s.phaseIdx], s.jumps) === 2, "18 is now landed after the correct tap");
  assert(isInteractiveJump(phases[s.phaseIdx]), "now awaiting jump-3");

  // Tap the remaining jumps (3, 4, 5) correctly in sequence.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 20 }); // -> jump 4
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 22 }); // -> jump 5
  assert(getCurrent(phases[s.phaseIdx], s.jumps) === 4, "awaiting jump-5: current still 4 (22)");
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 24 }); // -> trip
  assert(phases[s.phaseIdx].type === "trip", "correct final tap reaches trip phase");
  assert(isRevealAnswer(phases[s.phaseIdx]), "trip reveals answer");
  assert(getView(phases[s.phaseIdx]) === "line", "trip is still line view");
  assert(narrationText(s).includes("Here's the whole trip: 14 → 16 → 18 → 20 → 22 → 24"), `trip narration, got "${narrationText(s)}"`);

  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // pattern (grid intro, passive)
  assert(getView(phases[s.phaseIdx]) === "grid", "pattern switches to grid view");
  assert(getCurrent(phases[s.phaseIdx], s.jumps) === -1, "pattern has no current dot");
  assert(getLanded(phases[s.phaseIdx], s.jumps) === 0, "pattern reveals nothing landed yet");
  assert(!isDone(phases[s.phaseIdx]), "pattern is not done");
  assert(!isInteractive(phases[s.phaseIdx]), "pattern intro is not itself interactive");

  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // gridTap-1 (passive, mirrors jump-1)
  assert(!isInteractiveGridTap(phases[s.phaseIdx]), "gridTap-1 is passive, not interactive");
  assert(getLanded(phases[s.phaseIdx], s.jumps) === 1, "gridTap-1 reveals the first hop (16) immediately");
  assert(getCurrent(phases[s.phaseIdx], s.jumps) === 1, "gridTap-1 highlights the first hop as current");
  assert(
    narrationText(s).includes("first jump on the grid") && narrationText(s).includes("Land on 16"),
    `gridTap-1 passive narration, got "${narrationText(s)}"`,
  );

  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // gridTap-2 (interactive)
  assert(isInteractiveGridTap(phases[s.phaseIdx]), "gridTap-2 is interactive");
  assert(getLanded(phases[s.phaseIdx], s.jumps) === 1, "gridTap-2 awaiting: still just 16 landed");
  assert(getTapTargetIndex(phases[s.phaseIdx]) === 2, "gridTap-2 target index is 2 (value 18)");
  assert(narrationText(s).includes("What number is") && narrationText(s).includes("16"), `gridTap-2 question, got "${narrationText(s)}"`);

  const beforeGridTapIdx = s.phaseIdx;
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phaseIdx === beforeGridTapIdx, "ADVANCE_PHASE is refused during an interactive gridTap phase");

  // Wrong tap on a number that's NEVER in this trip - greys out permanently.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 15 });
  assert(s.phaseIdx === beforeGridTapIdx, "wrong grid tap does not advance the phase");
  assert(s.wrongGridTaps.includes(15), "15 permanently marked wrong (never in the trip)");
  assert(s.lastWrongGridTap === 15, "15 recorded as the most recent wrong grid tap");
  assert(narrationText(s).includes("15") && narrationText(s).includes("isn't on this trip"), `not-in-trip feedback, got "${narrationText(s)}"`);

  // Wrong tap on a number that IS in this trip, just not the current target - stays tappable,
  // gets different feedback, and must NOT be added to the permanent grey list.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 20 });
  assert(!s.wrongGridTaps.includes(20), "20 (a real later answer) is NOT permanently greyed");
  assert(narrationText(s).includes("20") && narrationText(s).includes("on your trip, but not yet"), `on-trip-but-early feedback, got "${narrationText(s)}"`);

  // No Try Again needed on the grid - the very next tap can be the correct one immediately.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 18 });
  assert(s.phaseIdx === beforeGridTapIdx + 1, "correct grid tap advances one phase, no RETRY needed");
  assert(s.lastWrongGridTap === null, "correct tap clears the transient lastWrongGridTap");
  assert(s.wrongGridTaps.includes(15), "wrongGridTaps still remembers 15 after advancing");
  assert(getLanded(phases[s.phaseIdx], s.jumps) === 2, "18 is now landed on the grid");

  // Tap the remaining gridTap phases (20, 22, 24) correctly in sequence.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 20 });
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 22 });
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 24 }); // -> final
  assert(phases[s.phaseIdx].type === "final", "final grid tap reaches the final phase");
  assert(getView(phases[s.phaseIdx]) === "grid", "final is grid view");
  assert(getCurrent(phases[s.phaseIdx], s.jumps) === 5, "final highlights the last landed point");
  assert(isDone(phases[s.phaseIdx]), "final is done");
  assert(narrationText(s).includes("All done!") && narrationText(s).includes("lands on 24"), `final narration, got "${narrationText(s)}"`);
  assert(s.wrongGridTaps.join(",") === "15", "15 is still the only permanently-wrong grid cell at the end");

  // ADVANCE_PHASE past the end is a no-op
  const beforeIdx = s.phaseIdx;
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" });
  assert(s.phaseIdx === beforeIdx, "ADVANCE_PHASE clamps at the last phase");

  // GO_TO_INTRO (autoplay-restart-at-end behavior)
  s = skipCountingReducer(s, { type: "GO_TO_INTRO" });
  assert(s.phaseIdx === 0, "GO_TO_INTRO resets to phase 0");
}

// --- TAP_NUMBER is a no-op outside interactive phases ---
{
  let s = createSession(14, 1, 2, 5); // phaseIdx 0 = intro, not interactive
  const before = s;
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 16 });
  assert(s === before, "TAP_NUMBER ignored on a non-interactive phase (intro)");
}

// --- RETRY is a no-op when there's no wrong hop to clear ---
{
  let s = createSession(14, 1, 2, 5);
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 1
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 2, awaiting, no wrong tap yet
  const before = s;
  s = skipCountingReducer(s, { type: "RETRY" });
  assert(s === before, "RETRY ignored when lastWrongTap is already null");
}

// --- Count back, step 1 (single-number phrasing) ---
{
  let s = createSession(20, -1, 1, 4); // 20,19,18,17,16
  const seq = sessionSequence(s);
  assert(seq.join(",") === "20,19,18,17,16", `count-back-by-1 sequence, got ${seq.join(",")}`);
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 1
  assert(narrationText(s).includes("Count back 1") && narrationText(s).includes("Land on 19"), `step=1 back phrasing, got "${narrationText(s)}"`);

  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 2, interactive, counting back
  assert(narrationText(s).includes("1 less") && narrationText(s).includes("19"), `count-back ask prompt, got "${narrationText(s)}"`);
  // Overshoot when counting back means tapping something SMALLER than the target.
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 15 }); // target is 18; 15 is too far back
  assert(narrationText(s).includes("15") && narrationText(s).includes("3 steps too far"), `count-back overshoot feedback, got "${narrationText(s)}"`);
  s = skipCountingReducer(s, { type: "RETRY" });
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 18 });
  assert(s.lastWrongTap === null && getLanded(buildPhases(s.jumps)[s.phaseIdx], s.jumps) === 2, "correct back-tap lands on 18");
}

// --- Skip count back by 5s crossing multiple skipped numbers per jump ---
{
  let s = createSession(30, -1, 5, 3); // 30,25,20,15
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 1
  assert(narrationText(s).includes("Skip back over 29, 28, 27, 26") && narrationText(s).includes("Land on 25"), `back-by-5 skipped phrase, got "${narrationText(s)}"`);
}

// --- GO_BACK navigation, including back out of an interactive phase ---
{
  let s = createSession(14, 1, 2, 5);
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 1
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // jump 2 (interactive)
  assert(s.phaseIdx === 2, "advanced to phase 2 (jump-2, interactive)");
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 99 }); // a wrong tap first
  assert(s.lastWrongTap === 99, "wrong tap recorded before going back");
  s = skipCountingReducer(s, { type: "GO_BACK" });
  assert(s.phaseIdx === 1, "GO_BACK to phase 1 (jump-1)");
  assert(s.lastWrongTap === null, "GO_BACK clears any pending wrong-tap state");
  s = skipCountingReducer(s, { type: "GO_BACK" });
  s = skipCountingReducer(s, { type: "GO_BACK" }); // clamps at 0
  assert(s.phaseIdx === 0, "GO_BACK clamps at phase 0");
}

// --- GO_BACK out of a gridTap phase clears lastWrongGridTap but NOT wrongGridTaps ---
{
  let s = createSession(14, 1, 2, 5);
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // -> jump-1 (passive)
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // -> jump-2 (interactive)
  for (const v of [18, 20, 22, 24]) s = skipCountingReducer(s, { type: "TAP_NUMBER", value: v }); // jump-3..5 -> trip
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // -> pattern
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // gridTap-1 (passive)
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" }); // gridTap-2 (interactive)
  s = skipCountingReducer(s, { type: "TAP_NUMBER", value: 55 }); // wrong, never in trip
  assert(s.wrongGridTaps.includes(55) && s.lastWrongGridTap === 55, "55 marked wrong before going back");
  s = skipCountingReducer(s, { type: "GO_BACK" }); // -> gridTap-1 (passive)
  assert(buildPhases(s.jumps)[s.phaseIdx].type === "gridTap", "GO_BACK from gridTap-2 lands on gridTap-1");
  assert(s.lastWrongGridTap === null, "GO_BACK clears the transient lastWrongGridTap");
  assert(s.wrongGridTaps.includes(55), "GO_BACK does NOT clear the permanent wrongGridTaps list");
}

// --- RESTART replaces the whole session ---
{
  let s = createSession(14, 1, 2, 5);
  s = skipCountingReducer(s, { type: "ADVANCE_PHASE" });
  s = skipCountingReducer(s, { type: "RESTART", startVal: 90, dir: -1, step: 10, jumps: 3 });
  assert(s.phaseIdx === 0 && s.startVal === 90 && s.dir === -1 && s.step === 10 && s.jumps === 3, "RESTART resets to new values at phase 0");
  assert(s.lastWrongTap === null, "RESTART clears wrong-tap state");
  assert(s.wrongGridTaps.length === 0 && s.lastWrongGridTap === null, "RESTART clears grid wrong-tap state");
  assert(sessionSequence(s).join(",") === "90,80,70,60", `restarted sequence, got ${sessionSequence(s).join(",")}`);
}

// --- Validation ---
{
  const v = SKIP_COUNTING_CONFIG.validate;
  assert(v(14, 1, 2, 5) === null, "valid default input passes");
  assert(v(NaN, 1, 2, 5) !== null, "NaN start rejected");
  assert(v(0, 1, 2, 5) !== null, "start below 1 rejected");
  assert(v(101, 1, 2, 5) !== null, "start above 100 rejected");
  assert(v(50, 1, 2, 2) !== null, "jumps below 3 rejected");
  assert(v(50, 1, 2, 9) !== null, "jumps above 8 rejected");
  assert(v(95, 1, 2, 5) !== null, "counting on past 100 rejected"); // 95 + 2*5 = 105
  assert(v(90, 1, 2, 5) === null, "counting on to exactly 100 accepted"); // 90 + 2*5 = 100
  assert(v(5, -1, 2, 5) !== null, "counting back below 1 rejected"); // 5 - 10 = -5
  assert(v(11, -1, 2, 5) === null, "counting back to exactly 1 accepted"); // 11 - 10 = 1
}

// --- Hundred-grid pattern math sanity (mirrors HundredGridView's inPattern formula) ---
{
  function inPattern(v: number, startVal: number, step: number) {
    return (((v - startVal) % step) + step) % step === 0;
  }
  // step=10 from startVal=14 should mark 4,14,24,...,94 (i.e. every value congruent to 14 mod 10 = 4 mod 10)
  const marked: number[] = [];
  for (let v = 1; v <= 100; v++) if (inPattern(v, 14, 10)) marked.push(v);
  assert(marked.join(",") === "4,14,24,34,44,54,64,74,84,94", `step-10 pattern from 14, got ${marked.join(",")}`);
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
