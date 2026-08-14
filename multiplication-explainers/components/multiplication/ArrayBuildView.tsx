"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dot } from "./Dot";
import { EquationDisplay } from "./EquationDisplay";
import { useWorkspaceEquationVisible } from "@/hooks/useWorkspaceEquationVisible";
import type { AnswerPart, ArrayBuildStep } from "@/lib/multiplication/types";

const DEFAULT_STAGGER_MS = 420;
const ROW_LABEL_WIDTH = 20;
const ROW_GAP = 8;

function CountBadge({ value, isFinal }: { value: string; isFinal: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 22 }}
      className={cn("font-mono font-bold text-accent tabular-nums", isFinal ? "text-[15px]" : "text-[12px]")}
    >
      {value}
    </motion.span>
  );
}

/** Stage 2's redesigned Arrays concept: rows fade in one at a time (factor A, `rowsRevealed`),
 * each labeled with a running count on the left; then each row's dots pop in as a batch, row by
 * row (factor B, `dotRowsRevealed`) - no separate "groups" phase to rearrange from, the containers
 * are the array's rows from the start. Once built, the equation fades out and a hand-drawn border
 * traces itself around the array (`outline`), then a row and a column get named exactly like the
 * array concept always has (`highlightLine` / `countReveal` with plain 1,2,3... labels). The
 * equation then returns to ask for the total - `countReveal` switches to running totals (4, 8, 12)
 * and gates this view's own copy of the answer until the skip-count finishes (see `totalRevealed`
 * below), even though the step data already carries the real total for AnswerCard, which never
 * gates on animation state and shows it immediately. */
export function ArrayBuildView({ step }: { step: ArrayBuildStep }) {
  const [rowsRevealed, setRowsRevealed] = useState(step.rowsRevealed);
  const [dotRowsRevealed, setDotRowsRevealed] = useState(step.dotRowsRevealed);
  const equationVisible = useWorkspaceEquationVisible(step);
  const [outlineDrawn, setOutlineDrawn] = useState(step.outline !== "draw");
  const [countRevealed, setCountRevealed] = useState(0);
  const [totalRevealed, setTotalRevealed] = useState(!step.countReveal);

  useEffect(() => {
    setRowsRevealed(step.rowsRevealed);
    if (!step.rowReveal) return;
    const stagger = step.rowReveal.staggerMs ?? DEFAULT_STAGGER_MS;
    const rounds = step.rows - step.rowsRevealed;
    const timers = Array.from({ length: rounds }, (_, i) =>
      window.setTimeout(() => setRowsRevealed(step.rowsRevealed + i + 1), (i + 1) * stagger),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [step]);

  useEffect(() => {
    setDotRowsRevealed(step.dotRowsRevealed);
    if (!step.dotRowReveal) return;
    const stagger = step.dotRowReveal.staggerMs ?? DEFAULT_STAGGER_MS;
    const rounds = step.rows - step.dotRowsRevealed;
    const timers = Array.from({ length: rounds }, (_, i) =>
      window.setTimeout(() => setDotRowsRevealed(step.dotRowsRevealed + i + 1), (i + 1) * stagger),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [step]);

  // The border draws in once, right as the equation fades on this same step - every later step
  // just renders it already-drawn (see `outline`: "draw" vs "shown").
  useEffect(() => {
    setOutlineDrawn(step.outline !== "draw");
    if (step.outline !== "draw") return;
    const t = window.setTimeout(() => setOutlineDrawn(true), 350);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    setCountRevealed(0);
    setTotalRevealed(!step.countReveal);
    if (!step.countReveal) return;
    const { labels, staggerMs } = step.countReveal;
    const stagger = staggerMs ?? DEFAULT_STAGGER_MS;
    const timers = labels.map((_, i) => window.setTimeout(() => setCountRevealed(i + 1), (i + 1) * stagger));
    const finishTimer = window.setTimeout(() => setTotalRevealed(true), (labels.length + 1) * stagger);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finishTimer);
    };
  }, [step]);

  // While a countReveal is mid-animation, hold this view's own equation copy back at "?" even
  // though `step.answer` already carries the real total (AnswerCard shows it immediately - a
  // different element, never gated).
  const displayAnswer: AnswerPart[] =
    step.countReveal && !totalRevealed
      ? step.answer.map((p) => (p.kind === "new" ? { text: "?", kind: "ph" } : p))
      : step.answer;

  const rowCountActive = step.countReveal?.type === "row";
  const colCountActive = step.countReveal?.type === "column";

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {step.equationDisplay !== "hidden" &&
        (step.equationDisplay === "fadeOut" ? (
          <motion.div initial={false} animate={{ opacity: equationVisible ? 1 : 0 }} transition={{ duration: 0.5 }}>
            <EquationDisplay parts={displayAnswer} size="card" />
          </motion.div>
        ) : (
          <EquationDisplay parts={displayAnswer} size="card" />
        ))}

      {step.caption && (
        <div className="font-serif text-[16px] italic text-ink text-center px-4 py-2 bg-row-bg border border-row/20 rounded-xl">
          {step.caption.map((f, i) =>
            f.emphasis === "key" ? (
              <strong key={i} className="font-mono not-italic font-semibold text-row">
                {f.text}
              </strong>
            ) : (
              <span key={i}>{f.text}</span>
            ),
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-1.5">
        {colCountActive && (
          <div
            className="flex items-center gap-[6px]"
            style={{ paddingLeft: ROW_LABEL_WIDTH + ROW_GAP }}
          >
            {Array.from({ length: step.cols }, (_, c) => (
              <div key={c} className="w-[14px] flex items-center justify-center h-[16px]">
                {c < countRevealed && (
                  <CountBadge value={step.countReveal!.labels[c]} isFinal={c === step.countReveal!.labels.length - 1} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative inline-block">
          {step.outline !== "hidden" && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
              <motion.rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="16"
                fill="none"
                className="stroke-accent"
                strokeWidth={2.5}
                initial={step.outline === "draw" ? { pathLength: 0 } : false}
                animate={{ pathLength: outlineDrawn ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </svg>
          )}

          <div
            className={cn(
              "inline-flex flex-col gap-[7px]",
              rowsRevealed > 0 && "p-[10px] bg-card border border-line rounded-xl",
            )}
          >
            {Array.from({ length: step.rows }, (_, r) => {
              const rowVisible = r < rowsRevealed;
              const dotsShown = rowVisible && r < dotRowsRevealed ? step.cols : 0;
              const rowCounted = rowCountActive && r < countRevealed;
              const rowHighlighted =
                (step.highlightLine?.type === "row" && step.highlightLine.index === r) || rowCounted;
              return (
                <motion.div
                  key={r}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: rowVisible ? 1 : 0, x: rowVisible ? 0 : -8 }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className={cn(
                    "flex items-center gap-2 rounded-md -mx-1 px-1 py-0.5 transition-colors duration-200",
                    rowHighlighted ? "bg-accent/12" : "bg-paper-2",
                  )}
                  style={{ minWidth: ROW_LABEL_WIDTH + ROW_GAP + step.cols * 20 }}
                >
                  <div
                    className="font-mono text-[11px] shrink-0 flex items-center justify-end h-[16px]"
                    style={{ width: ROW_LABEL_WIDTH }}
                  >
                    {rowCounted ? (
                      <CountBadge
                        value={step.countReveal!.labels[r]}
                        isFinal={r === step.countReveal!.labels.length - 1}
                      />
                    ) : (
                      <span className="text-row font-semibold opacity-80">{r + 1}.</span>
                    )}
                  </div>
                  <div className="flex gap-[6px]">
                    {Array.from({ length: dotsShown }, (_, c) => {
                      const colCounted = colCountActive && c < countRevealed;
                      const colHighlighted = (step.highlightLine?.type === "column" && step.highlightLine.index === c) || colCounted;
                      return (
                        <motion.div
                          key={c}
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Dot emphasized={rowHighlighted || colHighlighted} />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
