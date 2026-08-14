"use client";

import { motion } from "framer-motion";
import { COLOR_A, COLOR_B } from "./colors";
import { Dot } from "./Dot";

/** The "workingAnswer" drop target - fades in as the equation fades out (see AnswerCard), and
 * is where every dragged dot from both sets ends up. `data-stage1-drop="box"` is the hit-test
 * target useStage1DragDrop's pointerup handler looks for. The live count updates the instant a
 * dot lands (a discrete +1, not the more ceremonial one-at-a-time recount that happens later in
 * the "count" phase - see Stage1Scene). */
export function AnswerBox({
  draggedA,
  draggedB,
  count,
  hideCount,
  highlightIndex,
}: {
  draggedA: number;
  draggedB: number;
  /** The number shown - equals draggedA+draggedB while dragging (a live running tally), but
   * during the "count" phase Stage1Scene drives this from 0 back up to the same total, one at a
   * time, in sync with `highlightIndex` - a deliberately separate, more ceremonial recount. */
  count: number;
  /** True during "predict" - the box's own number would hand the child the MCQ's answer, so the
   * dots stay visible (there's still something to look at while guessing) but the digit hides
   * behind "?" until the recount in "count" resolves it for real. */
  hideCount?: boolean;
  /** During the "count" phase, the dot currently being (re)counted pulses; -1 means none. */
  highlightIndex: number;
}) {
  return (
    <motion.div
      data-stage1-drop="box"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-2 min-[900px]:gap-3 rounded-2xl border-[3px] border-dashed border-line-2 bg-paper-2 px-4 py-3 min-[900px]:px-8 min-[900px]:py-6 min-w-[140px] min-[900px]:min-w-[220px]"
    >
      <motion.div
        key={hideCount ? "hidden" : count}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="font-mono text-[28px] min-[900px]:text-[44px] font-bold leading-none"
      >
        {hideCount ? <span className="text-ink-3">?</span> : <span className="text-ink">{count}</span>}
      </motion.div>
      <div className="flex flex-wrap justify-center gap-1.5 min-[900px]:gap-2 max-w-[200px] min-[900px]:max-w-[320px] min-h-[26px] min-[900px]:min-h-[38px]">
        {Array.from({ length: draggedA }).map((_, i) => (
          <Dot key={`a-${i}`} color={COLOR_A} small pulse={highlightIndex === i} />
        ))}
        {Array.from({ length: draggedB }).map((_, i) => (
          <Dot key={`b-${i}`} color={COLOR_B} small pulse={highlightIndex === draggedA + i} />
        ))}
      </div>
    </motion.div>
  );
}
