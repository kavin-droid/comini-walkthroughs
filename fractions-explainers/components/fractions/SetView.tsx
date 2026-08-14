"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Callout } from "./Callout";
import type { SetStep } from "@/lib/fractions/types";

function Piece({ selected }: { selected: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-[26px] h-[26px] rounded-[6px] border-2 transition-colors duration-300"
      style={{
        background: selected
          ? "var(--color-piece1)"
          : "linear-gradient(155deg, var(--color-choco-2), var(--color-choco) 60%)",
        borderColor: selected ? "var(--color-piece1)" : "var(--color-choco-dark)",
        boxShadow: selected
          ? undefined
          : "inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.25)",
      }}
    />
  );
}

/** A set of chocolate pieces, ungrouped or split into equal groups - ported from the vanilla
 * stage 3 app's renderSet(). Stage 3 only: stage 2 never shows a "set" view. */
export function SetView({ step }: { step: SetStep }) {
  const groupSize = step.size / step.denominator;

  return (
    <div className="flex flex-col items-center gap-[18px]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        {!step.grouped ? (
          <>
            <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
              {Array.from({ length: step.size }).map((_, i) => (
                <Piece key={i} selected={false} />
              ))}
            </div>
            <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-ink-3">
              {step.size} pieces
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2.5 justify-center max-w-[300px]">
              {Array.from({ length: step.denominator }).map((_, g) => {
                const selected = g < step.shadedGroups;
                return (
                  <div
                    key={g}
                    className={cn(
                      "flex flex-wrap gap-[5px] p-2 rounded-[10px] border-2 border-dashed max-w-[92px] transition-colors duration-200",
                      selected ? "border-piece1" : "border-line-2",
                    )}
                    style={selected ? { background: "var(--color-piece1-bg)" } : undefined}
                  >
                    {Array.from({ length: groupSize }).map((_, j) => (
                      <Piece key={j} selected={selected} />
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-ink-3">
              {step.denominator} groups of {groupSize}
            </div>
          </>
        )}
      </motion.div>
      {step.callout && <Callout parts={step.callout} />}
    </div>
  );
}
