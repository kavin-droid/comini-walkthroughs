"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Stage1Session } from "@/lib/division/stage1";
import { Stage1MainScene } from "./Stage1MainScene";
import { Stage1NotationView } from "./Stage1NotationView";

/** Crossfades between the interactive board (pile-reveal..celebrate) and the final static
 * equation view (recap/done) instead of cutting between them - celebrate is the single biggest
 * payoff moment in the whole walkthrough (the trays the child just filled), so it must visibly
 * dissolve into the equation that explains it, not vanish and get replaced in one frame. */
export function Stage1Workspace({ session, onShareItem }: { session: Stage1Session; onShareItem: () => void }) {
  const isNotation = session.phase === "recap" || session.phase === "done";

  return (
    <AnimatePresence mode="wait">
      {isNotation ? (
        <motion.div
          key="notation"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.4 }}
        >
          <Stage1NotationView session={session} />
        </motion.div>
      ) : (
        <motion.div
          key="scene"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.4 }}
        >
          <Stage1MainScene session={session} onShareItem={onShareItem} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
