"use client";

import { motion } from "framer-motion";

/** Shown over the number line while its `placeTap` step is still unanswered, inviting the child
 * to tap - a simple looping "tap" pulse (scale + slight downward bob), not a source→target drag
 * hint like addition-explainers' HandHint, since there's no fixed target to point at here (the
 * whole exercise is finding where `n` belongs). Positioned above the tick marks/labels (which sit
 * around y=54-80 in the 130px-tall stage) so it never overlaps them. */
export function TapHint() {
  return (
    <div
      className="absolute left-1/2 top-[18px] -translate-x-1/2 z-[4] pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, 7, 0], scale: [1, 0.88, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 28, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}
      >
        👆
      </motion.div>
    </div>
  );
}
