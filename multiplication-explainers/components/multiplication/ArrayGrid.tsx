"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dot, type DotVariant } from "./Dot";

export interface HighlightLine {
  type: "row" | "column";
  index: number;
}

export interface CountReveal {
  type: "row" | "column";
  labels: string[];
  staggerMs?: number;
}

const DEFAULT_STAGGER_MS = 380;

function CountBadge({ value, isFinal }: { value: string; isFinal: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 22 }}
      className={cn(
        "font-mono font-bold text-accent tabular-nums",
        isFinal ? "text-[15px]" : "text-[12px]",
      )}
    >
      {value}
    </motion.span>
  );
}

/** A "counting pointer": reveals `countReveal.labels` one at a time (row by row or column by
 * column), each popping in after the previous, so a count (or skip-count) is watched happening
 * instead of just stated in text. Resets and replays whenever `countReveal` changes identity -
 * relies on the workspace's per-step remount (see Workspace.tsx) to fire fresh on every step. */
export function ArrayGrid({
  rows,
  cols,
  splitAt,
  allColor,
  highlightLine,
  countReveal,
  className,
}: {
  rows: number;
  cols: number;
  splitAt?: number | null;
  allColor?: "split-b" | null;
  highlightLine?: HighlightLine | null;
  countReveal?: CountReveal | null;
  className?: string;
}) {
  const revealTotal = countReveal?.labels.length ?? 0;
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (!countReveal) return;
    const stagger = countReveal.staggerMs ?? DEFAULT_STAGGER_MS;
    const timers = Array.from({ length: revealTotal }, (_, i) =>
      window.setTimeout(() => setRevealedCount(i + 1), (i + 1) * stagger),
    );
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countReveal]);

  const columnHeaderActive = countReveal?.type === "column";

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      {columnHeaderActive && (
        <div className="flex items-center gap-[5px]" style={{ paddingLeft: 26 }}>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="w-[14px] flex items-center justify-center h-[16px]">
              {c < revealedCount && (
                <CountBadge value={countReveal!.labels[c]} isFinal={c === revealTotal - 1} />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="inline-grid gap-[5px] p-[10px] bg-card border border-line rounded-xl">
        {Array.from({ length: rows }, (_, r) => {
          const rowCounted = countReveal?.type === "row" && r < revealedCount;
          const rowHighlighted = (highlightLine?.type === "row" && highlightLine.index === r) || rowCounted;
          return (
            <div
              key={r}
              className={cn(
                "flex items-center gap-2 rounded-md -mx-1 px-1 py-0.5 transition-colors duration-200",
                rowHighlighted && "bg-accent/12",
              )}
            >
              <div className="font-mono text-[10px] w-[18px] text-right shrink-0 flex items-center justify-end h-[14px]">
                {rowCounted ? (
                  <CountBadge value={countReveal!.labels[r]} isFinal={r === revealTotal - 1} />
                ) : (
                  <span className="text-row font-semibold opacity-80">{r + 1}.</span>
                )}
              </div>
              <div className="flex gap-[5px]">
                {Array.from({ length: cols }, (_, c) => {
                  const variant: DotVariant =
                    allColor === "split-b" || (splitAt != null && c >= splitAt) ? "split-b" : "item";
                  const columnHighlighted =
                    (highlightLine?.type === "column" && highlightLine.index === c) ||
                    (countReveal?.type === "column" && c < revealedCount);
                  return (
                    <Dot key={c} variant={variant} emphasized={rowHighlighted || columnHighlighted} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
