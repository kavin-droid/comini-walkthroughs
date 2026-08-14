"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dot } from "./Dot";
import { TenPack } from "./TenPack";
import { EquationDisplay } from "./EquationDisplay";
import { useCombineCount } from "./CombineCountContext";
import type { ArrayMultiplyStep } from "@/lib/multiplication/types";

const DEFAULT_STAGGER_MS = 420;
const ROW_LABEL_WIDTH = 20;
const ROW_GAP = 8;
// Matches the generator's own `combineStagger` (stage3.ts) exactly, so ArrayMultiplyStep's
// `feedback.feedbackDelayMs` (sized off that same constant) actually lands after this real
// animation finishes rather than an approximation of it.
const COMBINE_STAGGER_MS = 380;

function CountBadge({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 22 }}
      className="font-mono font-bold text-accent tabular-nums text-[12px]"
    >
      {value}
    </motion.span>
  );
}

/** A "hundred" - ten ten-packs grouped into one block, the same "group ten of the smaller unit"
 * motif TenPack itself already uses one place value down. Only ever appears mid-count (see
 * `countCombine`), when the running tens count crosses a multiple of ten. */
function HundredBlock() {
  return (
    <div className="grid grid-cols-5 grid-rows-2 gap-[3px] p-[4px] rounded-md bg-row-bg border-2 border-row">
      {Array.from({ length: 10 }, (_, i) => (
        <TenPack key={i} small />
      ))}
    </div>
  );
}

/** One partial product's place-value breakdown (e.g. "12" -> a ten-pack + two loose ones) -
 * the addition app's own per-number decomposition, ported to this app's Dot/TenPack visual
 * language rather than its UnitDot. Used only by the combine-phase steps below, where the ones
 * and tens partials are broken down before being added together. `countedTens`/`countedOnes`
 * ring-highlight the first N units of each type (in render order) - driven by BreakdownView's
 * own counting timers, so a unit stays marked once counted rather than a moving single
 * highlight, letting the child see the running tally build up across both piles. */
function BreakdownPile({
  label,
  tensCount,
  onesCount,
  countedTens = 0,
  countedOnes = 0,
}: {
  label: string;
  tensCount: number;
  onesCount: number;
  countedTens?: number;
  countedOnes?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex items-center gap-3 bg-paper-2 rounded-xl px-3.5 py-2.5 w-full"
    >
      <div className="font-mono text-[16px] font-bold text-ink w-9 text-right shrink-0">{label}</div>
      <div className="flex items-center gap-[6px] flex-wrap flex-1">
        {tensCount === 0 && onesCount === 0 ? (
          <span className="text-ink-3 text-[12px] italic">0</span>
        ) : (
          <>
            {Array.from({ length: tensCount }, (_, i) => (
              <TenPack
                key={`t${i}`}
                small
                className={cn(i < countedTens && "ring-2 ring-accent ring-offset-1 ring-offset-paper-2")}
              />
            ))}
            {Array.from({ length: onesCount }, (_, i) => (
              <Dot key={`o${i}`} emphasized={i < countedOnes} />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}

/** The combine phase: each partial product's own place-value breakdown, additive (the tens
 * partial's pile joins the ones partial's rather than replacing it) - see ArrayMultiplyStep's
 * `onesBreakdownShown`/`tensBreakdownShown`. On the total-reveal step (`countCombine`), also
 * counts every already-broken-down unit out loud before the feedback lands: the ones first
 * (always single-digit, never regroups further - `leftoverOnes` was already resolved when "12"
 * was first broken down), then the tens across BOTH piles in turn (this pile's first, then the
 * other's), packing every full ten of *those* into a HundredBlock the moment the running count
 * crosses a multiple of ten - the regroup-while-counting beat the addition app's own carry
 * animation uses, one place value up. The generator sizes `feedback.feedbackDelayMs` to this
 * same timing (see COMBINE_STAGGER_MS) so the feedback line waits for it to finish. */
function BreakdownView({ step }: { step: ArrayMultiplyStep }) {
  const onesProduct = step.ones * step.factor;
  const tensPartialValue = step.tens * step.factor * 10;
  const onesBreakdownTens = Math.floor(onesProduct / 10);
  const onesBreakdownOnes = onesProduct % 10;
  const tensBreakdownTens = step.tens * step.factor;
  const totalOnesUnits = onesBreakdownOnes;
  const totalTensUnits = onesBreakdownTens + tensBreakdownTens;

  const [onesCounted, setOnesCounted] = useState(0);
  const [tensCounted, setTensCounted] = useState(0);
  const { setCombineCount } = useCombineCount();

  useEffect(() => {
    setOnesCounted(0);
    setTensCounted(0);
    if (!step.countCombine) return;
    const timers: number[] = [];
    for (let i = 0; i < totalOnesUnits; i++) {
      timers.push(window.setTimeout(() => setOnesCounted(i + 1), (i + 1) * COMBINE_STAGGER_MS));
    }
    const tensStart = (totalOnesUnits + 1) * COMBINE_STAGGER_MS;
    for (let i = 0; i < totalTensUnits; i++) {
      timers.push(window.setTimeout(() => setTensCounted(i + 1), tensStart + (i + 1) * COMBINE_STAGGER_MS));
    }
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Mirror the running count over to NumericPanel (a persistent sibling, not a descendant of
  // this remounted view - see CombineCountContext) so its own total row shows the same real-time
  // tally instead of jumping straight to the final number while this view is still counting.
  useEffect(() => {
    setCombineCount(onesCounted, tensCounted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onesCounted, tensCounted]);

  const pile12TensCounted = Math.min(tensCounted, onesBreakdownTens);
  const pile80TensCounted = Math.min(Math.max(tensCounted - onesBreakdownTens, 0), tensBreakdownTens);
  const hundredsFromCount = Math.floor(tensCounted / 10);

  // While counting, this view's own equation copy shows the same running tally instead of the
  // final total baked into `step.answer` (see generateArrayMultiplySteps' additionParts call) -
  // once counting finishes the two are numerically identical anyway (see NumericPanel's own
  // matching comment), so no separate "snap to the real answer" transition is needed.
  const liveTotal = onesCounted + tensCounted * 10;
  const displayAnswer = step.countCombine
    ? step.answer.map((p, i) => (i === step.answer.length - 1 ? { ...p, text: String(liveTotal) } : p))
    : step.answer;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <EquationDisplay parts={displayAnswer} size="card" />
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        {step.onesBreakdownShown && (
          <BreakdownPile
            label={String(onesProduct)}
            tensCount={onesBreakdownTens}
            onesCount={onesBreakdownOnes}
            countedTens={pile12TensCounted}
            countedOnes={onesCounted}
          />
        )}
        {step.tensBreakdownShown && (
          <BreakdownPile
            label={String(tensPartialValue)}
            tensCount={tensBreakdownTens}
            onesCount={0}
            countedTens={pile80TensCounted}
          />
        )}
        {hundredsFromCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className="flex items-center gap-2.5 bg-row-bg border border-row/30 rounded-xl px-3 py-2 self-center"
          >
            <HundredBlock />
            <span className="font-mono text-[13px] font-bold text-row">
              {hundredsFromCount} hundred{hundredsFromCount === 1 ? "" : "s"}!
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Stage 3's "Regroup and Multiply" workspace view (array method): each phase's array (ones as
 * loose dots, tens as ten-packs via `usePacks`) fades in row by row then dot by dot, the same
 * staggered-reveal convention as ArrayBuildView - this is a deliberately trimmed-down cousin of
 * that component (no outline-draw/row-naming/caption, which this concept has no use for), kept
 * as its own view rather than a shared one since this app's convention is one dedicated step
 * kind + view per concept (see ArrayBuildStep vs BoxGroupsStep - visually similar but separate).
 * The written numeric representation this array is building toward lives in NumericPanel, a
 * persistent sibling beside the workspace (see MultiplicationWalkthrough), not inside it - unlike
 * this view, NumericPanel never remounts per step. */
export function ArrayMultiplyView({ step }: { step: ArrayMultiplyStep }) {
  const [rowsRevealed, setRowsRevealed] = useState(step.rowsRevealed);
  const [dotRowsRevealed, setDotRowsRevealed] = useState(step.dotRowsRevealed);
  const [countRevealed, setCountRevealed] = useState(0);

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

  useEffect(() => {
    setCountRevealed(0);
    if (!step.countReveal) return;
    const { labels, staggerMs } = step.countReveal;
    const stagger = staggerMs ?? DEFAULT_STAGGER_MS;
    const timers = labels.map((_, i) => window.setTimeout(() => setCountRevealed(i + 1), (i + 1) * stagger));
    return () => timers.forEach(window.clearTimeout);
  }, [step]);

  if (step.onesBreakdownShown || step.tensBreakdownShown) {
    return <BreakdownView step={step} />;
  }

  if (step.rows === 0) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <EquationDisplay parts={step.answer} size="card" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <EquationDisplay parts={step.answer} size="card" />

      <div className="inline-flex flex-col gap-[7px] p-[10px] bg-card border border-line rounded-xl">
        {Array.from({ length: step.rows }, (_, r) => {
          const rowVisible = r < rowsRevealed;
          const dotsShown = rowVisible && r < dotRowsRevealed ? step.cols : 0;
          const rowCounted = countRevealed > r;
          return (
            <motion.div
              key={r}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: rowVisible ? 1 : 0, x: rowVisible ? 0 : -8 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                "flex items-center gap-2 rounded-md -mx-1 px-1 py-0.5 transition-colors duration-200",
                rowCounted ? "bg-accent/12" : "bg-paper-2",
              )}
              style={{ minWidth: ROW_LABEL_WIDTH + ROW_GAP + step.cols * (step.usePacks ? 34 : 20) }}
            >
              <div
                className="font-mono text-[11px] shrink-0 flex items-center justify-end h-[16px]"
                style={{ width: ROW_LABEL_WIDTH }}
              >
                {rowCounted && step.countReveal ? (
                  <CountBadge value={step.countReveal.labels[r]} />
                ) : (
                  <span className="text-row font-semibold opacity-80">{r + 1}.</span>
                )}
              </div>
              <div className="flex gap-[6px]">
                {Array.from({ length: dotsShown }, (_, c) => (
                  <motion.div
                    key={c}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    {step.usePacks ? <TenPack /> : <Dot />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
