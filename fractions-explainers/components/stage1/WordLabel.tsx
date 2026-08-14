"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/** A single big word ("Whole", "Half") or short notation ("1", "1/2") shown as a pill directly in
 * the workarea next to whatever it describes. Deliberately NOT affected by the instruction-text
 * toggle (see @/components/shared/TextVisibilityContext) - that toggle only hides the narration
 * prose below the workarea; these labels are core visual content the child needs to complete the
 * step, not narration about it. Not prose either way: one word or symbol, meant to be learned as a
 * sight-word/symbol through repetition, not read. `emphasis` bumps size/color for the recap steps'
 * numerator/denominator highlight sequence.
 *
 * `className` should only ever carry *positioning* utilities - centering is handled on a plain,
 * unanimated wrapper (see Celebration's note for why: the inner element animates opacity/scale,
 * and Framer's `animate` would silently overwrite a transform set via className on that same
 * element). */
export function WordLabel({
  text,
  visible,
  emphasis = false,
  className = "",
}: {
  text: string;
  visible: boolean;
  emphasis?: boolean;
  className?: string;
}) {
  const show = visible;
  return (
    <div className={cn("pointer-events-none absolute z-20 -translate-x-1/2", className)}>
      <AnimatePresence mode="popLayout">
        {show && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: emphasis ? 1.15 : 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.85, transition: { duration: 0.25 } }}
            transition={{ duration: 0.35 }}
            className={cn(
              "px-4 py-1.5 rounded-full font-sans font-bold shadow-lg whitespace-nowrap",
              emphasis ? "bg-accent text-card text-[20px]" : "bg-ink text-card text-[16px]",
            )}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
