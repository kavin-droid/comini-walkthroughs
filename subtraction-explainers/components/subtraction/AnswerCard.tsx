"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buildAnswerParts } from "@/lib/subtraction/answer";
import { isPlaceActive, isPlaceCollapsed } from "@/lib/subtraction/visibility";
import type { Place } from "@/lib/subtraction/types";
import { useSubtraction } from "./SubtractionContext";

/** Matches Grid.tsx's own resize/fade transition duration - see the `introReveal` state below. */
const RESIZE_S = 0.45;

type CountCue = { row: "take" | "start" | "compare"; index?: number } | null;

/** One digit's fixed-position slot within a column - always rendered (never removed/collapsed
 * from layout, unlike Grid's own columns), only its OPACITY and highlight change. Written
 * column-arithmetic only works if every digit stays exactly where it was written; fading a column
 * away entirely would break that "arrange like on paper" alignment the whole component exists
 * for. `dimmed` reuses the SAME isPlaceCollapsed helper Grid's own GridRow/GridHeader are driven
 * by; `highlighted` uses isPlaceActive - a broader, AnswerCard-specific condition (spans a place's
 * WHOLE active period, not just the single spotlight beat isPlaceHighlighted covers for Grid's
 * own outline) since AnswerCard is now the only place a child sees the actual digits at all
 * (round-24). Both stay derived from `phaseObj`/`session`, never a second parallel state. */
function DigitSlot({
  highlighted,
  dimmed,
  big,
  className,
  textClassName,
  children,
}: {
  highlighted: boolean;
  dimmed: boolean;
  /** Matches the card's own bigger intro-mode font (see AnswerCard's `isIntro` text size) - the
   * slot's own box needs to grow with it or a 40px digit would overflow an 8px box. */
  big?: boolean;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg transition-[opacity,background-color,color,width,height] duration-300",
        big ? "w-11 h-11 min-[900px]:w-16 min-[900px]:h-16" : "w-8 h-8 min-[900px]:w-10 min-[900px]:h-10",
        highlighted && "bg-accent/10",
        className,
      )}
      style={{ opacity: dimmed ? 0.3 : 1 }}
    >
      <span className={cn("leading-none transition-colors duration-300", highlighted && "text-accent", textClassName)}>
        {children}
      </span>
    </div>
  );
}

/** A just-regrouped place's live value briefly exceeds a single digit (e.g. 12 ones) before
 * enough taps bring it back down - classic borrow notation instead of ever printing a 2-digit
 * value into a single digit's column. Animated (round-23: "the numerals are getting updated too
 * soon... we should animate and show the number striking through and the display the number
 * above it") - the strike-through is a `scaleX` line draw (not a static `line-through` decoration,
 * which can't be animated the same way) that plays FIRST, with the new value fading/popping in
 * ABOVE it right after - matching the order the request describes. Plays automatically on mount:
 * this branch only ever mounts fresh at the exact instant `value` crosses the 9 threshold (a
 * different JSX branch than the plain-digit one below), which is exactly when the regroup commits
 * - no extra timing plumbing needed, `initial`->`animate` fires precisely on cue. */
function BorrowedDigit({ value, textClassName }: { value: number; textClassName?: string }) {
  return (
    <span className="relative inline-flex flex-col items-center justify-center leading-none">
      <motion.span
        initial={{ opacity: 0, y: 6, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
        className="text-[14px] min-[900px]:text-[18px] font-bold leading-none text-accent -mb-0.5"
      >
        {value}
      </motion.span>
      <span className={cn("relative", textClassName)}>
        {value - 10}
        <motion.span
          aria-hidden
          className="absolute left-0 top-1/2 h-[2px] bg-used origin-left"
          style={{ width: "100%" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </span>
    </span>
  );
}

/** Round-24 intro sequence: at 'intro', AnswerCard fills the WHOLE workarea footprint and Grid is
 * invisible ("the container which has the numeric representation should be the same size as the
 * workarea - workarea need not be visible now"); the moment the walkthrough leaves 'intro' (into
 * 'showStart'), AnswerCard shrinks back to its normal narrow width while Grid fades in
 * simultaneously (see Grid.tsx's matching `isIntro` branch and SubtractionWalkthrough's shared
 * flex row - both sides size themselves off the SAME `phaseObj.type` check, no coordination state
 * needed beyond that). `layout` lets Framer animate the width change smoothly instead of snapping. */
export function AnswerCard({ countCue }: { countCue: CountCue }) {
  const { session, config, phaseObj } = useSubtraction();
  const answerParts = buildAnswerParts(phaseObj, session, config);
  const isIntro = phaseObj.type === "intro";

  // Round-25: "resize and workarea animation is over, [THEN] highlight the first number and then
  // fade in the visuals" - showStart/showTake's whole-row highlight used to fire the INSTANT the
  // phase changed, i.e. concurrently with the 0.45s resize (see the `layout` transition below),
  // reading as "everything happening at once" rather than a resize beat followed by a highlight
  // beat. Delayed via a plain timer (not an animation callback - see the repo-wide note on why
  // those can silently never fire in this harness) so it lands right as the resize settles.
  const [introReveal, setIntroReveal] = useState(false);
  useEffect(() => {
    if (phaseObj.type !== "showStart" && phaseObj.type !== "showTake") {
      setIntroReveal(false);
      return;
    }
    setIntroReveal(false);
    const timer = window.setTimeout(() => setIntroReveal(true), RESIZE_S * 1000);
    return () => window.clearTimeout(timer);
  }, [phaseObj.type]);

  // regroupAnnounce's decorative counting cue (see SubtractionWalkthrough) flashes the CURRENT
  // place's minuend digit red ("not enough") and subtrahend digit accent ("needed") once both
  // rows have been counted out loud - the written-notation equivalent of the same "2 < 8, not
  // enough!" beat Grid's own dots pulse through, kept in sync via the SAME cue rather than a
  // second timer that could drift out of step with it.
  const compareFlash = (place: Place) => countCue?.row === "compare" && phaseObj.place === place;

  return (
    <motion.div
      layout
      transition={{ duration: RESIZE_S, ease: "easeInOut" }}
      className={cn(
        "bg-card border border-line rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-0",
        isIntro
          ? "flex-1 px-4 py-4 min-[900px]:px-6 min-[900px]:py-6"
          : "shrink-0 px-2.5 py-2.5 min-[900px]:px-4 min-[900px]:py-3 min-[900px]:min-w-[150px]",
      )}
    >
      {/* Round-25: "there is a weird stretching of the numbers when the container resizes... just
          resize the container" - Framer's `layout` prop resizes this card via a FLIP transform
          (scale the box from its old size to its new one, then snap), and automatically
          counter-scales any DESCENDANT that is ALSO a `layout`-animated motion element so it stays
          crisp - but a plain (non-motion) child just inherits the parent's scale transform
          uncorrected, which is exactly what was visually "stretching" this digit grid (its own
          font-size ALSO jumps between isIntro's two text-size classes, compounding the effect).
          Making this its own `layout` node opts it into that same automatic counter-scaling. */}
      <motion.div
        layout
        className={cn(
          "flex flex-col items-stretch font-mono font-semibold text-ink",
          isIntro ? "text-[26px] min-[900px]:text-[40px]" : "text-[16px] min-[900px]:text-[26px]",
        )}
      >
        {/* Minuend */}
        <div className="flex justify-end">
          <span className="w-4 min-[900px]:w-6 shrink-0" aria-hidden />
          {config.places.map((place) => {
            // "Once the containers are in place, highlight the [whole] minuend" - showStart's
            // entire job IS revealing/announcing the minuend, so every place in this row
            // highlights together for that one phase, on top of isPlaceActive's normal
            // per-place tracking for every phase after it.
            const highlighted = isPlaceActive(place, phaseObj) || (phaseObj.type === "showStart" && introReveal);
            const dimmed = isPlaceCollapsed(place, phaseObj, session);
            const value = session.own[place].start;
            const flash = compareFlash(place);
            if (value > 9) {
              return (
                <DigitSlot key={place} highlighted={highlighted} dimmed={dimmed} big={isIntro}>
                  <BorrowedDigit value={value} textClassName={flash ? "text-used" : undefined} />
                </DigitSlot>
              );
            }
            return (
              <DigitSlot key={place} highlighted={highlighted} dimmed={dimmed} big={isIntro} textClassName={flash ? "text-used" : undefined}>
                {value}
              </DigitSlot>
            );
          })}
        </div>

        {/* Subtrahend */}
        <div className="flex justify-end">
          <span className="w-4 min-[900px]:w-6 shrink-0 flex items-center justify-center text-used" aria-hidden>
            −
          </span>
          {config.places.map((place) => {
            // isPlaceActive already covers predict-<place> (it's a narrowing phase), so the digit
            // itself doubles as the "how many Xs in Y" scaffold while predict asks the question -
            // same treatment GridCell's old takeDigitSpotlight gave it before the digit display
            // moved here (round-23) - with no separate special-case needed anymore (round-24).
            // showTake gets the same whole-row treatment showStart's minuend row gets above.
            const highlighted = isPlaceActive(place, phaseObj) || (phaseObj.type === "showTake" && introReveal);
            const dimmed = isPlaceCollapsed(place, phaseObj, session);
            const flash = compareFlash(place);
            return (
              <DigitSlot key={place} highlighted={highlighted} dimmed={dimmed} big={isIntro} textClassName={flash ? "text-accent" : undefined}>
                {session.own[place].take}
              </DigitSlot>
            );
          })}
        </div>

        {/* Rule */}
        <div className="h-[3px] bg-ink rounded-full mt-1 mb-1" />

        {/* Result */}
        <div className="flex justify-end">
          <span className="w-4 min-[900px]:w-6 shrink-0" aria-hidden />
          {config.places.map((place, i) => {
            const highlighted = isPlaceActive(place, phaseObj);
            const dimmed = isPlaceCollapsed(place, phaseObj, session);
            const part = answerParts[i];
            return (
              <DigitSlot
                key={place}
                highlighted={highlighted}
                dimmed={dimmed}
                big={isIntro}
                className={part.kind === "new" ? "bg-left-bg" : undefined}
              >
                <span className={cn(part.kind === "ph" && "text-ink-3 opacity-60", part.kind === "new" && "text-left")}>
                  {part.text || " "}
                </span>
              </DigitSlot>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
