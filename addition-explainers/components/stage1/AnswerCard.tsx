"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { isEquationVisible } from "@/lib/stage1/phases";
import { useStage1 } from "./Stage1Context";
import { COLOR_A, COLOR_B } from "./colors";

/** The equation card - lives INSIDE the workarea (rendered as the first child of Stage1Scene's
 * scaled workspace, not as separate page chrome above it), visible for intro/showSetA/showSetB
 * only. It's gone by the time "dragA" begins - isEquationVisible and isBoxVisible (see
 * lib/stage1/phases.ts) are phase-disjoint by construction, so the equation and the
 * workingAnswer box (AnswerBox) never show at once: both are a similarly-styled bordered card
 * with a bold number, so overlapping them would just be the same "the answer" idea shown twice.
 * Addends are tinted to match their cluster color, and the active number gets a highlighted
 * pill during its own showSetA/showSetB step - both non-text cues to "this equation part is the
 * thing appearing below right now" that don't depend on being able to read the numerals. The
 * total never resolves here - "?" stays "?" the whole time this card is visible; the real answer
 * is revealed later by the count-through animation and the final recap. */
export function AnswerCard() {
  const { session, phaseObj } = useStage1();

  if (!isEquationVisible(phaseObj)) return null;

  const highlightA = phaseObj.type === "showSetA";
  const highlightB = phaseObj.type === "showSetB";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm flex items-center justify-center gap-2"
    >
      <span className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink">
        <span
          className={cn("rounded transition-[background-color] duration-300 px-1", highlightA && "bg-accent/15")}
          style={{ color: COLOR_A }}
        >
          {session.a1}
        </span>
        {" + "}
        <span
          className={cn("rounded transition-[background-color] duration-300 px-1", highlightB && "bg-accent/15")}
          style={{ color: COLOR_B }}
        >
          {session.a2}
        </span>
        {" = "}
        <span className="text-ink-3">?</span>
      </span>
    </motion.div>
  );
}
