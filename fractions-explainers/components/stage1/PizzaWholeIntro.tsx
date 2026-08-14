"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AnnotationArrow } from "./AnnotationArrow";
import { WordLabel } from "./WordLabel";
import { crustStyle, Pepperoni, LEFT_PEPPERONI, RIGHT_PEPPERONI, SIZE } from "./PizzaCutHalf";

/** Mirrors BarWholeIntro for the pizza context - a whole pizza, an arrow pointing at it, and the
 * word "Whole" - purely a look-at-this beat, so it marks itself solved on mount. Renders the same
 * two adjacent (ungapped) half-divs PizzaCutHalf itself draws before any cut, since that's already
 * exactly what a "whole pizza" looks like - no separate whole-pizza asset needed. */
export function PizzaWholeIntro({ onSolved }: { onSolved: () => void }) {
  useEffect(() => {
    onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full" style={{ height: "clamp(220px, 40vh, 380px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-full"
        style={{ width: SIZE, aspectRatio: 1 }}
      >
        <div
          className="absolute top-0 left-0 h-full overflow-hidden border-2"
          style={{ ...crustStyle, width: "50%", borderRadius: "999px 0 0 999px" }}
        >
          {LEFT_PEPPERONI.map((p, i) => (
            <Pepperoni key={i} top={p.top} left={p.left} />
          ))}
        </div>
        <div
          className="absolute top-0 right-0 h-full overflow-hidden border-2"
          style={{ ...crustStyle, width: "50%", borderRadius: "0 999px 999px 0" }}
        >
          {RIGHT_PEPPERONI.map((p, i) => (
            <Pepperoni key={i} top={p.top} left={p.left} />
          ))}
        </div>
      </motion.div>
      <AnnotationArrow visible className="left-1/2 -top-9" />
      <WordLabel text="Whole" visible className="left-1/2 top-[calc(100%+18px)]" />
    </div>
  );
}
