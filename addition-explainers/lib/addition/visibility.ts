import { isNarrowingPhase } from "./phases";
import type { AdditionConfig, PhaseObj, Place, Session } from "./types";

export function isTotalRevealed(phaseObj: PhaseObj): boolean {
  return phaseObj.type === "reveal" || phaseObj.type === "done";
}

export type TotalPlaceState = "pending" | "active";

/** A place's Total-row cell has two states: 'pending' (not reached yet - shows '?', regardless
 * of whether a carry already arrived - see below) or 'active' (currently or already processed -
 * shows loose dots/packs). Carry-in is deliberately NOT surfaced here anymore - it used to put a
 * not-yet-reached place into a dimmed "carry-preview" state showing the carried unit(s) early,
 * but that turned out to confuse the target age band (a partially-revealed column, out of turn,
 * read as "why is this here already?"). The carry itself is now shown as a plain number above
 * the working-answer panel's addend rows instead (see WorkingAnswerPanel) - the grid practices
 * strict progressive disclosure: a place's contents appear only once it's genuinely that place's
 * turn, never earlier.
 *
 * A place that's already been FULLY processed (order < currentOrder) stays 'active' regardless
 * of whether the CURRENT phase is interactive or not - e.g. during the 'focus-tens' announcement
 * step (non-interactive, full view), the ones place's real settled digit must still show, not
 * revert to '?'. The current place (order === currentOrder) is 'active' only mid drag/compare
 * (that's when its loose count is actually live/settled) - during its own focus/predict it's
 * still 'pending', on purpose (nothing to show yet, carry or not). */
export function getTotalPlaceState(
  place: Place,
  phaseObj: PhaseObj,
  session: Session,
  config: AdditionConfig,
): TotalPlaceState {
  if (isTotalRevealed(phaseObj)) return "active";
  if (!phaseObj.place) return "pending"; // intro/showA/showB - no place context at all yet
  const order = config.processingOrder.indexOf(place);
  const currentOrder = config.processingOrder.indexOf(phaseObj.place);
  if (order < currentOrder) return "active";
  const activeTypes = ["drag", "compare", "bridge", "bridgecarry"];
  if (order === currentOrder && activeTypes.includes(phaseObj.type)) {
    return "active";
  }
  return "pending";
}

/** A place's column is shown when: not mid-narrowing (full view - includes 'focus' and, for
 * stage3, 'compare'/'bridge'/'bridgecarry' - see isNarrowingPhase), or it's the place currently
 * being worked on. A later place stays hidden until it's genuinely its own turn, even once it
 * has a carry sitting in it - see getTotalPlaceState's doc comment on why the old "reveal early
 * for carry preview" behavior was removed (the carry itself still only shows in CarryRow). */
export function isPlaceVisible(place: Place, phaseObj: PhaseObj, config: AdditionConfig): boolean {
  if (!isNarrowingPhase(phaseObj, config) || !phaseObj.place) return true;
  return place === phaseObj.place;
}

/** Whether a place's column occupies real width in the grid - used by GridHeader/GridRow AND
 * CarryRow so all rows collapse/open in exact lockstep. Real bug this fixes: CarryRow used to
 * decide its OWN width purely from `carryIn[place] > 0`, independent of isPlaceVisible - when a
 * later place (say tens) held a pending carry while an EARLIER place (ones) was still narrowed
 * to just its own column, the two rows had a DIFFERENT number of collapsed siblings before their
 * visible content (CarryRow: only hundreds collapsed before tens; header/num1/num2/total: both
 * hundreds AND tens collapsed before ones) - collapsed siblings consume ~0px regardless of how
 * many there are, so both rows' visible content landed at nearly the same x-coordinate purely by
 * coincidence, making the carry read as sitting "above the ones column" - nonsensical, and
 * exactly what a sharp-eyed user will call out. Fix: a place with a pending carry is
 * STRUCTURALLY open (full column width) in every row, not just CarryRow, the moment it lands and
 * for as long as it sits there - the place's own num1/num2/total CONTENT still obeys its own
 * existing dimming/pending rules (nothing here reveals a value early), only the column's WIDTH
 * becomes consistent across rows so a carry can align with the real place it belongs to. */
export function isColumnOpen(
  place: Place,
  phaseObj: PhaseObj,
  config: AdditionConfig,
  session: Session,
): boolean {
  return isPlaceVisible(place, phaseObj, config) || session.carryIn[place] > 0;
}
