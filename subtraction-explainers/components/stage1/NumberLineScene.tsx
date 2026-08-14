"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateNumberOptions } from "@/lib/stage1/mcq";
import type { CountBackStep } from "@/lib/stage1/types";
import { EquationBanner } from "./EquationBanner";
import { Confetti } from "./Confetti";

/** Desktop is wide/short (a real number line reads naturally left-to-right); mobile's card is
 * closer to square, so a wide-short viewBox would letterbox badly there. Mobile gets a narrower,
 * taller canvas instead - same track, but more vertical room for a bigger, more visible hop arc. */
function layoutFor(isDesktop: boolean) {
  return isDesktop
    ? { vbW: 640, vbH: 220, pad: 50, trackY: 130, arcRise: 46 }
    : { vbW: 420, vbH: 340, pad: 40, trackY: 220, arcRise: 90 };
}

/** Counting-back number line: a rabbit hops backward one number at a time. Hop 1 always happens
 * on a plain Next/auto-advance; every hop after that requires TAPPING the correct next tick (see
 * `nextHopTarget`) - tapping the wrong one shakes the rabbit and flashes that tick red, purely
 * local feedback (mirrors PredictOptions - a wrong tap never reaches the reducer). The rabbit's
 * x-position is a pure function of `minuend - hopsDone`, so Framer Motion glides it there
 * continuously on every step change with no manual timing needed. */
export function NumberLineScene({
  step,
  isDesktop,
  onCorrectHop,
}: {
  step: CountBackStep;
  isDesktop: boolean;
  onCorrectHop: () => void;
}) {
  const { minuend, subtrahend, hopsDone, lineMax, placed, highlight, requiresTap, nextHopTarget, askPosition, revealAnswer } = step;
  const { vbW, vbH, pad, trackY, arcRise } = layoutFor(isDesktop);
  const xFor = (value: number) => pad + (value / lineMax) * (vbW - pad * 2);
  const current = minuend - hopsDone;
  const currentX = xFor(current);

  const [wrongValue, setWrongValue] = useState<number | null>(null);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    setWrongValue(null);
    setShaking(false);
  }, [step.id]);

  function handleTapTick(value: number) {
    if (!requiresTap) return;
    if (value === nextHopTarget) {
      onCorrectHop();
      return;
    }
    setWrongValue(value);
    setShaking(true);
    window.setTimeout(() => {
      setWrongValue(null);
      setShaking(false);
    }, 500);
  }

  const ticks = Array.from({ length: lineMax + 1 }, (_, i) => i);
  const answer = minuend - subtrahend;
  const isHopTap = requiresTap && !askPosition;

  return (
    <div className="relative flex flex-col items-center gap-3" style={{ width: vbW }}>
      {revealAnswer && <Confetti />}
      <EquationBanner left={minuend} right={subtrahend} answer={answer} highlight={highlight} revealed={revealAnswer} />
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        style={{ width: vbW, height: vbH }}
        role="img"
        aria-label="Number line counting back"
      >
        {/* Track */}
        <line x1={pad} y1={trackY} x2={vbW - pad} y2={trackY} stroke="var(--color-line-2)" strokeWidth={4} strokeLinecap="round" />

        {/* Ticks + numerals - always uniform size/color (the "count" lives above the arc, not
            here - a numeral that grows/recolors as the current position changes read as if the
            count were happening down here instead). Every tick is tappable while a hop-tap is
            pending; only the correct one is marked `data-tappable` for HandHint's idle-hint
            selector, but ALL of them respond to a tap (wrong ones give local shake+red feedback,
            never touch app state). */}
        {ticks.map((v) => {
          const x = xFor(v);
          const isCurrent = v === current;
          const isWrongFlash = wrongValue === v;
          const isCorrectTarget = isHopTap && v === nextHopTarget;
          return (
            <g key={v}>
              {isHopTap && (
                <rect
                  x={x - 22}
                  y={trackY - 30}
                  width={44}
                  height={60}
                  fill="transparent"
                  data-tappable={isCorrectTarget || undefined}
                  onClick={() => handleTapTick(v)}
                  style={{ cursor: "pointer" }}
                />
              )}
              {/* A motion.line with an `animate` prop present breaks even STATIC y1/y2 (Framer
                  Motion tries to manage them internally, throws "Expected length, undefined") - so
                  the grow/shrink is a scaleY transform on a motion.g wrapping a plain <line>. */}
              <motion.g
                animate={{ scaleY: isCurrent ? 1 : 9 / 14 }}
                style={{ transformOrigin: `${x}px ${trackY}px` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <line
                  x1={x}
                  x2={x}
                  y1={trackY - 14}
                  y2={trackY + 14}
                  stroke={isWrongFlash ? "var(--color-used)" : isCurrent ? "var(--color-hop)" : "var(--color-line-2)"}
                  strokeWidth={isCurrent || isWrongFlash ? 4 : 3}
                  strokeLinecap="round"
                  style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease" }}
                />
              </motion.g>
              {isWrongFlash && (
                <motion.circle
                  cx={x}
                  cy={trackY}
                  r={20}
                  fill="var(--color-used-bg)"
                  stroke="var(--color-used)"
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <text x={x} y={trackY + 34} textAnchor="middle" className="font-mono font-bold" style={{ fontSize: 16, fill: "var(--color-ink-2)" }}>
                {v}
              </text>
            </g>
          );
        })}

        {/* Hop trail: one arc per hop already taken, dimmed except the most recent - both animate
            IN (a new hop) and OUT (stepping Back removes the latest hop). The hop COUNT lives here,
            above the arc, and only here. */}
        <AnimatePresence>
          {Array.from({ length: hopsDone }, (_, k) => k + 1).map((hopNum) => {
            const fromX = xFor(minuend - hopNum + 1);
            const toX = xFor(minuend - hopNum);
            const midX = (fromX + toX) / 2;
            const peakY = trackY - arcRise;
            const isLatest = hopNum === hopsDone;
            const d = `M ${fromX} ${trackY - 16} Q ${midX} ${peakY} ${toX} ${trackY - 16}`;
            return (
              <motion.g key={hopNum}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke="var(--color-hop)"
                  strokeWidth={isLatest ? 3.5 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray="7 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isLatest ? 1 : 0.35 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                {isLatest && (
                  <motion.g
                    initial={{ opacity: 0, y: peakY + 4 }}
                    animate={{ opacity: 1, y: peakY - 8 }}
                    exit={{ opacity: 0, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                  >
                    <circle cx={midX} cy={0} r={15} fill="var(--color-used-bg)" stroke="var(--color-used)" strokeWidth={2} />
                    <text x={midX} y={0} dy="0.32em" textAnchor="middle" className="font-mono font-bold" style={{ fontSize: 16, fill: "var(--color-used)" }}>
                      {hopNum}
                    </text>
                  </motion.g>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* The rabbit itself - glides continuously to its new x every step */}
        <AnimatePresence>
          {placed && (
            <motion.g
              key="rabbit"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ x: currentX, y: trackY, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ x: { duration: 0.6, ease: "easeInOut" }, y: { duration: 0.6, ease: "easeInOut" }, default: { duration: 0.4 } }}
            >
              <motion.g
                key={hopsDone}
                initial={{ y: 0 }}
                animate={shaking ? { x: [0, -6, 6, -6, 6, 0] } : { y: [0, -30, 0] }}
                transition={{ duration: shaking ? 0.4 : 0.6, ease: "easeInOut" }}
              >
                <text textAnchor="middle" dominantBaseline="central" style={{ fontSize: 40 }}>
                  🐰
                </text>
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {revealAnswer && (
            <motion.text
              x={currentX}
              y={trackY - 62}
              textAnchor="middle"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 24 }}
              aria-hidden
            >
              ✅
            </motion.text>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

/** "Which number is the rabbit on" MCQ - same wrong-answer-is-purely-local-feedback pattern as
 * subtraction/PredictOptions - a wrong tap never dispatches anything. Rendered OUTSIDE the scaled
 * workarea (see Stage1McqArea) so it never shrinks/grows with the SVG's own fit-to-card scale. */
export function PositionMcq({ answer, onCorrect }: { answer: number; onCorrect: () => void }) {
  const options = generateNumberOptions(answer);
  const [wrongValue, setWrongValue] = useState<number | null>(null);

  function handleClick(value: number) {
    if (value === answer) {
      onCorrect();
      return;
    }
    setWrongValue(value);
    window.setTimeout(() => setWrongValue(null), 450);
  }

  return (
    <div className="flex justify-center gap-3.5 pt-1">
      {options.map((value) => (
        <button
          key={value}
          data-mcq-option
          onClick={() => handleClick(value)}
          className={cn(
            "w-14 h-14 rounded-2xl bg-card border-2 border-line font-mono text-xl font-bold text-ink",
            "hover:border-accent hover:bg-paper-2 transition-colors",
            wrongValue === value && "border-used bg-used-bg animate-shake",
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
