"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dot } from "./Dot";
import { AdditionCallout } from "./AdditionCallout";
import { MultiplicationCallout } from "./MultiplicationCallout";
import type { GroupsStep } from "@/lib/multiplication/types";

export function GroupsView({ step }: { step: GroupsStep }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {step.calloutAddition && (
        <AdditionCallout terms={step.calloutAddition.terms} total={step.calloutAddition.total} />
      )}
      {step.calloutMul && <MultiplicationCallout expr={step.calloutMul.expr} total={step.calloutMul.total} />}

      <div className="flex flex-wrap gap-3 justify-center items-start p-1.5">
        {Array.from({ length: step.groups }, (_, i) => {
          const isRevealed = i < step.revealed;
          const cols = Math.min(step.perGroup, 5);
          return (
            <div key={i} className="contents">
              {i > 0 && step.showPlus && (
                <div className="self-center font-serif font-light text-2xl text-ink-3 pb-1.5">+</div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
                className={cn(
                  "flex flex-col items-center gap-[7px] px-[9px] pt-[9px] pb-[7px] rounded-xl border-[1.5px] border-dashed min-w-[52px]",
                  isRevealed ? "bg-group-bg border-group" : "bg-paper-2 border-line-2 opacity-45",
                )}
              >
                <div
                  className={cn(
                    "font-mono text-[10px] tracking-widest uppercase font-semibold",
                    isRevealed ? "text-group" : "text-ink-3",
                  )}
                >
                  Group {i + 1}
                </div>
                {isRevealed ? (
                  <div
                    className="grid gap-1 justify-center"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                  >
                    {Array.from({ length: step.perGroup }, (_, k) => (
                      <Dot key={k} />
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-ink-3 px-0.5 py-1.5">?</div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
