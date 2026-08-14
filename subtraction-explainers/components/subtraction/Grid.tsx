"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { isPlaceCollapsed, isPlaceHighlighted, isRowVisible } from "@/lib/subtraction/visibility";
import { joinWithAnd, pl, placeValueLabel } from "@/lib/subtraction/format";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { SpeakerButton } from "@/components/shared/SpeakerButton";
import { useSubtraction } from "./SubtractionContext";
import { FocusColumnOutline } from "./FocusColumnOutline";
import { GridRow } from "./GridRow";
import { UnitDot } from "./UnitDot";

function GridHeader() {
  const { config, session, phaseObj } = useSubtraction();
  return (
    <div className="flex items-center gap-2.5 px-3 w-fit self-center min-[900px]:gap-3 min-[900px]:px-[14px]">
      {config.places.map((place) => {
        const visible = !isPlaceCollapsed(place, phaseObj, session);
        const highlighted = isPlaceHighlighted(place, phaseObj);
        return (
          // Collapse/expand geometry has to match GridCell's wrapper in GridRow exactly (same
          // maxWidth/marginLeft targets, same transition), or the header visibly drifts out of
          // alignment with its column while a place fades in/out - a `min-width` class on THIS
          // same element would fight the `max-width` collapse (min-width always wins the CSS
          // conflict, so the box could never actually reach 0), which is why the min-width lives
          // on the INNER label div below instead, exactly mirroring how GridRow keeps GridCell's
          // own min-width off of ITS collapsing wrapper.
          <div
            key={place}
            data-row="header"
            data-place={place}
            aria-hidden={!visible}
            style={{
              transition: "opacity 300ms ease-in-out, max-width 300ms ease-in-out, margin-left 300ms ease-in-out",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              maxWidth: visible ? 260 : 0,
              marginLeft: visible ? 0 : -10,
              pointerEvents: visible ? "auto" : "none",
            }}
          >
            <div
              className={cn(
                "font-mono text-[11px] font-bold tracking-wide uppercase text-center min-w-[104px] min-[900px]:min-w-[130px] rounded px-1 py-0.5 -mx-1 transition-colors duration-300",
                highlighted ? "text-accent bg-accent/10" : place === "hundreds" ? "text-hundred" : place === "tens" ? "text-ten" : "text-one",
              )}
            >
              {placeValueLabel(place)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Both callouts below live INSIDE the scaled workarea and are action/result-oriented, not
// scene-setting prose - the hide-instruction-text toggle must never affect them (round-18: "the
// instruction toggle SHOULD NOT AFFECT THE TEXT INSIDE THE WORKAREA").

function TakePrompt({ place }: { place: "hundreds" | "tens" | "ones" }) {
  const { session } = useSubtraction();
  const digit = session.own[place].take;
  const text = `Tap to take away ${digit} ${pl(digit, place)}.`;
  return (
    <div className="font-serif italic text-[15px] text-used text-center px-3.5 py-2 mt-2 bg-used-bg rounded-[10px] border border-used/20 flex items-center justify-center gap-2">
      <SpeakerButton text={text} className="!w-6 !h-6 border-used/30 text-used" />
      <span>
        Tap to take away <strong className="font-mono not-italic font-bold">{digit} {pl(digit, place)}</strong>
      </span>
    </div>
  );
}

function ResultCallout() {
  const { config, session } = useSubtraction();
  const parts = config.places.map((place) => {
    const result = session.own[place].start - session.own[place].take;
    return `${result} ${pl(result, place)}`;
  });
  const text = `${joinWithAnd(parts)} = ${session.total}.`;
  return (
    <div className="font-serif italic text-[16px] text-ink text-center px-4 py-2.5 bg-left-bg rounded-xl border border-left/25 flex items-baseline justify-center gap-1.5 flex-wrap mt-2.5">
      <SpeakerButton text={text} className="!w-6 !h-6 self-center" />
      <span>{joinWithAnd(parts)}</span>
      <span>=</span>
      <strong className="font-mono not-italic font-bold text-left">{session.total}</strong>
    </div>
  );
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function rectOf(el: Element | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/** The regroupAnnounce "not enough, unpack!" callout, portaled to document.body - the column's
 * own collapse-transition wrapper (see GridRow.tsx) sets overflow:hidden, which clips anything
 * that visually extends past its own place cell, and this callout MUST sit below the start cell
 * to point an arrow up at it - inset positioning (the fix used for the counting badge in
 * GridCell.tsx) can't work here, so it escapes the clip via a portal instead, same reasoning as
 * FocusColumnOutline. Short-lived (~900ms, only during regroupAnnounce's 'compare' beat) and the
 * target cell is never mid-transition at that point (narrowing already settled well before
 * compare fires), so a single un-delayed measure is enough - no 360ms settle guard needed here. */
function NotEnoughCallout({ place, active }: { place: "hundreds" | "tens" | "ones" | null; active: boolean }) {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!active || !place) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-row="start"][data-place="${place}"]`);
    setRect(rectOf(el));
  }, [active, place]);

  if (!active || !rect || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden
      className="flex flex-col items-center gap-0.5"
      style={{
        position: "fixed",
        left: rect.left,
        top: rect.top + rect.height + 6,
        width: rect.width,
        zIndex: 500,
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-used text-base leading-none"
      >
        ↑
      </motion.div>
      <div className="font-mono text-[10px] font-bold text-used bg-used-bg border border-used/30 rounded-full px-2 py-0.5 whitespace-nowrap">
        Not enough. Unpack!
      </div>
    </div>,
    document.body,
  );
}

/** `countCue` is now owned by SubtractionWalkthrough (not local to Grid) - AnswerCard needs the
 * SAME cue to flash its own minuend/subtrahend digits in sync with Grid's dot-counting sequence
 * (round-23: the digit display moved out of Grid entirely, into AnswerCard, so whatever used to
 * drive GridCell's compareFlash now has to reach AnswerCard instead - lifting the state to their
 * shared parent is simpler than threading it sideways between siblings). */
export function Grid({ countCue }: { countCue: { row: "take" | "start" | "compare"; index?: number } | null }) {
  const { session, dispatch, phaseObj } = useSubtraction();
  const { wrapRef, workspaceRef, scale, origin } = useFitWorkspace([
    session.phaseIdx,
    phaseObj.type,
    phaseObj.place,
    session.removed,
    session.own,
  ]);
  const sourceRef = useRef<HTMLDivElement>(null);
  const [flying, setFlying] = useState<{
    from: Rect;
    to: Rect;
    type: "hundreds" | "tens" | "ones";
    dest: "hundreds" | "tens" | "ones";
  } | null>(null);

  // The regroup mutation (the +10 units actually appearing in the destination column) is
  // deferred until the fly-clone finishes arriving and fading out - so the new units never show
  // up before the animation completes. The tapped source block is hidden immediately (imperative
  // style, not state) so it visually leaves the moment it's tapped, matching everything else
  // staying at its pre-regroup count until the flight lands.
  //
  // The commit is driven by a plain setTimeout matching the animation's own duration, NOT by
  // Framer Motion's onAnimationComplete callback - that callback depends on real rAF/compositor
  // ticks, which stop firing whenever the tab isn't actively painting (backgrounded, minimized,
  // reduced-motion edge cases), which would leave this progression-critical commit stuck forever.
  // A timer fires regardless of whether a frame was ever painted.
  const FLY_DURATION_MS = 600;
  function handleTapRegroup() {
    const dest = phaseObj.place as "hundreds" | "tens" | "ones";
    const from = session.regroupPlan[dest].from!;
    const sourceEl = sourceRef.current;
    const fromRect = rectOf(sourceEl);
    const toRect = rectOf(workspaceRef.current?.querySelector(`[data-row="start"][data-place="${dest}"]`) ?? null);
    if (!fromRect || !toRect) {
      dispatch({ type: "COMMIT_REGROUP", place: dest });
      return;
    }
    if (sourceEl) sourceEl.style.visibility = "hidden";
    setFlying({ from: fromRect, to: toRect, type: from, dest });
  }

  useEffect(() => {
    if (!flying) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "COMMIT_REGROUP", place: flying.dest });
      setFlying(null);
    }, FLY_DURATION_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flying]);

  // Round-24 intro sequence: "the container which has the numeric representation should be the
  // same size as the workarea - workarea need not be visible now" - Grid stays MOUNTED (its refs/
  // layout-effect state need continuity) but collapses to zero width and fades out at 'intro',
  // leaving AnswerCard the whole row's space; the moment 'intro' ends, both flip back
  // simultaneously (`layout` on both this and AnswerCard's own root animates the width change,
  // this element's own `animate.opacity` fades it back in over the same duration).
  const isIntro = phaseObj.type === "intro";

  return (
    <motion.div
      id="workspace-wrap"
      ref={wrapRef}
      layout
      animate={{ opacity: isIntro ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className={cn(
        "min-h-0 bg-card border border-line rounded-2xl relative flex justify-center",
        isIntro ? "flex-[0_0_0px] overflow-hidden pointer-events-none" : "flex-1",
        origin === "center"
          ? "overflow-hidden items-center"
          : "overflow-y-auto overflow-x-hidden items-start",
      )}
    >
      <div
        id="workspace"
        ref={workspaceRef}
        className="flex flex-col gap-2.5 py-3"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: origin === "center" ? "center center" : "top center",
        }}
      >
        <GridHeader />
        {isRowVisible("start", phaseObj.type) && (
          <GridRow rowKey="start" regroupSourceRef={sourceRef} onTapRegroup={handleTapRegroup} countCue={countCue} />
        )}
        {isRowVisible("take", phaseObj.type) && <GridRow rowKey="take" countCue={countCue} />}
        {isRowVisible("result", phaseObj.type) && <GridRow rowKey="result" />}
        {phaseObj.type === "drag" && phaseObj.place && <TakePrompt place={phaseObj.place} />}
        {phaseObj.type === "reveal" && <ResultCallout />}
      </div>

      <FocusColumnOutline />
      <NotEnoughCallout place={phaseObj.place} active={countCue?.row === "compare"} />

      {flying &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            initial={{ left: flying.from.left, top: flying.from.top, scale: 1, opacity: 1 }}
            animate={{
              left: flying.to.left + flying.to.width / 2 - flying.from.width / 2,
              top: flying.to.top + flying.to.height / 2 - flying.from.height / 2,
              scale: 0.25,
              opacity: 0.1,
            }}
            transition={{ duration: FLY_DURATION_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: "fixed",
              width: flying.from.width,
              height: flying.from.height,
              zIndex: 300,
              pointerEvents: "none",
            }}
          >
            <UnitDot place={flying.type} />
          </motion.div>,
          document.body,
        )}
    </motion.div>
  );
}
