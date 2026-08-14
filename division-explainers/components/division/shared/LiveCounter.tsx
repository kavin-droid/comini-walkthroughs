"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** A live running count, shown directly under whatever's currently being counted in (a dot pile,
 * friends, etc.) - ticks up in sync with each new item's arrival, so "how many is that so far" is
 * always answered at a glance instead of only living in narration text. `show` controls visibility
 * directly - callers that want it to linger briefly after counting finishes (rather than vanish
 * the instant the last item lands) should pass a delayed/held boolean via useLingerAfter. */
export function LiveCounter({ show, count, colorClass }: { show: boolean; count: number; colorClass: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="live-counter"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
          className={cn("font-mono text-[22px] font-bold px-3 py-1 rounded-full border", colorClass)}
        >
          <motion.span key={count} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
            {count}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
