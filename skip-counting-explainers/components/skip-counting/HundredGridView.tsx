"use client";

import { useSkipCounting } from "./SkipCountingContext";
import { getCurrent, getLanded, isInteractiveGridTap } from "@/lib/skip-counting/phases";
import { sessionSequence } from "@/lib/skip-counting/sequence";
import { cn } from "@/lib/utils";

// The one-time "notice the pattern" reveal, ported from the vanilla app's renderGrid(): every
// number in the step-pattern fades in, staggered outward from the start value. This plays once
// per cell (the inline style below is computed the same way on every render, so React never
// re-touches it once set - only exception: a cell that becomes landed or gets marked wrong drops
// the animation clause entirely, switching to a plain class-driven style instead of restarting a
// finished animation, which would visually snap it backwards).
const PATTERN_BASE = 300;
const PATTERN_DUR = 380;

export function HundredGridView() {
  const { session, phaseObj, dispatch } = useSkipCounting();
  const { startVal, step, jumps } = session;
  const landed = getLanded(phaseObj, jumps);
  const current = getCurrent(phaseObj, jumps);
  const seq = sessionSequence(session);

  const interactive = isInteractiveGridTap(phaseObj);

  const seqIndex = new Map<number, number>();
  seq.forEach((v, i) => {
    if (i <= landed) seqIndex.set(v, i);
  });

  const cells = [];
  for (let v = 1; v <= 100; v++) {
    const idx = seqIndex.has(v) ? seqIndex.get(v)! : -1;
    const isLanded = idx >= 0;
    const isWrong = session.wrongGridTaps.includes(v);
    const inPattern = ((((v - startVal) % step) + step) % step) === 0;
    const isTappable = interactive && !isLanded && !isWrong;

    let animation: string | undefined;
    if (inPattern && !isLanded && !isWrong) {
      const patternDelay = PATTERN_BASE + Math.abs(v - startVal) * 1.5;
      animation = `revealPattern ${PATTERN_DUR}ms ease ${patternDelay}ms forwards`;
    }

    const className = cn(
      "grid-cell",
      idx === 0 && "start",
      idx > 0 && "landed",
      idx >= 0 && idx === current && "current",
      isWrong && "wrong",
      isTappable && "tappable",
    );

    cells.push(
      isTappable ? (
        <button
          key={v}
          type="button"
          aria-label={`Tap ${v}`}
          data-tap-value={v}
          className={className}
          style={animation ? { animation } : undefined}
          onClick={() => dispatch({ type: "TAP_NUMBER", value: v })}
        >
          {v}
        </button>
      ) : (
        <div key={v} className={className} style={animation ? { animation } : undefined}>
          {v}
        </div>
      ),
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="hundred-grid">{cells}</div>
    </div>
  );
}
