"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { WordLabelInline } from "./RecapWhole";
import { RecapShapes } from "./RecapShapes";

const HOLD_MS = 1600;

function FractionDigit({ text, active }: { text: string; active: boolean }) {
  return (
    <motion.div
      animate={{
        scale: active ? 1.35 : 1,
        color: active ? "var(--color-accent)" : "var(--color-ink)",
      }}
      transition={{ duration: 0.4 }}
      className="font-mono font-bold text-[26px] leading-none"
    >
      {text}
    </motion.div>
  );
}

/** All three shapes together, all split in half, introducing "1/2" - then a sequence that ties
 * the notation to the picture: the numerator ("1") glows while exactly one piece per shape glows,
 * then the denominator ("2") glows while both pieces glow, so the two digits' meanings ("1 of
 * them" / "2 equal parts total") are shown, not told. Same "mark solved only after the sequence
 * has actually played" rule as CompareWholeHalfMcq's highlight sequence - replayable via the
 * button. */
export function RecapHalf({ onSolved }: { onSolved: () => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }
  function after(ms: number, fn: () => void) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function play() {
    clearTimers();
    setPhase(0);
    after(HOLD_MS, () => setPhase(1));
    after(HOLD_MS * 2, () => setPhase(2));
    after(HOLD_MS * 2, onSolved);
  }

  useEffect(() => {
    play();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <RecapShapes split highlightFirst={phase >= 1} highlightSecond={phase >= 2} />
      <div className="flex items-center gap-4">
        <WordLabelInline text="Half" />
        <div className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl bg-card border-2 border-line-2 shadow-lg">
          <FractionDigit text="1" active={phase === 1} />
          <div className="w-5 h-[2px] bg-ink" />
          <FractionDigit text="2" active={phase === 2} />
        </div>
      </div>
      <button
        type="button"
        aria-label="Watch again"
        onClick={play}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-card border-2 border-line-2 text-ink-2 hover:border-accent transition-colors"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
