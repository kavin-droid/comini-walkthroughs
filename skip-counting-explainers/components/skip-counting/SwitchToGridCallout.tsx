"use client";

import { AnimatePresence, motion } from "framer-motion";

/** A transient callout shown while the workspace crossfades from the number line into the
 * hundred grid (see Workspace.tsx) - marks the moment as a deliberate "new mode" switch rather
 * than just another phase. Sits outside the scaled workspace div so it always renders crisp
 * (unaffected by the fit-to-container CSS transform) and never intercepts taps underneath it. */
export function SwitchToGridCallout({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-6"
        >
          <div className="bg-ink text-card font-serif text-[17px] font-semibold px-5 py-3 rounded-2xl shadow-lg text-center">
            Now, let&apos;s try this!
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
