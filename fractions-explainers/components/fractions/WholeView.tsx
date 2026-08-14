"use client";

import { motion } from "framer-motion";

/** The unmarked whole chocolate bar - ported from the vanilla apps' renderWhole(). */
export function WholeView() {
  return (
    <div className="flex flex-col items-center gap-[18px]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-1.5"
      >
        <div
          className="relative w-[280px] max-w-[78vw] max-[380px]:w-[240px] h-16 rounded-[10px] border-2"
          style={{
            background:
              "linear-gradient(155deg, var(--color-choco-2), var(--color-choco) 55%, var(--color-choco-dark))",
            borderColor: "var(--color-choco-dark)",
            boxShadow: "inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -3px 5px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="absolute top-1.5 left-2.5 right-2.5 h-2 rounded-[6px]"
            style={{ background: "rgba(255,255,255,0.10)" }}
          />
        </div>
        <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-ink-3">
          whole chocolate bar
        </div>
      </motion.div>
    </div>
  );
}
