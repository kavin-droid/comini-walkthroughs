"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Place, RowKey } from "@/lib/subtraction/types";
import { isPlaceRevealed } from "@/lib/subtraction/visibility";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { useSubtraction } from "./SubtractionContext";
import { UnitDot } from "./UnitDot";

/** Round-24: "above each column write the count, like we have in addition explainer" - restores
 * a per-column single-digit count above that column's own dots (addition-explainers'
 * `GridCell.tsx` does exactly this, place-colored, alongside its OWN separate WorkingAnswerPanel -
 * the same split subtraction-explainers now has with AnswerCard). This is NOT the same thing
 * round-23 removed: that was a redundant RECONSTRUCTED WHOLE NUMBER (a row-level "342" label plus
 * a same-purpose digit here) that fully duplicated AnswerCard. A single per-column count reading
 * "how many dots are in THIS pile" is additive information a written equation alone doesn't show,
 * and addition-explainers keeps both side by side deliberately. Deliberately plain/un-highlighted
 * here - round-24 also asked that highlighting stay exclusively in AnswerCard ("it is very
 * crucial to highlight the numbers in the numeric representation"), so this never reacts to
 * compareFlash/predict-spotlight the way it used to pre-round-23. */
const PLACE_COUNT_COLOR: Record<Place, string> = {
  hundreds: "text-hundred",
  tens: "text-ten",
  ones: "text-one",
};

// min-width matches the normal (<=9 dot) case exactly like before; max-width caps how wide the
// 5-per-row dot grid below can get (see dotsGridStyle) so a just-regrouped 10-19 dot cell fits a
// mobile viewport instead of forcing the whole workspace to scale down to fit an overly wide cell.
const CELL_BASE =
  "relative flex flex-col items-center gap-1.5 px-2 py-1.5 rounded-lg min-w-[104px] max-w-[260px] shrink-0 min-[900px]:min-w-[130px]";

function Placeholder({ symbol }: { symbol: string }) {
  return <div className="font-mono text-[11px] text-ink-3 px-1 py-1">{symbol}</div>;
}

/** Every place has a FIXED per-row cap, independent of how many blocks are actually being shown
 * right now - ones (small blocks) fit 5 per row on any screen. Tens/hundreds (visually bigger
 * packs) fit 3 per row on desktop but only 2 on mobile - a narrow phone viewport has much less
 * spare width for the workspace to scale into (see useFitWorkspace's MOBILE_MAX_SCALE), so 3
 * packs per row left them cramped/tiny there even after that scale-up.
 * Columns are also a FIXED PIXEL width (each place's own UnitDot footprint), not `max-content` -
 * `max-content` measures actual rendered items, so an UNFILLED track (fewer dots than the cap)
 * collapses to 0 width instead of reserving space, which would silently reintroduce the exact
 * "different widths in different rows" bug this is meant to fix (e.g. a 2-dot start-row ones grid
 * would render narrower than an 8-dot take-row ones grid, even with the same 5-column cap).
 * Fixed pixel columns keep the SAME place's column width identical across the start/take/result
 * rows no matter how many dots any one of them currently holds. */
const PLACE_ROW_CAP_DESKTOP: Record<Place, number> = { hundreds: 3, tens: 3, ones: 5 };
// Round-25: "on mobile the visuals look too small... limit 3 ones, 2 tens, 1 hundreds per row" -
// mobile's per-row cap dropped further than desktop's so a full pack row wraps sooner, letting
// useFitWorkspace's scale-up (see MOBILE_MAX_SCALE) grow each individual block bigger instead of
// cramming more of them into one narrow row.
const PLACE_ROW_CAP_MOBILE: Record<Place, number> = { hundreds: 1, tens: 2, ones: 3 };
/** Each place's own UnitDot footprint in px (hundreds: 10x10 grid of 2px units + padding/border;
 * tens: 5x2 grid of 6px units + padding/border; ones: a plain 16px square). */
const PLACE_BLOCK_WIDTH: Record<Place, number> = { hundreds: 37, tens: 42, ones: 16 };

function dotsGridStyle(place: Place, isDesktop: boolean): React.CSSProperties {
  const cap = (isDesktop ? PLACE_ROW_CAP_DESKTOP : PLACE_ROW_CAP_MOBILE)[place];
  return { gridTemplateColumns: `repeat(${cap}, ${PLACE_BLOCK_WIDTH[place]}px)` };
}

/** Round-25: "when the workarea animates in, it should be empty... after that resize and workarea
 * animation is over, highlight the first number and then fade in the visuals" - the container
 * resize/fade (Grid.tsx's own `layout`/opacity transition) runs 0-0.45s; AnswerCard's whole-row
 * highlight for showStart/showTake is now itself delayed to start right at 0.45s (see AnswerCard's
 * `introReveal` state) and takes ~0.25s to read as its own beat. This cell's own first-reveal fade
 * (count digit + dots) starts only once THAT highlight beat has had a moment to land, so the three
 * things read as sequential (resize -> highlight -> visuals) instead of overlapping. */
const FIRST_REVEAL_DELAY = 0.75;

export function GridCell({
  rowKey,
  place,
  regroupSourceRef,
  onTapRegroup,
  countingIndex,
}: {
  rowKey: RowKey;
  place: Place;
  regroupSourceRef?: React.RefObject<HTMLDivElement | null>;
  onTapRegroup?: () => void;
  /** regroupAnnounce's "count the dots out loud" cue (see Grid.tsx) - the dot at this index
   * pulses briefly as it's "counted". Only ever set on the row/place the cue currently targets. */
  countingIndex?: number;
}) {
  const { session, dispatch, phaseObj } = useSubtraction();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const revealed = isPlaceRevealed(rowKey, phaseObj.type);
  if (!revealed) {
    return (
      <div data-row={rowKey} data-place={place} className={cn(CELL_BASE, "opacity-40")}>
        <Placeholder symbol="?" />
      </div>
    );
  }

  const own =
    rowKey === "start"
      ? phaseObj.type === "done"
        ? session.original[place]
        : session.own[place].start
      : rowKey === "take"
        ? session.own[place].take
        : session.own[place].start - session.own[place].take;
  const removedIndices = rowKey === "start" && phaseObj.type !== "done" ? session.removed[place] : [];
  const removedCount = removedIndices.length;
  const remaining = own - removedCount;
  const isFinal = phaseObj.type === "reveal" || phaseObj.type === "done";

  if (isFinal || rowKey === "result") {
    return (
      <div data-row={rowKey} data-place={place} className={CELL_BASE}>
        <div className={cn("font-mono text-[14px] font-semibold min-[900px]:text-[20px]", PLACE_COUNT_COLOR[place])}>
          {remaining}
        </div>
        <div className="grid gap-1 justify-center content-start min-h-5" style={dotsGridStyle(place, isDesktop)}>
          {remaining === 0 ? (
            <Placeholder symbol="·" />
          ) : (
            Array.from({ length: remaining }).map((_, i) => <UnitDot key={i} place={place} />)
          )}
        </div>
      </div>
    );
  }

  // Stop offering taps once enough blocks are already gone - without this, one over-eager extra
  // tap past the target count would still dispatch COMMIT_REMOVE (clamped harmlessly there, see
  // session.ts), but a still-untapped block would keep LOOKING tappable (bounce animation,
  // cursor-pointer) with nothing communicating "you're done, stop tapping" to a child still
  // tapping blocks.
  const canRemove =
    rowKey === "start" &&
    phaseObj.type === "drag" &&
    place === phaseObj.place &&
    removedCount < session.own[place].take;
  const isRegroupSource =
    rowKey === "start" &&
    phaseObj.type === "regroup" &&
    !!phaseObj.place &&
    session.regroupPlan[phaseObj.place].from === place &&
    !session.regrouped[phaseObj.place];
  // This cell only ever mounts fresh the INSTANT its row's own reveal-gate first opens (showStart
  // for the start row, showTake for take) - every OTHER reveal (predict's mcq scaffold already
  // showing take digits, a regroup's +10 new dots, 'done' re-showing start) keeps its normal
  // instant-appear behavior.
  const isFirstRevealRow =
    (rowKey === "start" && phaseObj.type === "showStart") || (rowKey === "take" && phaseObj.type === "showTake");

  return (
    <div data-row={rowKey} data-place={place} className={CELL_BASE}>
      {/* Inset (top-1 right-1, never a negative offset) so it stays fully within THIS cell's own
          box - the column's collapse-transition wrapper (see GridRow.tsx) sets overflow:hidden,
          which was silently clipping an earlier -top-2/-right-2 version that stuck out past the
          cell's edge (round-18: "the counter is not visible"). The "Not enough" callout has the
          same problem but can't be inset (it must point below the cell) - see the portaled
          NotEnoughCallout in Grid.tsx instead. */}
      {countingIndex !== undefined && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute top-1 right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-hop text-white font-mono text-[11px] font-bold shadow-sm z-10"
          aria-hidden
        >
          {countingIndex + 1}
        </motion.div>
      )}
      {/* Round-25: "when the workarea animates in, it should be empty... highlight the first
          number and THEN fade in the visuals" - this count digit used to appear instantly the
          moment the row's reveal-gate opened (same render as the container's own resize/fade-in),
          so it visually "arrived with" the container instead of after it. Now shares the exact
          same first-reveal gate + delay as the dots below it, so the two fade in together, well
          after FIRST_REVEAL_DELAY (see below) has let the resize settle and AnswerCard's highlight
          land first. */}
      <motion.div
        initial={isFirstRevealRow ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: isFirstRevealRow ? FIRST_REVEAL_DELAY : 0 }}
        className={cn("font-mono text-[14px] font-semibold min-[900px]:text-[20px]", PLACE_COUNT_COLOR[place])}
      >
        {remaining}
      </motion.div>
      <div className="grid gap-1 justify-center content-start min-h-5" style={dotsGridStyle(place, isDesktop)}>
        {own === 0 ? (
          <Placeholder symbol="·" />
        ) : (
          Array.from({ length: own }).map((_, i) => {
            // Ghosts EXACTLY the block indices actually tapped (session.removed[place]), never
            // "however many have been removed so far, counted from the front" - round-23 fix, see
            // the Session.removed doc comment in types.ts for the full reasoning.
            const ghosted = removedIndices.includes(i);
            const isLast = i === own - 1;
            const tappableRemove = canRemove && !ghosted;
            const tappableRegroup = isRegroupSource && isLast;
            const isCounting = countingIndex === i;
            return (
              <motion.div
                key={i}
                initial={isFirstRevealRow ? { opacity: 0, scale: 0.4 } : false}
                animate={isCounting ? { opacity: 1, scale: [1, 1.35, 1] } : { opacity: 1, scale: 1 }}
                transition={{
                  opacity: { duration: 0.4, delay: isFirstRevealRow ? FIRST_REVEAL_DELAY + i * 0.03 : 0 },
                  scale: { duration: 0.4, ease: "easeInOut", delay: isFirstRevealRow ? FIRST_REVEAL_DELAY + i * 0.03 : 0 },
                }}
                className={cn("rounded", isCounting && "ring-2 ring-hop")}
              >
                <UnitDot
                  place={place}
                  ghost={ghosted}
                  tappable={tappableRemove || tappableRegroup}
                  ref={tappableRegroup ? regroupSourceRef : undefined}
                  id={tappableRegroup ? "regroup-source-block" : undefined}
                  onClick={
                    tappableRemove
                      ? () => dispatch({ type: "COMMIT_REMOVE", place, index: i })
                      : tappableRegroup
                        ? onTapRegroup
                        : undefined
                  }
                />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
