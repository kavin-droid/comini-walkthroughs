"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";

/** A small bobbing arrow pointing at whatever matters right now (the split line, the halfway
 * mark, the pour path) - point `rotateDeg` at the target instead of relying on a caption. Fades
 * in/out with the phase that owns it rather than popping, same continuity rule as everything
 * else in stage 1.
 *
 * `className` should only ever carry *positioning* utilities - centering is handled on a plain,
 * unanimated wrapper (see Celebration's note for why: this component animates both opacity and
 * `rotate`, and Framer's `animate` would silently overwrite a transform set via className on the
 * same element). */
export function AnnotationArrow({
  visible,
  rotateDeg = 0,
  className = "",
}: {
  visible: boolean;
  rotateDeg?: number;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute z-20 -translate-x-1/2 ${className}`}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.3 }}
            style={{ rotate: rotateDeg }}
          >
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown size={26} className="text-half" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
