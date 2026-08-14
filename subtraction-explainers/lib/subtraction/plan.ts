import { decomposeDigits } from "./digits";
import type { Place, PlaceRecord, RegroupInfo, SubtractionConfig } from "./types";

function higherOf(config: SubtractionConfig, place: Place): Place | null {
  const order = config.processingOrder;
  const idx = order.indexOf(place);
  return idx === -1 || idx === order.length - 1 ? null : order[idx + 1];
}

export type BorrowFeasibility = { ok: true } | { ok: false; reason: string };

/** Generic ones-then-tens-then-hundreds dry run: at each place, if the minuend doesn't have
 * enough to take away the subtrahend's digit, borrow exactly one unit from the next-higher place
 * (a single borrow always suffices for a 0-9 digit place). Returns whether the WHOLE pair is
 * feasible, independent of buildRegroupPlan below (used only by stage3's validate - stage2
 * rejects any regroup-needing pair outright via its own simpler check instead of this). */
export function checkBorrowFeasibility(config: SubtractionConfig, minuend: number, subtrahend: number): BorrowFeasibility {
  const m = decomposeDigits(minuend);
  const s = decomposeDigits(subtrahend);
  const blocks: PlaceRecord<number> = { ...m };
  const need: PlaceRecord<number> = { ...s };

  for (const place of config.processingOrder) {
    if (blocks[place] < need[place]) {
      const from = higherOf(config, place);
      if (!from) {
        return { ok: false, reason: "That pair needs more regrouping than this piece supports. Try a different pair of numbers." };
      }
      if (blocks[from] === 0) {
        return {
          ok: false,
          reason:
            `To take away ${need[place]} ${place} we would need to regroup a ${from.slice(0, -1)}, but the ${from} digit is 0. ` +
            `Pick a number where the ${from} digit isn't 0 when the ${place} need regrouping.`,
        };
      }
      blocks[from] -= 1;
      blocks[place] += 10;
    }
    blocks[place] -= need[place];
  }
  return { ok: true };
}

/** Dry-runs the same pass to discover WHICH places need to regroup from the place above - this
 * is deterministic and independent of any user interaction, so it's computed once up front to
 * drive the interactive phase list. Always all-false when the config doesn't allow regrouping. */
export function buildRegroupPlan(config: SubtractionConfig, minuend: number, subtrahend: number): PlaceRecord<RegroupInfo> {
  const plan: PlaceRecord<RegroupInfo> = {
    hundreds: { needsRegroup: false, from: null },
    tens: { needsRegroup: false, from: null },
    ones: { needsRegroup: false, from: null },
  };
  if (!config.allowRegroup) return plan;

  const m = decomposeDigits(minuend);
  const s = decomposeDigits(subtrahend);
  const blocks: PlaceRecord<number> = { ...m };
  const need: PlaceRecord<number> = { ...s };

  for (const place of config.processingOrder) {
    if (blocks[place] < need[place]) {
      const from = higherOf(config, place);
      if (!from) break;
      plan[place] = { needsRegroup: true, from };
      blocks[from] -= 1;
      blocks[place] += 10;
    }
    blocks[place] -= need[place];
  }
  return plan;
}
