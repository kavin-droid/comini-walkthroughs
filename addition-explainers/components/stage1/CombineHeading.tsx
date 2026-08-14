"use client";

import { motion } from "framer-motion";
import { useStage1 } from "./Stage1Context";

/** Sits in the exact spot AnswerCard occupies (top of the workarea) for the two phases right
 * after the equation is gone - AnswerCard is visible for intro/showSetA/showSetB only, this is
 * visible for dragA/dragB only, so the handoff between them is a clean phase-boundary swap, not
 * a hand-choreographed crossfade. It disappears again once "predict" begins (the drag mechanism
 * is done by then, nothing left to combine), matching NarrationBox/PredictPrompt's own
 * phase-based visibility split. Does NOT respect the hide-text toggle - that toggle only hides
 * narration OUTSIDE the workarea (see NarrationBox); text rendered inside the workarea itself
 * (this, AnswerCard, FeedbackBanner) stays visible regardless, same rule as PredictPrompt. */
export function CombineHeading() {
  const { phaseObj } = useStage1();
  const visible = phaseObj.type === "dragA" || phaseObj.type === "dragB";

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="shrink-0 font-serif font-semibold text-[18px] min-[900px]:text-[22px] text-ink text-center"
    >
      Let&apos;s put the dots together!
    </motion.div>
  );
}
