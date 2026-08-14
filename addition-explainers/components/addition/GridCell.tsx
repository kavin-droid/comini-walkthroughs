"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getLooseCount } from "@/lib/addition/session";
import { isColumnFocusPhase } from "@/lib/addition/phases";
import type { GhostedIndices, Place, PhaseObj, RowKey } from "@/lib/addition/types";
import { placeColorVar } from "@/lib/addition/pack";
import type { PackAnimState } from "@/hooks/usePackAnimation";
import { getTotalPlaceState } from "@/lib/addition/visibility";
import { useAddition } from "./AdditionContext";
import { useDragPointerDown } from "./DragDropContext";
import { UnitDot } from "./UnitDot";

const PLACE_COUNT_COLOR: Record<Place, string> = {
  hundreds: "text-hundred",
  tens: "text-ten",
  ones: "text-one",
};

/** Mobile-only: cap how many dots/packs sit in one row before wrapping ("the visuals look too
 * small [on mobile]... reduce the number of items shown per row"), instead of letting flex-wrap's
 * width-driven wrapping cram up to 9 ones dots into a single row that then has to be scaled way
 * down to fit (see useFitWorkspace) - a narrower, taller natural size lets that scale-to-fit
 * factor come out bigger. Desktop keeps the original width-driven flex-wrap unchanged (this was
 * never reported as a problem there). Applied via `MOBILE_WRAP_CLASS`/`mobileWrapStyle` below to
 * every dot-cluster container in this file, not just the one the report happened to mention -
 * see feedback-fix-design-decisions-not-just-symptoms in project memory. */
const MOBILE_WRAP_COLS: Record<Place, number> = { hundreds: 1, tens: 2, ones: 3 };

/** Grid (mobile, count-capped columns) below 900px, reverting to the original flex-wrap
 * (width-driven) at 900px+ - `mobileWrapStyle(place)` supplies the actual column count via
 * `gridTemplateColumns`, ignored once `min-[900px]:flex` takes over on desktop. */
const MOBILE_WRAP_CLASS =
  "grid gap-1 justify-center content-start min-h-5 max-w-full min-[900px]:flex min-[900px]:flex-wrap min-[900px]:gap-1.5 min-[900px]:min-h-8";

function mobileWrapStyle(place: Place): CSSProperties {
  return { gridTemplateColumns: `repeat(${MOBILE_WRAP_COLS[place]}, auto)` };
}

const CELL_BASE =
  "flex flex-col items-center gap-1.5 px-2 py-1.5 rounded-lg w-[114px] shrink-0 min-[900px]:w-[190px] min-[900px]:gap-1.5 min-[900px]:px-3 min-[900px]:py-1.5";

function Placeholder({ symbol }: { symbol: string }) {
  return (
    <div className="font-mono text-[11px] text-ink-3 px-1 py-1 min-[900px]:text-[15px]">
      {symbol}
    </div>
  );
}

/** num1/num2 addend-row opacity - a single continuous value driving ONE fade, not a hidden-vs-
 * shown swap with a separate "?" placeholder that pops in abruptly once the real content mounts.
 * "No need to show the placeholders... fade the rows along with the visuals not separately" -
 * own digits are always known (never gated on phase), so always render the real content and let
 * opacity alone carry the reveal timing, in sync with WorkingAnswerPanel's matching digit fade
 * (both driven by the same phase state, same ~300ms transition).
 *
 * The showB-dims-num1 treatment and bridge/bridgecarry (which don't exist as phases for stage2
 * at all) are stage3-only ("Update stage 3 flow" - the user's own framing) - stage2 keeps its
 * original behavior of both addends at full opacity once each is revealed, never dimmed again
 * until place-focus kicks in from `focus` onward. `intro` hides both everywhere (own digits
 * aren't introduced yet) - moot for stage3 since the grid isn't rendered at all during intro
 * there (see AdditionGrid), but stage2's grid still shows during intro. */
function addendOpacity(
  rowKey: "num1" | "num2",
  place: Place,
  phaseObj: PhaseObj,
  placeFocused: boolean,
  previewDimmed: boolean,
  allowCarry: boolean,
): number {
  if (phaseObj.type === "intro") return 0;
  if (phaseObj.type === "showA") return rowKey === "num1" ? 1 : 0;
  if (phaseObj.type === "showB") {
    if (!allowCarry) return 1;
    return rowKey === "num1" ? 0.5 : 1;
  }
  if (phaseObj.type === "bridge" || phaseObj.type === "bridgecarry") return 0.5;
  if (previewDimmed) return 0.5;
  return placeFocused && phaseObj.place !== place ? 0.5 : 1;
}

export function GridCell({
  rowKey,
  place,
  packAnim = null,
  ghostedIndices,
  dimmed = false,
}: {
  rowKey: RowKey;
  place: Place;
  packAnim?: PackAnimState | null;
  /** Only meaningful for num1/num2 rows - which specific dots have been dragged already (see
   * AdditionGrid). Total-row rendering ignores this prop entirely. */
  ghostedIndices?: GhostedIndices;
  /** True only when this place is visible purely as the pack-animation's preview backdrop (see
   * AdditionGrid's previewPlace/GridRow) - genuinely visible content still renders reduced. */
  dimmed?: boolean;
}) {
  const { session, config, phaseObj } = useAddition();
  const onPointerDown = useDragPointerDown();
  // During bridge-<place>, every OTHER place's total dims so the one being bridged (numeral +
  // visual, connected by BridgeArrow) reads as the sole focus; during bridgecarry-<place>,
  // attention has moved to the carry itself (see CarryRow), so every place's total dims.
  const bridgeDim =
    phaseObj.type === "bridgecarry" || (phaseObj.type === "bridge" && phaseObj.place !== place);

  if (rowKey === "total") {
    if (phaseObj.type === "predict" && place === phaseObj.place) {
      const own = session.own[place];
      const carry = session.carryIn[place];
      // Progressive disclosure: the carry is a plain number in WorkingAnswerPanel now, not a
      // dot-cluster here - this cell just states the equation being asked, nothing more.
      return (
        <div data-row={rowKey} data-place={place} className={CELL_BASE}>
          <div className="font-mono text-[14px] font-semibold min-[900px]:text-[20px] text-ink-3">?</div>
          <div className="font-mono text-[13px] font-semibold text-ink text-center whitespace-nowrap min-[900px]:text-[17px]">
            {own.n1} + {own.n2}
            {carry > 0 ? ` + ${carry}` : ""} = ?
          </div>
        </div>
      );
    }

    // The active pack sequence renders as real content directly in the SOURCE place's total
    // cell for its first three stages - not a synthetic overlay copy - so there's no way for
    // the highlight to drift out of alignment with the actual dots: it IS the actual container.
    // Only the final "move" stage becomes a portal overlay (see PackPrompt), since by then the
    // content needs to travel to a different cell; this cell just renders an invisible
    // placeholder in "move" so the layout doesn't jump once the real content disappears.
    if (packAnim && packAnim.source === place) {
      if (packAnim.phase === "highlight" || packAnim.phase === "fadeOut") {
        const count = getLooseCount(place, session);
        return (
          <div data-row={rowKey} data-place={place} className={CELL_BASE}>
            <div className={cn("font-mono text-[14px] font-semibold min-[900px]:text-[20px]", PLACE_COUNT_COLOR[place])}>
              {count}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: packAnim.phase === "highlight" ? 1 : 0 }}
              transition={{
                duration: packAnim.phase === "highlight" ? 0.2 : 0.3,
                ease: "easeInOut",
              }}
              className={cn(MOBILE_WRAP_CLASS, "rounded-lg")}
              style={{
                ...mobileWrapStyle(place),
                border: `3px solid ${placeColorVar(packAnim.dest)}`,
                background: `color-mix(in srgb, ${placeColorVar(packAnim.dest)} 22%, transparent)`,
              }}
            >
              {Array.from({ length: count }).map((_, i) => (
                <UnitDot key={i} place={place} glow noOutline />
              ))}
            </motion.div>
          </div>
        );
      }

      if (packAnim.phase === "fadeIn") {
        return (
          <div data-row={rowKey} data-place={place} className={CELL_BASE}>
            <motion.div
              data-pack-block
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "font-mono text-[14px] font-semibold min-[900px]:text-[20px]",
                  PLACE_COUNT_COLOR[packAnim.dest],
                )}
              >
                1
              </div>
              <div className={MOBILE_WRAP_CLASS} style={mobileWrapStyle(packAnim.dest)}>
                <UnitDot place={packAnim.dest} noOutline />
              </div>
            </motion.div>
          </div>
        );
      }

      // "move" - the real fly-target overlay (portaled, see PackPrompt) took a snapshot of the
      // fadeIn block above (numeral + pack together, see `data-pack-block`) the instant this
      // phase began, so this cell can go fully invisible without a visible handoff; it still
      // occupies its normal box to avoid a layout jump.
      return (
        <div data-row={rowKey} data-place={place} className={cn(CELL_BASE, "invisible")}>
          <div className="font-mono text-[14px] font-semibold min-[900px]:text-[20px]">1</div>
          <div className={MOBILE_WRAP_CLASS} style={mobileWrapStyle(packAnim.dest)}>
            <UnitDot place={packAnim.dest} noOutline />
          </div>
        </div>
      );
    }

    const state = getTotalPlaceState(place, phaseObj, session, config);
    if (state === "pending") {
      return (
        <div data-row={rowKey} data-place={place} className={cn(CELL_BASE, "opacity-40")}>
          <div className="font-mono text-[14px] font-semibold min-[900px]:text-[20px] text-ink-3">?</div>
          <Placeholder symbol="?" />
        </div>
      );
    }
    const count = getLooseCount(place, session);
    const glow = state === "active" && session.awaitingPack[place];
    // Tens/hundreds unit-blocks already read as their own shape (each UnitDot is a grid of tiny
    // sub-units), so an individual border around each resting block is redundant clutter - drop
    // it via noOutline, and instead wrap the whole group in one "spot" container outline - a
    // single designated slot for however many packs are sitting there, not a border per pack.
    // Ones dots are simple small squares with no such nested-container look, so they're
    // deliberately excluded from both treatments.
    const noOutline = place !== "ones";
    const groupWrap = count > 0 && place !== "ones";
    const dots = Array.from({ length: count }).map((_, i) => (
      <UnitDot key={i} place={place} glow={glow} noOutline={noOutline} />
    ));
    return (
      // Plain style-driven opacity (target value computed fresh every render), not framer-motion
      // initial/animate - this project's harness has repeatedly shown JS-driven (rAF) animations
      // can get stuck at their `initial` value indefinitely (same root cause as the documented
      // onAnimationComplete unreliability) where a declarative style+CSS-transition always at
      // least lands on the correct target value even if the glide itself doesn't render.
      <div
        data-row={rowKey}
        data-place={place}
        className={CELL_BASE}
        style={{ opacity: bridgeDim ? 0.5 : 1, transition: "opacity 300ms ease-in-out" }}
      >
        <div className={cn("font-mono text-[14px] font-semibold min-[900px]:text-[20px]", PLACE_COUNT_COLOR[place])}>
          {count}
        </div>
        <div className={MOBILE_WRAP_CLASS} style={mobileWrapStyle(place)}>
          {count === 0 ? (
            <Placeholder symbol="·" />
          ) : groupWrap ? (
            <div
              className={cn(MOBILE_WRAP_CLASS, "rounded-lg")}
              style={{
                ...mobileWrapStyle(place),
                border: `1.5px solid color-mix(in srgb, ${placeColorVar(place)} 50%, transparent)`,
                padding: "2px",
              }}
            >
              {dots}
            </div>
          ) : (
            dots
          )}
        </div>
      </div>
    );
  }

  // num1 / num2 addend rows - own digits are always known (never phase-gated), so always render
  // the real content; opacity alone (see addendOpacity) carries the reveal timing, no separate
  // "?" placeholder swap.
  const placeFocused = isColumnFocusPhase(phaseObj);
  // GridCell is only ever invoked with rowKey "num1"/"num2" here - "total" already returned
  // above, "carry" is rendered by CarryRow/CarryCell instead, never through this component.
  const addendRowKey = rowKey as "num1" | "num2";
  const opacity = addendOpacity(addendRowKey, place, phaseObj, placeFocused, dimmed, config.allowCarry);
  const own = rowKey === "num1" ? session.own[place].n1 : session.own[place].n2;
  const ghostedSet = ghostedIndices
    ? rowKey === "num1"
      ? ghostedIndices[place].n1
      : ghostedIndices[place].n2
    : undefined;
  const canDrag =
    onPointerDown !== null &&
    phaseObj.type === "drag" &&
    place === phaseObj.place &&
    !session.awaitingPack[place];

  return (
    <div
      data-row={rowKey}
      data-place={place}
      className={CELL_BASE}
      style={{ opacity, transition: "opacity 300ms ease-in-out" }}
    >
      <div className={cn("font-mono text-[14px] font-semibold min-[900px]:text-[20px]", PLACE_COUNT_COLOR[place])}>
        {own}
      </div>
      <div className={MOBILE_WRAP_CLASS} style={mobileWrapStyle(place)}>
        {own === 0 ? (
          <Placeholder symbol="·" />
        ) : (
          Array.from({ length: own }).map((_, i) => {
            const ghosted = ghostedSet?.has(i) ?? false;
            const draggableDot = canDrag && !ghosted;
            return (
              <UnitDot
                key={i}
                place={place}
                ghost={ghosted}
                draggable={draggableDot}
                onPointerDown={
                  draggableDot
                    ? (e) => onPointerDown!(e, place, rowKey, i)
                    : undefined
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
