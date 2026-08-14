"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnswerCard } from "./AnswerCard";

/** Wraps AnswerCard so it can smoothly collapse away (not just vanish) whenever the workarea
 * itself is already showing the equation in the same big-numeral style - two copies of "12 ÷ 3"
 * on screen at once (one in the header, one highlighted in the canvas) is confusing/redundant, so
 * only one is ever visible: this header card while the workarea's own equation is NOT showing, and
 * vice versa. `show` is computed per-phase by each stage's Walkthrough. */
export function AnswerCardSlot({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="answer-card"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: "hidden" }}
        >
          <AnswerCard>{children}</AnswerCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
