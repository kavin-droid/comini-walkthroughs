import { isNarrowingPhase } from "./phases";
import type { PhaseObj, Place, RowKey, Session } from "./types";

/** Start row hides only during 'reveal' (difference alone); reappears on 'done' (full breakdown,
 * using the true original digits). Take row hides while removing/revealing/regrouping; reappears
 * on 'done'. Result row shows only on 'reveal'/'done'. */
export function isRowVisible(rowKey: RowKey, phaseType: PhaseObj["type"]): boolean {
  if (rowKey === "start") return phaseType !== "reveal";
  if (rowKey === "take") {
    return phaseType !== "drag" && phaseType !== "expand" && phaseType !== "reveal";
  }
  return phaseType === "reveal" || phaseType === "done"; // result
}

/** Whether a row's place cells show real numbers yet (vs a pending '?'). The take row reveals
 * its own (already-known, previously shown) digits again from 'focus' onward, including during
 * 'predict' - the digit stays visible/spotlighted as a scaffold while the child answers. */
export function isPlaceRevealed(rowKey: RowKey, phaseType: PhaseObj["type"]): boolean {
  if (rowKey === "start") return phaseType !== "intro";
  if (rowKey === "take") return phaseType !== "intro" && phaseType !== "showStart";
  return true; // result
}

/** A place's column is collapsed (narrowed away) during predict/drag/expand/regroupAnnounce -
 * except 'regroup' itself, which keeps BOTH the destination place and the place it borrows from
 * visible (the fly animation needs both columns on screen at once). */
export function isPlaceCollapsed(place: Place, phaseObj: PhaseObj, session: Session): boolean {
  if (!isNarrowingPhase(phaseObj) || !phaseObj.place) return false;
  if (phaseObj.type === "regroup") {
    const from = session.regroupPlan[phaseObj.place].from;
    return place !== phaseObj.place && place !== from;
  }
  return place !== phaseObj.place;
}

/** Whether a place is currently being "pointed at" - a highlighted digit label plus a trim/outline
 * around its cells. Round-14 feedback: this used to persist through every narrowing phase (focus
 * onward), reasoned as "one continuous highlight spanning both beats" - but once the view has
 * actually narrowed to just this place, the narrowing itself already visually isolates it, so the
 * extra highlight read as redundant clutter rather than reinforcement. Scoped to 'spotlight' ONLY
 * now - the highlight's whole job is calling out which place is about to be focused, while
 * everything is still visible; the moment focus narrows the view, the highlight's job is done. */
export function isPlaceHighlighted(place: Place, phaseObj: PhaseObj): boolean {
  return phaseObj.type === "spotlight" && phaseObj.place === place;
}

/** Whether a place is highlighted in the WORKING-ANSWER card specifically - deliberately a
 * SEPARATE, broader condition from isPlaceHighlighted above (which stays spotlight-only, still
 * governing Grid's own FocusColumnOutline exactly as before). Round-24: "since we are not showing
 * the numbers within the workarea, it is very crucial to highlight the numbers in the numeric
 * representation depending on which calculation is currently being done" - AnswerCard is now the
 * ONLY place a child can see the actual digits, so its highlight needs to span the place's WHOLE
 * active period (spotlight's announcement THROUGH every narrowing phase that place is being
 * worked on - regroupAnnounce/regroup/predict/drag/expand), not just the single spotlight beat
 * that was already visually reinforced by Grid's own column-narrowing/outline before round-23
 * removed the redundant digits that beat used to land on. */
export function isPlaceActive(place: Place, phaseObj: PhaseObj): boolean {
  if (phaseObj.place !== place) return false;
  return phaseObj.type === "spotlight" || isNarrowingPhase(phaseObj);
}
