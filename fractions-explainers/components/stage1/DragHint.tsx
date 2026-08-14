"use client";

import { motion } from "framer-motion";
import { Hand } from "lucide-react";

const PATH_PX = 70;

/** A ghost hand sliding back and forth to demonstrate "press here and drag across" - deliberately
 * NOT a circular icon-in-a-badge (that reads as a single tappable button to a pre-reader, which is
 * exactly the confusion this replaces: a static button-looking hint invited one press instead of
 * an actual drag). The hand travels along a faint fading guide line and fades out at each end of
 * its path before reappearing at the start, so the motion itself reads as "drag from here to
 * there" rather than "tap this spot".
 *
 * `className` should only ever carry *positioning* utilities - the outer element here animates
 * `x`/`opacity` via Framer's `animate`, so centering is handled on the inner plain wrapper instead
 * (same rule as WordLabel/AnnotationArrow/Celebration - see their notes for why). */
export function DragHint({ visible, className = "" }: { visible: boolean; className?: string }) {
  if (!visible) return null;

  return (
    <div className={`pointer-events-none absolute z-20 ${className}`} style={{ width: PATH_PX }}>
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-[3px] rounded-full"
        style={{ background: "var(--color-half)" }}
        animate={{ opacity: [0, 0.45, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-0"
        animate={{ x: [0, PATH_PX, PATH_PX, 0, 0], opacity: [1, 1, 0, 0, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 0.55, 0.95, 1] }}
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <Hand
            size={26}
            className="text-accent"
            fill="var(--color-card)"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
