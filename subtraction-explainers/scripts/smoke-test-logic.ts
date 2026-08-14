import { STAGE2_CONFIG, STAGE3_CONFIG } from "../lib/subtraction/config";
import { buildPhases, parsePhase } from "../lib/subtraction/phases";
import { buildRegroupPlan, checkBorrowFeasibility } from "../lib/subtraction/plan";
import { decomposeDigits } from "../lib/subtraction/digits";
import { createSession, subtractionReducer } from "../lib/subtraction/session";
import { isPlaceCollapsed, isPlaceHighlighted } from "../lib/subtraction/visibility";
import type { Session, SubtractionConfig } from "../lib/subtraction/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function currentPhase(session: Session, config: SubtractionConfig) {
  return parsePhase(buildPhases(config, session.regroupPlan)[session.phaseIdx]);
}

// =================== Stage2: 68 - 24, full playthrough (no regroup phases at all) ===================
{
  let s = createSession(STAGE2_CONFIG, 68, 24);
  const phases = buildPhases(STAGE2_CONFIG, s.regroupPlan);
  assert(
    phases.join(",") ===
      "intro,showStart,showTake,spotlight-ones,focus-ones,predict-ones,drag-ones,expand-ones,recap-ones," +
        "spotlight-tens,focus-tens,predict-tens,drag-tens,expand-tens,reveal,done",
    "stage2 phase order: every place's group starts with spotlight-<place> THEN focus-<place> " +
      "(announce+highlight, then narrow, as two separate steps), no regroup phases, and a " +
      "recap-ones full-picture pause",
  );
  assert(!s.regroupPlan.tens.needsRegroup && !s.regroupPlan.ones.needsRegroup, "stage2 regroupPlan is trivially all-false");

  // -> spotlight-ones (idx3): announced, but nothing narrowed/highlighted-collapsed yet.
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // showStart
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // showTake
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // spotlight-ones
  assert(currentPhase(s, STAGE2_CONFIG).type === "spotlight" && currentPhase(s, STAGE2_CONFIG).place === "ones", "reached spotlight-ones");
  assert(!isPlaceCollapsed("tens", currentPhase(s, STAGE2_CONFIG), s), "THE BUG CHECK: tens is NOT collapsed during spotlight-ones - narrowing hasn't happened yet");
  assert(isPlaceHighlighted("ones", currentPhase(s, STAGE2_CONFIG)), "ones IS highlighted (trim path) during spotlight-ones, even though nothing narrowed");
  assert(!isPlaceHighlighted("tens", currentPhase(s, STAGE2_CONFIG)), "tens is not highlighted during spotlight-ones");

  // -> focus-ones (idx4): NOW tens narrows away - the second, separate step.
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // focus-ones
  assert(currentPhase(s, STAGE2_CONFIG).type === "focus" && currentPhase(s, STAGE2_CONFIG).place === "ones", "reached focus-ones");
  assert(isPlaceCollapsed("tens", currentPhase(s, STAGE2_CONFIG), s), "THE BUG CHECK: tens IS collapsed once focus-ones is reached - narrowing happens one step after spotlight");
  assert(!isPlaceHighlighted("ones", currentPhase(s, STAGE2_CONFIG)), "THE BUG CHECK (round-14): highlight no longer persists into focus-ones - narrowing itself already isolates the column, so the trim path's job is done once spotlight ends");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // predict-ones
  assert(currentPhase(s, STAGE2_CONFIG).type === "predict" && currentPhase(s, STAGE2_CONFIG).place === "ones", "reached predict-ones");
  assert(s.mcqOptions.ones !== null && s.mcqOptions.ones!.includes(4), "mcq options include correct answer 4");
  assert(s.own.ones.take === 4, "ones take digit is 4");

  const beforeSelect = s;
  s = subtractionReducer(s, { type: "SELECT_PREDICTION", place: "ones", value: 4 }, STAGE2_CONFIG);
  assert(beforeSelect.phaseIdx === 5 && s.phaseIdx === 6, "SELECT_PREDICTION advances predict-ones -> drag-ones");
  assert(currentPhase(s, STAGE2_CONFIG).type === "drag" && currentPhase(s, STAGE2_CONFIG).place === "ones", "advanced to drag-ones");

  for (let i = 0; i < 4; i++) s = subtractionReducer(s, { type: "COMMIT_REMOVE", place: "ones", index: i }, STAGE2_CONFIG);
  assert(s.removed.ones.length === 4, "removed 4 ones blocks");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // expand-ones
  assert(currentPhase(s, STAGE2_CONFIG).type === "expand", "reached expand-ones");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // recap-ones
  assert(currentPhase(s, STAGE2_CONFIG).type === "recap", "reached recap-ones (full-picture pause)");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // spotlight-tens
  assert(currentPhase(s, STAGE2_CONFIG).type === "spotlight" && currentPhase(s, STAGE2_CONFIG).place === "tens", "reached spotlight-tens");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // focus-tens
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // predict-tens
  assert(s.own.tens.take === 2, "tens take digit is 2");
  s = subtractionReducer(s, { type: "SELECT_PREDICTION", place: "tens", value: 2 }, STAGE2_CONFIG);
  for (let i = 0; i < 2; i++) s = subtractionReducer(s, { type: "COMMIT_REMOVE", place: "tens", index: i }, STAGE2_CONFIG);
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // expand-tens
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // reveal
  assert(currentPhase(s, STAGE2_CONFIG).type === "reveal", "reached reveal");
  assert(s.total === 44, "68 - 24 = 44");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE2_CONFIG); // done
  const doneIdx = s.phaseIdx;
  s = subtractionReducer(s, { type: "GO_BACK" }, STAGE2_CONFIG); // reveal
  assert(s.phaseIdx === doneIdx - 1, "GO_BACK from done lands on reveal");
}

// Stage2 validation
{
  assert(STAGE2_CONFIG.validate(68, 24) === null, "68 - 24 valid (no regrouping needed)");
  assert(STAGE2_CONFIG.validate(68, 29) !== null, "68 - 29 rejected (ones would need regrouping)");
  assert(STAGE2_CONFIG.validate(9, 5) !== null, "9 - 5 rejected (minuend below two-digit minimum)");
}

// =================== Stage3: 312 - 168, cascading double regroup - same engine as stage2 ===================
// Phase order: every place's group starts with spotlight-<place> (announce+highlight, everything
// still visible) THEN focus-<place> (now narrow) THEN regroupAnnounce/regroup (announce the plan
// for this place first, then discover/fix the shortfall) - not before it.
{
  const feasibility = checkBorrowFeasibility(STAGE3_CONFIG, 312, 168);
  assert(feasibility.ok, "312 - 168 is feasible");

  const regroupPlan = buildRegroupPlan(STAGE3_CONFIG, 312, 168);
  assert(regroupPlan.ones.needsRegroup && regroupPlan.ones.from === "tens", "ones needs to regroup from tens");
  assert(regroupPlan.tens.needsRegroup && regroupPlan.tens.from === "hundreds", "tens needs to regroup from hundreds");
  assert(!regroupPlan.hundreds.needsRegroup, "hundreds needs no regroup");

  const phases = buildPhases(STAGE3_CONFIG, regroupPlan);
  assert(
    phases.join(",") ===
      "intro,showStart,showTake," +
        "spotlight-ones,focus-ones,regroupAnnounce-ones,regroup-ones,predict-ones,drag-ones,expand-ones,recap-ones," +
        "spotlight-tens,focus-tens,regroupAnnounce-tens,regroup-tens,predict-tens,drag-tens,expand-tens,recap-tens," +
        "spotlight-hundreds,focus-hundreds,predict-hundreds,drag-hundreds,expand-hundreds," +
        "reveal,done",
    "stage3 phase list = stage2's shape + regroup groups only where needed (right after that " +
      "place's own focus), + a recap after every non-last place",
  );

  let s = createSession(STAGE3_CONFIG, 312, 168);
  assert(s.own.hundreds.start === 3 && s.own.tens.start === 1 && s.own.ones.start === 2, "initial own.start is the raw minuend digits");
  assert(s.own.hundreds.take === 1 && s.own.tens.take === 6 && s.own.ones.take === 8, "own.take is the subtrahend digits");

  for (let i = 0; i < 3; i++) s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> spotlight-ones
  assert(currentPhase(s, STAGE3_CONFIG).type === "spotlight" && currentPhase(s, STAGE3_CONFIG).place === "ones", "reached spotlight-ones");
  assert(!isPlaceCollapsed("tens", currentPhase(s, STAGE3_CONFIG), s) && !isPlaceCollapsed("hundreds", currentPhase(s, STAGE3_CONFIG), s), "THE BUG CHECK: nothing collapsed yet at spotlight-ones");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> focus-ones
  assert(currentPhase(s, STAGE3_CONFIG).type === "focus" && currentPhase(s, STAGE3_CONFIG).place === "ones", "reached focus-ones");
  assert(isPlaceCollapsed("tens", currentPhase(s, STAGE3_CONFIG), s) && isPlaceCollapsed("hundreds", currentPhase(s, STAGE3_CONFIG), s), "THE BUG CHECK: tens+hundreds collapse once focus-ones is reached");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> regroupAnnounce-ones
  assert(currentPhase(s, STAGE3_CONFIG).type === "regroupAnnounce" && currentPhase(s, STAGE3_CONFIG).place === "ones", "reached regroupAnnounce-ones");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> regroup-ones
  assert(currentPhase(s, STAGE3_CONFIG).type === "regroup", "reached regroup-ones");
  s = subtractionReducer(s, { type: "COMMIT_REGROUP", place: "ones" }, STAGE3_CONFIG);
  assert(s.own.tens.start === 0 && s.own.ones.start === 12, "regroup-ones: 1 ten -> 10 ones (tens 1->0, ones 2->12)");
  assert(s.regrouped.ones, "regrouped.ones flips true after commit");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> predict-ones
  assert(s.mcqOptions.ones !== null && s.mcqOptions.ones!.includes(8), "predict-ones mcq includes correct answer 8");
  s = subtractionReducer(s, { type: "SELECT_PREDICTION", place: "ones", value: 8 }, STAGE3_CONFIG);
  assert(currentPhase(s, STAGE3_CONFIG).type === "drag" && currentPhase(s, STAGE3_CONFIG).place === "ones", "advanced to drag-ones");
  for (let i = 0; i < 8; i++) s = subtractionReducer(s, { type: "COMMIT_REMOVE", place: "ones", index: i }, STAGE3_CONFIG);
  assert(s.removed.ones.length === 8, "tapped away 8 ones blocks");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> expand-ones
  assert(currentPhase(s, STAGE3_CONFIG).type === "expand" && currentPhase(s, STAGE3_CONFIG).place === "ones", "reached expand-ones");
  assert(s.own.ones.start - s.own.ones.take === 4, "ones settles to 12 - 8 = 4");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> recap-ones
  assert(currentPhase(s, STAGE3_CONFIG).type === "recap" && currentPhase(s, STAGE3_CONFIG).place === "ones", "reached recap-ones (full-picture pause)");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> spotlight-tens
  assert(currentPhase(s, STAGE3_CONFIG).type === "spotlight" && currentPhase(s, STAGE3_CONFIG).place === "tens", "reached spotlight-tens");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> focus-tens
  assert(currentPhase(s, STAGE3_CONFIG).type === "focus" && currentPhase(s, STAGE3_CONFIG).place === "tens", "reached focus-tens");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> regroupAnnounce-tens
  assert(currentPhase(s, STAGE3_CONFIG).place === "tens" && currentPhase(s, STAGE3_CONFIG).type === "regroupAnnounce", "reached regroupAnnounce-tens");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> regroup-tens
  s = subtractionReducer(s, { type: "COMMIT_REGROUP", place: "tens" }, STAGE3_CONFIG);
  assert(s.own.hundreds.start === 2 && s.own.tens.start === 10, "regroup-tens: 1 hundred -> 10 tens (hundreds 3->2, tens 0->10)");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> predict-tens
  s = subtractionReducer(s, { type: "SELECT_PREDICTION", place: "tens", value: 6 }, STAGE3_CONFIG);
  for (let i = 0; i < 6; i++) s = subtractionReducer(s, { type: "COMMIT_REMOVE", place: "tens", index: i }, STAGE3_CONFIG);
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> expand-tens
  assert(s.own.tens.start - s.own.tens.take === 4, "tens settles to 10 - 6 = 4");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> recap-tens
  assert(currentPhase(s, STAGE3_CONFIG).type === "recap" && currentPhase(s, STAGE3_CONFIG).place === "tens", "reached recap-tens (full-picture pause)");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> spotlight-hundreds
  assert(currentPhase(s, STAGE3_CONFIG).type === "spotlight" && currentPhase(s, STAGE3_CONFIG).place === "hundreds", "reached spotlight-hundreds");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> focus-hundreds (no regroup group)
  assert(currentPhase(s, STAGE3_CONFIG).type === "focus" && currentPhase(s, STAGE3_CONFIG).place === "hundreds", "hundreds skips straight to focus (no regroup needed)");
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> predict-hundreds
  s = subtractionReducer(s, { type: "SELECT_PREDICTION", place: "hundreds", value: 1 }, STAGE3_CONFIG);
  s = subtractionReducer(s, { type: "COMMIT_REMOVE", place: "hundreds", index: 0 }, STAGE3_CONFIG);
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> expand-hundreds
  assert(s.own.hundreds.start - s.own.hundreds.take === 1, "hundreds settles to 2 - 1 = 1");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> reveal
  assert(currentPhase(s, STAGE3_CONFIG).type === "reveal", "reached reveal");
  assert(s.total === 144, "312 - 168 = 144");
  const resultH = s.own.hundreds.start - s.own.hundreds.take;
  const resultT = s.own.tens.start - s.own.tens.take;
  const resultO = s.own.ones.start - s.own.ones.take;
  assert(resultH === 1 && resultT === 4 && resultO === 4, `144 = 1 hundred, 4 tens, 4 ones, got ${resultH}/${resultT}/${resultO}`);

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> done
  assert(currentPhase(s, STAGE3_CONFIG).type === "done", "reached done");
  assert(s.original.hundreds === 3 && s.original.tens === 1 && s.original.ones === 2, "original (immutable) minuend digits preserved for the done screen");
}

// =================== Stage 3: GO_BACK regression - redoing regroup-ones must not double-borrow ===================
{
  let s = createSession(STAGE3_CONFIG, 312, 168);
  for (let i = 0; i < 6; i++) s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> regroup-ones (spotlight-ones,focus-ones,regroupAnnounce-ones,regroup-ones = 4 extra steps past showTake)
  assert(currentPhase(s, STAGE3_CONFIG).type === "regroup", "sanity: reached regroup-ones");
  s = subtractionReducer(s, { type: "COMMIT_REGROUP", place: "ones" }, STAGE3_CONFIG);
  assert(s.own.tens.start === 0 && s.own.ones.start === 12, "sanity: regroup-ones committed once");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> predict-ones

  s = subtractionReducer(s, { type: "GO_BACK" }, STAGE3_CONFIG); // dead-end skip past regroup-ones -> regroupAnnounce-ones
  assert(currentPhase(s, STAGE3_CONFIG).type === "regroupAnnounce", "GO_BACK lands on regroupAnnounce-ones");
  assert(!s.regrouped.ones, "THE BUG CHECK: regrouped.ones reset to false");
  assert(s.own.tens.start === 1 && s.own.ones.start === 2, "THE BUG CHECK: own.start restored to pre-regroup values (tens=1, ones=2)");

  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> regroup-ones
  s = subtractionReducer(s, { type: "COMMIT_REGROUP", place: "ones" }, STAGE3_CONFIG);
  assert(s.own.tens.start === 0 && s.own.ones.start === 12, "redo regroup-ones yields the same result, not double-borrowed");
}

// =================== Stage 3: target digit of exactly 0 (no regroup needed anywhere) ===================
{
  const feasibility = checkBorrowFeasibility(STAGE3_CONFIG, 250, 50);
  assert(feasibility.ok, "250 - 50 is feasible");
  const regroupPlan = buildRegroupPlan(STAGE3_CONFIG, 250, 50);
  assert(
    !regroupPlan.hundreds.needsRegroup && !regroupPlan.tens.needsRegroup && !regroupPlan.ones.needsRegroup,
    "250 - 50 needs no regrouping at all",
  );
  const phases = buildPhases(STAGE3_CONFIG, regroupPlan);
  assert(!phases.some((p) => p.startsWith("regroup")), "no regroup phases in the phase list");

  let s = createSession(STAGE3_CONFIG, 250, 50);
  for (let i = 0; i < 5; i++) s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> predict-ones (spotlight-ones,focus-ones now both precede it)
  assert(currentPhase(s, STAGE3_CONFIG).type === "predict" && currentPhase(s, STAGE3_CONFIG).place === "ones", "reached predict-ones");
  assert(s.own.ones.take === 0, "250 - 50: ones need is 0");
  s = subtractionReducer(s, { type: "SELECT_PREDICTION", place: "ones", value: 0 }, STAGE3_CONFIG);
  assert(currentPhase(s, STAGE3_CONFIG).type === "drag", "advances to drag-ones even though nothing to tap");
}

// =================== Stage 3: blocked cases ===================
{
  const f1 = checkBorrowFeasibility(STAGE3_CONFIG, 305, 8);
  assert(!f1.ok, "305 - 8 blocked (tens digit is 0 when ones need regrouping)");
  assert(STAGE3_CONFIG.validate(305, 8) !== null, "STAGE3_CONFIG.validate also rejects 305 - 8");

  const f2 = checkBorrowFeasibility(STAGE3_CONFIG, 100, 99);
  assert(!f2.ok, "100 - 99 blocked (ones need regroup but tens digit is 0)");
}

// =================== THE BUG CHECK: over-tapping past the drag target must not get stuck ===================
// A real report: tapping one block MORE than the target count (a plausible slip once a
// just-regrouped place has 10-19 blocks to count through) permanently broke the walkthrough,
// since SubtractionWalkthrough's auto-advance effect only fires when removed.length === take
// exactly, and removed only ever grows during a drag phase.
{
  let s = createSession(STAGE3_CONFIG, 312, 168);
  for (let i = 0; i < 6; i++) s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> regroup-ones
  s = subtractionReducer(s, { type: "COMMIT_REGROUP", place: "ones" }, STAGE3_CONFIG);
  s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG); // -> predict-ones
  s = subtractionReducer(s, { type: "SELECT_PREDICTION", place: "ones", value: 8 }, STAGE3_CONFIG); // -> drag-ones, target 8

  for (let i = 0; i < 12; i++) s = subtractionReducer(s, { type: "COMMIT_REMOVE", place: "ones", index: i }, STAGE3_CONFIG); // tap ALL 12 distinct indices, way past target
  assert(s.removed.ones.length === 8, "THE BUG CHECK: removed clamps at the target (8) even after 12 taps, not stuck above it");
  assert(s.own.ones.take === 8, "sanity: target itself is untouched");

  // THE BUG CHECK (round-23): "tap the 3rd block, the 3rd block must be the one that disappears" -
  // removed must record the EXACT indices tapped, not just a count, and re-tapping an
  // already-removed index must be a no-op (not double-count against the clamp).
  assert(
    JSON.stringify([...s.removed.ones].sort((a, b) => a - b)) === JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7]),
    "removed.ones holds exactly the first 8 tapped indices (0-7), not just a count",
  );
  const beforeReTap = s;
  s = subtractionReducer(s, { type: "COMMIT_REMOVE", place: "ones", index: 3 }, STAGE3_CONFIG); // re-tap an already-removed index
  assert(s === beforeReTap, "re-tapping an already-removed index is a true no-op (same session reference back)");

  // Tapping a HIGH, never-before-removed index (e.g. the 12th block, index 11) directly - out of
  // insertion order - must ghost exactly that block, not silently fall back to "whichever is
  // next by position".
  let s2 = createSession(STAGE3_CONFIG, 312, 168);
  for (let i = 0; i < 6; i++) s2 = subtractionReducer(s2, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG);
  s2 = subtractionReducer(s2, { type: "COMMIT_REGROUP", place: "ones" }, STAGE3_CONFIG);
  s2 = subtractionReducer(s2, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG);
  s2 = subtractionReducer(s2, { type: "SELECT_PREDICTION", place: "ones", value: 8 }, STAGE3_CONFIG);
  s2 = subtractionReducer(s2, { type: "COMMIT_REMOVE", place: "ones", index: 11 }, STAGE3_CONFIG);
  assert(
    s2.removed.ones.length === 1 && s2.removed.ones[0] === 11,
    "THE BUG CHECK: tapping a specific out-of-order index (11) ghosts exactly that index, not 'the first one'",
  );
}

// digitsOf3 sanity
{
  const d = decomposeDigits(305);
  assert(d.hundreds === 3 && d.tens === 0 && d.ones === 5, "decomposeDigits(305) = {hundreds:3,tens:0,ones:5}");
}

// Stage 3 session/reducer: RESTART + ADVANCE_PHASE/GO_BACK bounds
{
  let s = createSession(STAGE3_CONFIG, 342, 168);
  const phases = buildPhases(STAGE3_CONFIG, s.regroupPlan);
  const total = phases.length;
  for (let i = 0; i < total + 20; i++) s = subtractionReducer(s, { type: "ADVANCE_PHASE" }, STAGE3_CONFIG);
  assert(s.phaseIdx === total - 1, "ADVANCE_PHASE clamps at the last phase");
  for (let i = 0; i < total + 20; i++) s = subtractionReducer(s, { type: "GO_BACK" }, STAGE3_CONFIG);
  assert(s.phaseIdx === 0, "GO_BACK clamps at the first phase");
  s = subtractionReducer(s, { type: "RESTART", minuend: 312, subtrahend: 168 }, STAGE3_CONFIG);
  assert(s.minuend === 312 && s.subtrahend === 168 && s.phaseIdx === 0, "RESTART rebuilds session");
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
