"use client";

import { cn } from "@/lib/utils";
import type { Place } from "@/lib/addition/types";
import { destPlace, placeCountColorClass } from "@/lib/addition/pack";
import { isColumnOpen } from "@/lib/addition/visibility";
import { useAddition } from "./AdditionContext";
import { useDragPointerDown } from "./DragDropContext";
import { UnitDot } from "./UnitDot";

const CELL_BASE =
  "flex flex-col items-center gap-1.5 px-2 py-1.5 rounded-lg w-[114px] shrink-0 min-[900px]:w-[190px] min-[900px]:gap-1.5 min-[900px]:px-3 min-[900px]:py-1.5";

/** Sits between the column-labels header and the num1 row - the carried-in pack's real home
 * from the moment it lands (see PackPrompt's "move" stage, which now flies here instead of into
 * the still-hidden destination total cell) until it's dragged into the total.
 *
 * Each cell's WRAPPER WIDTH uses `isColumnOpen` - the SAME check GridHeader/GridRow use - not
 * `carryIn[place] > 0` alone. Real bug this fixes: with an independent width rule, this row could
 * have a DIFFERENT number of collapsed columns before its visible content than the other rows do
 * (e.g. only hundreds collapsed here vs both hundreds AND tens collapsed in header/num1/num2/
 * total while ones is the active place) - collapsed columns consume ~0px regardless of how many
 * there are, so the carry's real column and whatever OTHER column happened to be the sole open
 * one elsewhere landed at nearly the same x-coordinate by coincidence, reading as "the carry is
 * sitting above ones" - mathematically nonsensical. Locking width to the shared `isColumnOpen`
 * check keeps every row's collapse state in lockstep, so a carry can only ever align with its
 * OWN real place. The cell's CONTENT (numeral + pack) still only renders when `carryIn > 0`. */
export function CarryRow() {
  const { session, config, phaseObj } = useAddition();

  return (
    <div className="flex items-center gap-2.5 px-3 min-[900px]:gap-3 min-[900px]:px-5">
      {config.places.map((place) => {
        const open = isColumnOpen(place, phaseObj, config, session);
        return (
          <div
            key={place}
            aria-hidden={!open}
            style={{
              transition: "opacity 300ms ease-in-out, max-width 300ms ease-in-out, margin-left 300ms ease-in-out",
              overflow: "hidden",
              opacity: open ? 1 : 0,
              maxWidth: open ? 200 : 0,
              marginLeft: open ? 0 : -10,
              pointerEvents: open ? "auto" : "none",
            }}
          >
            <CarryCell place={place} />
          </div>
        );
      })}
    </div>
  );
}

function CarryCell({ place }: { place: Place }) {
  const { session, phaseObj } = useAddition();
  const onPointerDown = useDragPointerDown();
  const dragged = session.carryDragged[place];
  const isOwnTurn = phaseObj.type === "drag" && phaseObj.place === place;
  // "Then highlight the carry over number and its visual similarly" - during bridgecarry-<place>,
  // THIS is the carry being pointed at (BridgeArrow connects it to its panel numeral) only when
  // `place` is the destination of whatever place is finishing up.
  const isBridgeCarryTarget =
    phaseObj.type === "bridgecarry" && phaseObj.place != null && destPlace(phaseObj.place) === place;
  const emphasized = isOwnTurn || isBridgeCarryTarget;
  const canDrag = onPointerDown !== null && isOwnTurn && !session.awaitingPack[place] && !dragged;
  const hasCarry = session.carryIn[place] > 0;

  // The wrapper can now be open purely because isPlaceVisible says so (e.g. full-view phases
  // like focus/compare/bridge, or this place's own turn) even when it holds no carry - render
  // nothing rather than a "0" numeral and an empty pack in that case.
  if (!hasCarry) {
    return <div data-row="carry" data-place={place} className={CELL_BASE} />;
  }

  return (
    <div data-row="carry" data-place={place} className={CELL_BASE}>
      <div className={cn("font-mono text-[14px] font-semibold min-[900px]:text-[20px]", placeCountColorClass(place))}>
        {session.carryIn[place]}
      </div>
      <div className="flex flex-wrap gap-1 justify-center content-start min-h-5 max-w-full min-[900px]:gap-1.5 min-[900px]:min-h-8">
        <UnitDot
          place={place}
          ghost={dragged}
          draggable={canDrag}
          className={!dragged && !emphasized ? "opacity-50" : undefined}
          onPointerDown={canDrag ? (e) => onPointerDown!(e, place, "carry", 0) : undefined}
        />
      </div>
    </div>
  );
}
