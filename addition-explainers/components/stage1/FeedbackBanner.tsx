"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Shown once the "count" phase's one-at-a-time recount finishes (see Stage1Scene) - compares
 * the child's earlier guess to the real, just-counted total. Purely informative, never blocks
 * progress (see Footer - "count" isn't gated like dragA/dragB/predict are). */
export function FeedbackBanner({ correct, sum, guess }: { correct: boolean; sum: number; guess: number | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "mx-3 rounded-lg border px-3 py-2 font-mono text-[13px] text-center min-[900px]:mx-5 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[17px]",
        correct ? "bg-left/10 border-left/30 text-left" : "bg-accent/10 border-accent/30 text-accent",
      )}
    >
      {correct ? <>Yes! {sum} dots.</> : <>You said {guess ?? "?"}. It is {sum}.</>}
    </motion.div>
  );
}
