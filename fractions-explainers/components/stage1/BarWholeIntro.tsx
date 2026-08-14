"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AnnotationArrow } from "./AnnotationArrow";
import { WordLabel } from "./WordLabel";

export const barPieceStyle = {
  background: "linear-gradient(155deg, var(--color-choco-2), var(--color-choco) 55%, var(--color-choco-dark))",
  borderColor: "var(--color-choco-dark)",
  boxShadow: "inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -3px 5px rgba(0,0,0,0.3)",
};

/** Step 1: a whole chocolate bar, an arrow pointing at it, and the word "Whole" - purely a
 * look-at-this beat, so it marks itself solved on mount (nothing to do here but watch). */
export function BarWholeIntro({ onSolved }: { onSolved: () => void }) {
  useEffect(() => {
    onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full" style={{ height: "clamp(180px, 34vh, 300px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[18px] border-2"
        style={{ ...barPieceStyle, width: "min(82vw, 680px)", height: "clamp(120px, 22vh, 220px)" }}
      >
        <AnnotationArrow visible className="left-1/2 -top-9" />
        <WordLabel text="Whole" visible className="left-1/2 top-[calc(100%+18px)]" />
      </motion.div>
    </div>
  );
}
