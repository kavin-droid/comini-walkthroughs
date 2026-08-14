"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface StageGeo {
  lo: number;
  hi: number;
  span: number;
}

export function makeGeo(lower: number, upper: number): StageGeo {
  return { lo: lower, hi: upper, span: upper - lower };
}

export function pctOf(v: number, geo: StageGeo): number {
  return ((v - geo.lo) / geo.span) * 100;
}

/** Ported from the vanilla apps' `.nl-base` - the flat baseline track. */
export function NlBase() {
  return <div className="absolute top-[62px] left-0 right-0 h-1 bg-line-2 rounded-full" />;
}

/** Ported from `buildMarks()`: one tick+label per multiple of `hopStep` between lower and upper
 * inclusive, with the two endpoints (lower/upper) styled larger/bolder and colored
 * below/above. */
export function NlMarks({ lower, upper, hopStep }: { lower: number; upper: number; hopStep: number }) {
  const geo = makeGeo(lower, upper);
  const marks: number[] = [];
  for (let v = lower; v <= upper; v += hopStep) marks.push(v);

  return (
    <>
      {marks.map((v) => {
        const isEnd = v === lower || v === upper;
        const isBelowEnd = v === lower;
        const isAboveEnd = v === upper;
        return (
          <div
            key={v}
            className="absolute top-[54px] -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
            style={{ left: `${pctOf(v, geo)}%` }}
          >
            <div
              className={cn(
                isEnd ? "relative -top-0.5 w-[3px] h-4 bg-ink-2" : "w-0.5 h-3 bg-line-2",
              )}
            />
            <div
              className={cn(
                "font-mono leading-none",
                isEnd
                  ? "text-[13px] min-[900px]:text-[14px] font-bold text-ink"
                  : "text-[11px] min-[900px]:text-[12px] font-semibold text-ink-3",
                isBelowEnd && "text-below",
                isAboveEnd && "text-above",
              )}
            >
              {v}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Ported from `makeMarker()`: the value badge + stem + dot pinned to `leftPct`. `hopping`
 * swaps the CSS transition to the faster hop-specific curve; `bounce` triggers the hopBounce
 * keyframe. `bounce` applies the class once (fine for the single-shot LineView/CloserView use);
 * HopView needs the SAME class re-triggered on every repeated hop, which CSS alone can't do for
 * an unchanged className - it forwards a ref and does the vanilla `void el.offsetWidth` reflow
 * trick itself (remove class, force reflow, re-add class) directly on the DOM node, exactly like
 * the vanilla `doHop()` function did. */
export const NlMarker = forwardRef<HTMLDivElement, {
  value: number;
  leftPct: number;
  hopping?: boolean;
  bounce?: boolean;
}>(function NlMarker({ value, leftPct, hopping, bounce }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-[5] pointer-events-none",
        bounce && "rd-hop-bounce",
      )}
      style={{
        left: `${leftPct}%`,
        transition: hopping ? "left 0.3s cubic-bezier(0.34, 1.4, 0.64, 1)" : "left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className="font-mono text-[13px] font-bold text-num bg-num-bg px-2 py-0.5 rounded-full border border-num/35 whitespace-nowrap">
        {value}
      </div>
      <div className="w-0.5 h-3.5 bg-num opacity-55" />
      <div className="w-4 h-4 rounded-full bg-num border-[3px] border-card shadow-[0_0_0_2px_var(--color-num)]" />
    </div>
  );
});
