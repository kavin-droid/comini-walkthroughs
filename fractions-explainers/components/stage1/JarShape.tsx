"use client";

import { motion } from "framer-motion";

export const JAR_W = "clamp(100px, 16vw, 200px)";
export const JAR_ASPECT = 92 / 190;

/** The reusable jar shell + animated liquid fill (0-100), shared by JarWholeDemo (auto-pour) and
 * JarFillHalf (drag-driven) - only the caller decides what `fillPercent` should be and how it
 * changes over time. */
export function JarShape({
  fillPercent,
  fillDurationS = 0.6,
}: {
  fillPercent: number;
  fillDurationS?: number;
}) {
  return (
    <div
      className="relative rounded-[16px_16px_34px_34px] border-2 overflow-hidden shrink-0"
      style={{
        width: JAR_W,
        aspectRatio: JAR_ASPECT,
        background: "rgba(255,255,255,0.35)",
        borderColor: "var(--color-ink-3)",
      }}
    >
      <div
        className="absolute left-0 right-0 border-t-2 border-dashed"
        style={{ top: "50%", borderColor: "rgba(62,111,196,0.55)" }}
      />
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{ background: "linear-gradient(180deg, #5D95E0, var(--color-half))" }}
        animate={{ height: `${fillPercent}%` }}
        transition={{ duration: fillDurationS, ease: "easeInOut" }}
      >
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: "rgba(255,255,255,0.35)" }} />
      </motion.div>
      <div
        className="absolute top-3 left-2.5 w-2.5 rounded-full"
        style={{ height: "70%", background: "rgba(255,255,255,0.5)" }}
      />
    </div>
  );
}
