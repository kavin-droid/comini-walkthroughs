"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { isColumnFocusPhase } from "@/lib/addition/phases";
import { getTotalPlaceState } from "@/lib/addition/visibility";
import { getLooseCount } from "@/lib/addition/session";
import { destPlace } from "@/lib/addition/pack";
import type { Place, PhaseObj } from "@/lib/addition/types";
import { useAddition } from "./AdditionContext";

const PLACE_COUNT_COLOR: Record<Place, string> = {
  hundreds: "text-hundred",
  tens: "text-ten",
  ones: "text-one",
};

/** num1/num2 addend-row dimming - two DIFFERENT axes active at different times, never both at
 * once: row-based during the intro sequence (showA highlights num1 alone, showB highlights num2
 * alone, each fading in that row's own place-value breakdown in the grid), place-based
 * (`placeFocused`) from focus onward same as everywhere else in this panel. Bridge/bridgecarry
 * dim BOTH addend rows entirely - attention has moved to a settled total or carry, not the raw
 * addends anymore. This whole redesigned intro sequence is stage3-only ("Update stage 3 flow" -
 * the user's own framing) - stage2 keeps its original neutral showA/showB (both always full
 * opacity, only PLACE-based dimming from focus onward), so `allowCarry` gates every branch here. */
function isAddendDimmed(
  rowKey: "num1" | "num2",
  place: Place,
  phaseObj: PhaseObj,
  placeFocused: boolean,
  allowCarry: boolean,
): boolean {
  if (allowCarry) {
    if (phaseObj.type === "showA") return rowKey === "num2";
    if (phaseObj.type === "showB") return rowKey === "num1";
    if (phaseObj.type === "bridge" || phaseObj.type === "bridgecarry") return true;
  }
  return placeFocused && phaseObj.place !== place;
}

/** Total-row digit dimming: during bridge-<place>, only THAT place's own settled total stays
 * full opacity (BridgeArrow connects it to its grid visual); during bridgecarry-<place>,
 * attention has moved to the carry (see isCarryDimmed) so every total dims. Otherwise unchanged
 * from the existing place-focus behavior. */
function isTotalDimmed(place: Place, phaseObj: PhaseObj, placeFocused: boolean): boolean {
  if (phaseObj.type === "bridge") return phaseObj.place !== place;
  if (phaseObj.type === "bridgecarry") return true;
  return placeFocused && phaseObj.place !== place;
}

/** Carry-row digit dimming - the mirror of isTotalDimmed: bridgecarry-<place> highlights only
 * the carry destPlace(place) produced, bridge-<place> dims every carry (that step is about the
 * total, not the carry). */
function isCarryDimmed(place: Place, phaseObj: PhaseObj, placeFocused: boolean): boolean {
  if (phaseObj.type === "bridgecarry") return !phaseObj.place || destPlace(phaseObj.place) !== place;
  if (phaseObj.type === "bridge") return true;
  return placeFocused && phaseObj.place !== place;
}

/** The "arithmetic representation" of the problem - digits stacked by place, paper-addition
 * style (num1 over num2 over a rule over the total, right-aligned per place), sitting to the
 * LEFT of the workarea grid (the "visual representation" - dots/packs).
 *
 * Intro is a two-beat sequence, both stages: (1) 'intro' begins with this panel at the SAME SIZE
 * as the workarea (the workarea itself is hidden the whole time, see AdditionGrid), both addends
 * shown together, neutral; (2) after a short pause (`introRevealed`, timed in AdditionWalkthrough
 * so this panel and AdditionGrid's own fade-in are driven by the exact same state, not two
 * independently-guessed timers), it shrinks to its normal docked width while the workarea fades
 * in simultaneously. THEN, once both containers are in place, 'showA' highlights num1 + fades in
 * its grid breakdown, 'showB' mirrors that for num2 - this showA/showB dimming stage stays
 * stage3-only (see isAddendDimmed), stage2 just goes straight to its normal neutral display.
 *
 * The size change is a PLAIN inline-style `flex-grow`/`flex-basis` transition, deliberately NOT
 * framer-motion's `layout`/`initial`/`animate` - confirmed live in this project's own test
 * harness that those get stuck mid-transition (same root cause as the documented
 * onAnimationComplete/opacity-initial unreliability elsewhere in this project - see
 * addition-explainers-stage1-build memory). A declarative flex-grow/flex-basis transition is
 * browser-native CSS, not a JS/rAF-driven library animation, so it doesn't share that failure
 * mode. Full-size: this panel takes ALL the shared row's width (`flexGrow:1`) while AdditionGrid
 * collapses to none; docked: this panel shrinks to its own content width (`flexGrow:0`) while
 * AdditionGrid takes the rest - exactly mirroring the original `shrink-0`/`flex-1` split, just
 * driven by state instead of static classes so it can transition between them. */
const PANEL_BASE_CLASS =
  "bg-card border border-line rounded-2xl px-3 py-3 min-[900px]:px-5 min-[900px]:py-4 grid gap-x-1 gap-y-1 min-[900px]:gap-x-2.5 min-[900px]:gap-y-1.5 place-content-center";

export function WorkingAnswerPanel() {
  const { session, config, phaseObj, introRevealed } = useAddition();
  const placeFocused = isColumnFocusPhase(phaseObj);
  const places = config.places;
  // The full-size-then-shrink intro treatment runs for both stages (see AdditionWalkthrough's
  // introRevealed effect) - only the showA/showB row-dimming that follows (isAddendDimmed) stays
  // stage3-only.
  const isIntroFullSize = phaseObj.type === "intro" && !introRevealed;
  // `max-content`, not `1fr` - `1fr` tracks fill whatever width the outer flex box gives them, so
  // during the full-size intro moment (the outer box stretched to match the workarea) the digit
  // columns would spread apart to fill that width instead of keeping their normal fixed/compact
  // spacing ("no need to have space between... fixed spacing as shown after the resizing"). With
  // content-sized tracks, the grid's own width stays constant regardless of the outer box's
  // width, and `place-content-center` (on PANEL_BASE_CLASS) centers that fixed-width block within
  // whatever extra room the outer box has.
  const gridTemplateColumns = `auto repeat(${places.length}, max-content)`;

  // Measures the panel's REAL docked (content-driven) width via an invisible clone that's ALWAYS
  // rendered at docked size, regardless of what the visible panel is currently doing - the
  // visible panel can't measure its own "natural" width while it's busy being stretched full-size.
  // Needed because `flex-basis: auto` (the obvious "shrink back to content size" CSS approach) is
  // a non-animatable keyword in every browser - a transition FROM a pixel value TO "auto" simply
  // doesn't run, confirmed live (the panel got stuck at its full-size width indefinitely). With a
  // real measured PIXEL number as the docked target instead, both transition endpoints are plain
  // lengths, which browsers DO animate reliably - this is a browser-native CSS transition, not
  // framer-motion (already confirmed unreliable in this project's own test harness for this same
  // kind of size change - see the memory note this file's own history points to).
  //
  // A plain synchronous `useLayoutEffect` measurement, NOT `ResizeObserver` - confirmed live that
  // ResizeObserver's callback never fires at all in this project's browser-automation test
  // harness (tested directly on `document.body` itself, not just this element - a harness-wide
  // gap, not a bug in this specific measurement). `useLayoutEffect` runs synchronously right after
  // DOM commit, before paint, so `getBoundingClientRect()` here is reliable with no async
  // notification queue to depend on - places.length (hence this width) is fixed per config/session
  // anyway, so a single on-mount measurement is all that's ever needed.
  const measureRef = useRef<HTMLDivElement>(null);
  const [dockedWidth, setDockedWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    setDockedWidth(el.getBoundingClientRect().width);
  }, []);

  const content = (
    <>
      {config.allowCarry && (
        <>
          <div />
          {places.map((place) => (
            <div
              key={`carry-${place}`}
              data-panel-row="carry"
              data-place={place}
              className={cn(
                "text-center font-mono text-[13px] min-[900px]:text-[16px] font-bold leading-none transition-opacity duration-300",
                PLACE_COUNT_COLOR[place],
                isCarryDimmed(place, phaseObj, placeFocused) && "opacity-30",
              )}
            >
              {session.carryIn[place] > 0 ? session.carryIn[place] : " "}
            </div>
          ))}
        </>
      )}

      <div />
      {places.map((place) => (
        <Digit
          key={`n1-${place}`}
          place={place}
          value={session.own[place].n1}
          dimmed={isAddendDimmed("num1", place, phaseObj, placeFocused, config.allowCarry)}
        />
      ))}

      <div className="font-serif text-[18px] min-[900px]:text-[26px] text-ink-3 flex items-end justify-center">+</div>
      {places.map((place) => (
        <Digit
          key={`n2-${place}`}
          place={place}
          value={session.own[place].n2}
          dimmed={isAddendDimmed("num2", place, phaseObj, placeFocused, config.allowCarry)}
        />
      ))}

      <div className="col-span-full border-t-2 border-ink-3 my-0.5" />

      <div />
      {places.map((place) => {
        const state = getTotalPlaceState(place, phaseObj, session, config);
        const value = state === "active" ? getLooseCount(place, session) : null;
        return (
          <Digit
            key={`total-${place}`}
            place={place}
            value={value}
            dimmed={isTotalDimmed(place, phaseObj, placeFocused)}
            panelRow="total"
            bold
          />
        );
      })}
    </>
  );

  return (
    <>
      <div
        className={cn(PANEL_BASE_CLASS, "self-stretch")}
        style={{
          gridTemplateColumns,
          flexGrow: isIntroFullSize ? 1 : 0,
          flexShrink: 1,
          flexBasis: isIntroFullSize ? "0%" : dockedWidth != null ? `${dockedWidth}px` : "auto",
          minWidth: isIntroFullSize ? 0 : undefined,
          transition: "flex-grow 700ms ease-in-out, flex-basis 700ms ease-in-out",
        }}
      >
        {content}
      </div>
      {/* Invisible, always-docked-size measurement clone - see dockedWidth's own comment above.
          `visibility:hidden` (not display:none) keeps it laid out/measurable; `position:fixed`
          takes it out of the real document flow entirely so it can never affect real layout or
          be seen/interacted with. */}
      <div
        ref={measureRef}
        aria-hidden
        className={cn(PANEL_BASE_CLASS, "shrink-0")}
        style={{ gridTemplateColumns, position: "fixed", top: 0, left: 0, visibility: "hidden", pointerEvents: "none", zIndex: -1 }}
      >
        {content}
      </div>
    </>
  );
}

function Digit({
  place,
  value,
  dimmed,
  panelRow,
  bold,
}: {
  place: Place;
  value: number | null;
  dimmed: boolean;
  /** Tags this cell so BridgeArrow can measure it as the numeral end of the bridge - only the
   * total row needs it (the carry row tags itself directly above, num1/num2 are never a bridge
   * target). */
  panelRow?: "total";
  bold?: boolean;
}) {
  return (
    <div
      data-panel-row={panelRow}
      data-place={panelRow ? place : undefined}
      className={cn(
        "text-center font-mono leading-none transition-opacity duration-300",
        bold ? "text-[20px] min-[900px]:text-[30px] font-bold" : "text-[18px] min-[900px]:text-[27px] font-semibold",
        PLACE_COUNT_COLOR[place],
        dimmed && "opacity-30",
      )}
    >
      {value === null ? <span className="text-ink-3">?</span> : value}
    </div>
  );
}
