"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { plural } from "@/lib/rounding/narration";
import { hopStartOf } from "@/lib/rounding/steps";
import { NlBase, NlMarker, NlMarks, makeGeo, pctOf } from "./NumberLinePrimitives";
import { NlCaption } from "./NlCaption";
import { NlStageFrame } from "./NlStageFrame";
import { useStageWidth } from "@/hooks/useStageWidth";
import { useRounding } from "./RoundingContext";

type Side = "below" | "above";

interface Arc {
  key: string;
  from: number;
  to: number;
  index: number;
  side: Side;
  animate: boolean;
}

function arcGeometry(x1: number, x2: number, side: Side) {
  const y = 62;
  const midX = (x1 + x2) / 2;
  const rise = side === "above" ? 28 : 22;
  return { d: `M ${x1} ${y} Q ${midX} ${y - rise} ${x2} ${y}`, midX, labelY: y - rise - 4 };
}

/** Ported from `renderHop()`. Uses `hopStartOf(step)` (NOT `step.n`) as the marker's starting
 * position - see the non-obvious quirk documented on `buildRoundingSteps` in lib/rounding/steps.ts. */
export function HopView() {
  const { step } = useRounding();
  const stageRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const width = useStageWidth(stageRef);
  const geo = makeGeo(step.lower, step.upper);
  const hopStart = hopStartOf(step);
  const isForward = step.hopDirection === "forward";

  const [current, setCurrent] = useState(hopStart);
  const [hopsDone, setHopsDone] = useState(0);
  const [arcs, setArcs] = useState<Arc[]>(() => {
    if (!isForward) return [];
    // Pre-draw the already-completed back-hop arcs (non-animated), matching the vanilla
    // forward-hop step's `if (isForward) { ... addArc(from, v, i, 'below', false); }` block.
    const pre: Arc[] = [];
    let v = hopStart;
    for (let i = 1; i <= step.stepsToLower; i++) {
      const from = v;
      v -= step.hopStep;
      pre.push({ key: `pre-${i}`, from, to: v, index: i, side: "below", animate: false });
    }
    return pre;
  });

  useEffect(() => {
    const timers: number[] = [];
    const direction = isForward ? 1 : -1;
    const total = step.hopCount;
    const side: Side = isForward ? "above" : "below";
    let cur = hopStart;
    let done = 0;

    function bounceMarker() {
      const el = markerRef.current;
      if (!el) return;
      el.classList.remove("rd-hop-bounce");
      void el.offsetWidth; // force reflow so the animation restarts, ported from vanilla's `void marker.offsetWidth`
      el.classList.add("rd-hop-bounce");
    }

    function doHop() {
      if (done >= total) return;
      const from = cur;
      done += 1;
      cur += direction * step.hopStep;
      setCurrent(cur);
      bounceMarker();
      setArcs((prev) => [...prev, { key: `hop-${done}`, from, to: cur, index: done, side, animate: true }]);
      setHopsDone(done);
      if (done < total) {
        timers.push(window.setTimeout(doHop, 450));
      } else {
        timers.push(
          window.setTimeout(() => {
            markerRef.current?.classList.remove("rd-hop-bounce");
          }, 300),
        );
      }
    }

    timers.push(window.setTimeout(doHop, 400));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markerPct = pctOf(current, geo);

  return (
    <div className="flex flex-col items-center gap-2.5 px-1 py-1.5">
      {step.caption && <NlCaption fragments={step.caption} />}

      <NlStageFrame ref={stageRef}>
        <NlBase />
        <NlMarks lower={step.lower} upper={step.upper} hopStep={step.hopStep} />
        <svg className="absolute inset-0 z-[3] pointer-events-none overflow-visible" width="100%" height="100%">
          {arcs.map((a) => {
            const x1 = (pctOf(a.from, geo) / 100) * width;
            const x2 = (pctOf(a.to, geo) / 100) * width;
            const { d, midX, labelY } = arcGeometry(x1, x2, a.side);
            return (
              <g key={a.key}>
                <path
                  d={d}
                  className={cn(
                    "fill-none opacity-85",
                    a.side === "below" ? "stroke-below" : "stroke-above",
                    a.animate && "rd-draw-arc",
                  )}
                  style={{ strokeWidth: 2.5, strokeDasharray: a.animate ? 40 : "4 3" }}
                />
                <text
                  x={midX}
                  y={labelY}
                  textAnchor="middle"
                  className={cn(
                    "font-mono text-[11px] font-bold",
                    a.side === "below" ? "fill-below" : "fill-above",
                  )}
                >
                  {a.index}
                </text>
              </g>
            );
          })}
        </svg>
        <NlMarker ref={markerRef} value={step.n} leftPct={markerPct} hopping />
      </NlStageFrame>

      <div className="flex gap-2.5 justify-center flex-wrap">
        {isForward && (
          <div className="font-sans text-[15px] font-bold text-center px-4 py-2 rounded-xl bg-below-bg text-below min-w-[120px]">
            {step.lower}: <span className="font-mono text-xl">{step.stepsToLower}</span>{" "}
            {plural(step.stepsToLower, "hop")}
          </div>
        )}
        <div
          className={cn(
            "font-sans text-[15px] font-bold text-center px-4 py-2 rounded-xl min-w-[120px]",
            isForward ? "bg-above-bg text-above" : "bg-below-bg text-below",
          )}
        >
          {isForward ? step.upper : step.lower}: <span className="font-mono text-xl">{hopsDone}</span>{" "}
          {plural(hopsDone, "hop")}
        </div>
      </div>
    </div>
  );
}
