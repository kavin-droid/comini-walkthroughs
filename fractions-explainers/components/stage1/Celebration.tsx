"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const GOLD = "#F0AE3C";

/** A star-pop confirmation shown once a practice tap completes - the only "feedback" a
 * pre-reading child gets, entirely non-verbal. A few small sparks burst outward and fade while
 * the main star pops in with a bounce; everything here is opacity/scale animation, nothing
 * appears or disappears in a single frame.
 *
 * `className` should only ever carry *positioning* utilities (e.g. `left-1/2 top-1/2`) - the
 * centering transform is applied on a plain, unanimated wrapper below, not on the element Framer
 * Motion animates. Putting a Tailwind translate class directly on an animated element is unsafe:
 * Framer's `animate` writes its own `transform` inline style and silently overwrites whatever
 * transform a className would have set. */
export function Celebration({ show, className = "" }: { show: boolean; className?: string }) {
  const sparks = [-1, 1].map((dir, i) => ({ dx: dir * (30 + i * 10), dy: -26 - i * 8, delay: 0.08 + i * 0.05 }));

  return (
    <div className={`pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 ${className}`}>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="relative flex items-center justify-center"
          >
            {sparks.map((s, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], x: s.dx, y: s.dy, scale: 1 }}
                transition={{ duration: 0.7, delay: s.delay, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full"
                style={{ background: GOLD }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Sparkles size={44} fill={GOLD} style={{ color: GOLD }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
