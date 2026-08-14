"use client";

import { motion } from "framer-motion";

/** The "3 x 4 = 12" callout shown once multiplication is introduced as a shortcut for the
 * addition just checked - shared by GroupsView (Repeated Addition) and BoxGroupsView (Build from
 * the Equation), which both reach this same moment via `calloutMul`. */
export function MultiplicationCallout({ expr, total }: { expr: string; total: number }) {
  return (
    <div className="flex items-baseline justify-center gap-[7px] flex-wrap font-serif text-[18px] italic text-ink text-center px-[18px] py-[10px] bg-row-bg border border-row/20 rounded-xl">
      <span>{expr}</span>
      <motion.span
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="font-mono not-italic font-bold text-row inline-block"
      >
        {total}
      </motion.span>
    </div>
  );
}
