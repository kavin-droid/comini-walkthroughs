import { STAGE2_CONFIG, STAGE3_CONFIG } from "../lib/addition/config";
import { buildPhases, parsePhase } from "../lib/addition/phases";
import { additionReducer, createSession, getLooseCount, getPlaceTarget } from "../lib/addition/session";
import { isPlaceVisible, isColumnOpen, getTotalPlaceState } from "../lib/addition/visibility";
import type { Session, AdditionConfig } from "../lib/addition/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

function currentPhase(session: Session, config: AdditionConfig) {
  return parsePhase(buildPhases(config)[session.phaseIdx]);
}

// --- Stage2: 24 + 35, no carry, full playthrough ---
{
  const config = STAGE2_CONFIG;
  let s = createSession(24, 35, config);
  const phases = buildPhases(config);
  assert(phases.join(",") === "intro,showA,showB,focus-ones,predict-ones,drag-ones,compare-ones,focus-tens,predict-tens,drag-tens,compare-tens,reveal,done", "stage2 phase order");

  // advance to predict-ones
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // showA
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // showB
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // focus-ones
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // predict-ones
  assert(currentPhase(s, config).type === "predict" && currentPhase(s, config).place === "ones", "reached predict-ones");
  assert(s.mcqOptions.ones !== null && s.mcqOptions.ones!.includes(9), "mcq options include correct answer 9");
  assert(getPlaceTarget("ones", s) === 9, "ones target 4+5=9");

  s = additionReducer(s, { type: "SELECT_PREDICTION", place: "ones", value: 9 }, config);
  assert(currentPhase(s, config).type === "drag" && currentPhase(s, config).place === "ones", "advanced to drag-ones after MCQ select");

  // drag all 9 ones dots (4 from num1, 5 from num2)
  for (let i = 0; i < 4; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num1" }, config);
  for (let i = 0; i < 5; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num2" }, config);
  assert(s.dragged.ones === 9, "dragged 9 ones dots");
  assert(s.awaitingPack.ones === false, "no pack triggered under 10");
  assert(getLooseCount("ones", s) === 9, "loose count 9");

  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // compare-ones
  assert(currentPhase(s, config).type === "compare", "reached compare-ones");
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // focus-tens
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // predict-tens
  assert(currentPhase(s, config).place === "tens", "reached predict-tens");
  assert(getPlaceTarget("tens", s) === 5, "tens target 2+3=5");

  s = additionReducer(s, { type: "SELECT_PREDICTION", place: "tens", value: 5 }, config);
  for (let i = 0; i < 2; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "num1" }, config);
  for (let i = 0; i < 3; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "num2" }, config);
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // compare-tens
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // reveal
  assert(currentPhase(s, config).type === "reveal", "reached reveal");
  assert(s.sum === 59, "sum is 59");
  assert(getLooseCount("ones", s) === 9 && getLooseCount("tens", s) === 5, "final loose counts 9/5");

  // isPlaceVisible sanity at reveal: both visible
  assert(isPlaceVisible("ones", currentPhase(s, config), config), "ones visible at reveal");
  assert(isPlaceVisible("tens", currentPhase(s, config), config), "tens visible at reveal");
}

// --- Stage3: 168 + 257, double carry, verify pack + carryIn-reset bug fix ---
{
  const config = STAGE3_CONFIG;
  let s = createSession(168, 257, config);
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // showA
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // showB
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // focus-ones
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // predict-ones
  assert(getPlaceTarget("ones", s) === 15, "ones target 8+7=15");
  s = additionReducer(s, { type: "SELECT_PREDICTION", place: "ones", value: 15 }, config);

  // drag 15 ones dots -> should trigger awaitingPack at exactly 10
  for (let i = 0; i < 8; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num1" }, config);
  assert(s.awaitingPack.ones === false, "not awaiting pack yet at 8");
  for (let i = 0; i < 2; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num2" }, config);
  assert(s.dragged.ones === 10 && s.awaitingPack.ones === true, "awaiting pack at exactly 10");

  s = additionReducer(s, { type: "PACK_PLACE", place: "ones" }, config);
  assert(s.packed.ones === 1 && s.awaitingPack.ones === false, "packed ones, no longer awaiting");
  assert(s.carryIn.tens === 1, "1 ten carried into tens");

  // continue dragging remaining 5 ones
  for (let i = 0; i < 5; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num2" }, config);
  assert(s.dragged.ones === 15 && getLooseCount("ones", s) === 5, "final ones loose = 5");

  // Progressive disclosure: the tens column must stay hidden/pending while still in drag-ones,
  // even though a carry already exists - the carry is a plain number in WorkingAnswerPanel, not
  // an early reveal of the tens column's own contents in the grid.
  const dragOnesPhase = currentPhase(s, config);
  assert(dragOnesPhase.place === "ones", "still in ones phase");
  assert(getTotalPlaceState("tens", dragOnesPhase, s, config) === "pending", "tens stays pending during ones drag despite carry");
  assert(isPlaceVisible("tens", dragOnesPhase, config) === false, "tens column NOT early-visible despite carry (progressive disclosure)");
  assert(isPlaceVisible("hundreds", dragOnesPhase, config) === false, "hundreds not yet visible (no carry there)");
  // isColumnOpen is a DIFFERENT question from isPlaceVisible - WIDTH/alignment, not content
  // reveal. A place holding a pending carry must be structurally open in EVERY row (header,
  // num1/num2/total, AND CarryRow) so the carry can align with its own real column instead of
  // sliding into whichever column happens to be the sole genuinely-open one elsewhere (the real
  // "carry renders above the ones column" bug this fixes - see isColumnOpen's own doc comment).
  assert(isColumnOpen("tens", dragOnesPhase, config, s) === true, "tens column IS structurally open once its carry lands, even though isPlaceVisible still says no");
  assert(isColumnOpen("hundreds", dragOnesPhase, config, s) === false, "hundreds stays closed - no carry sitting there yet");

  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // compare-ones
  assert(isPlaceVisible("tens", currentPhase(s, config), config), "stage3 compare stays full-view (unlike stage2) - tens visible during compare-ones");

  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // bridge-ones
  assert(currentPhase(s, config).type === "bridge" && currentPhase(s, config).place === "ones", "reached bridge-ones");
  assert(getTotalPlaceState("ones", currentPhase(s, config), s, config) === "active", "ones total stays active during its own bridge step");
  assert(isPlaceVisible("tens", currentPhase(s, config), config), "bridge-ones is full-view too");

  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // bridgecarry-ones (carryIn.tens=1, so it's not auto-skipped)
  assert(currentPhase(s, config).type === "bridgecarry" && currentPhase(s, config).place === "ones", "reached bridgecarry-ones");

  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // focus-tens
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // predict-tens
  assert(getPlaceTarget("tens", s) === 12, `tens target should be 6+5+1=12, got ${getPlaceTarget("tens", s)}`);
}

console.log("\nAll assertions ran (see any FAIL above). Re-checking stage3 tens target explicitly below.");

// Separate isolated check of the tens-target arithmetic (168's tens digit=6, 257's tens digit=5, carry=1 => 12)
// and the real GO_BACK/carryIn double-increment regression (fixed in the vanilla 23rd round).
{
  const config = STAGE3_CONFIG;
  assert(
    buildPhases(config).join(",") ===
      "intro,showA,showB,focus-ones,predict-ones,drag-ones,compare-ones,bridge-ones,bridgecarry-ones," +
        "focus-tens,predict-tens,drag-tens,compare-tens,bridge-tens,bridgecarry-tens," +
        "focus-hundreds,predict-hundreds,drag-hundreds,compare-hundreds,bridge-hundreds,reveal,done",
    "stage3 phase order includes bridge/bridgecarry per place, no bridgecarry for the last place (hundreds)",
  );

  let s = createSession(168, 257, config);
  for (let i = 0; i < 4; i++) s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // predict-ones
  s = additionReducer(s, { type: "SELECT_PREDICTION", place: "ones", value: 15 }, config);
  for (let i = 0; i < 8; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num1" }, config);
  for (let i = 0; i < 2; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num2" }, config);
  s = additionReducer(s, { type: "PACK_PLACE", place: "ones" }, config);
  for (let i = 0; i < 5; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "ones", rowKey: "num2" }, config);
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // compare-ones
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // bridge-ones
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // bridgecarry-ones
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // focus-tens
  s = additionReducer(s, { type: "ADVANCE_PHASE" }, config); // predict-tens
  assert(getPlaceTarget("tens", s) === 12, `tens target should be 6+5+1=12, got ${getPlaceTarget("tens", s)}`);
  assert(s.dragged.tens === 0, `dragged.tens must NOT be pre-seeded with the carry anymore, got ${s.dragged.tens}`);
  assert(s.carryDragged.tens === false, `carry not yet dragged, got ${s.carryDragged.tens}`);

  // Drag tens own digits (6 + 3 of 5) then explicitly drag the carry pack itself (rowKey
  // "carry") - the carry is no longer silently pre-counted, it's a real draggable unit sitting
  // in its own carry row that must be dragged in just like any other dot/pack.
  s = additionReducer(s, { type: "SELECT_PREDICTION", place: "tens", value: 12 }, config);
  for (let i = 0; i < 6; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "num1" }, config);
  assert(s.dragged.tens === 6, `expected 6 dragged (own n1 only), got ${s.dragged.tens}`);
  for (let i = 0; i < 3; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "num2" }, config);
  assert(s.dragged.tens === 9 && s.awaitingPack.tens === false, `expected 9 dragged, not yet awaiting pack, got dragged=${s.dragged.tens} awaiting=${s.awaitingPack.tens}`);
  s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "carry" }, config);
  assert(s.carryDragged.tens === true, "carryDragged flips true once the carry pack itself is dragged");
  assert(s.dragged.tens === 10 && s.awaitingPack.tens === true, `expected awaitingPack at exactly 10 after dragging the carry pack, got dragged=${s.dragged.tens} awaiting=${s.awaitingPack.tens}`);

  s = additionReducer(s, { type: "PACK_PLACE", place: "tens" }, config);
  assert(s.packed.tens === 1, `expected 1 tens-pack, got ${s.packed.tens}`);
  assert(s.carryIn.hundreds === 1, `expected 1 hundred carried, got ${s.carryIn.hundreds}`);

  // --- The actual regression: GO_BACK to predict-tens (re-entering resets tens' place state,
  // which must ALSO zero carryIn.hundreds - the bug was that it didn't, so redoing the pack
  // below would leave carryIn.hundreds at 2 instead of 1). ---
  s = additionReducer(s, { type: "GO_BACK" }, config); // drag-tens is a dead end, skips to predict-tens
  assert(currentPhase(s, config).type === "predict" && currentPhase(s, config).place === "tens", `GO_BACK should land on predict-tens, got ${JSON.stringify(currentPhase(s, config))}`);
  assert(s.carryIn.hundreds === 0, `re-entering predict-tens must zero carryIn.hundreds, got ${s.carryIn.hundreds}`);
  assert(s.packed.tens === 0 && s.dragged.tens === 0, `tens place state reset (packed=0, dragged=0 - carry no longer pre-seeded), got packed=${s.packed.tens} dragged=${s.dragged.tens}`);
  assert(s.carryDragged.tens === false, `carryDragged reset on re-entering predict-tens, got ${s.carryDragged.tens}`);

  // Redo the exact same drag+pack sequence, including the explicit carry drag.
  s = additionReducer(s, { type: "SELECT_PREDICTION", place: "tens", value: 12 }, config);
  for (let i = 0; i < 6; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "num1" }, config);
  for (let i = 0; i < 3; i++) s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "num2" }, config);
  s = additionReducer(s, { type: "COMMIT_DRAG", place: "tens", rowKey: "carry" }, config);
  s = additionReducer(s, { type: "PACK_PLACE", place: "tens" }, config);
  assert(s.carryIn.hundreds === 1, `THE BUG: redoing the pack after GO_BACK must yield exactly 1 hundred carried, not 2 - got ${s.carryIn.hundreds}`);
}

console.log("\nSMOKE TEST SCRIPT COMPLETE");
