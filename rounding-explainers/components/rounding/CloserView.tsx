"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { plural } from "@/lib/rounding/narration";
import { hopStartOf } from "@/lib/rounding/steps";
import { NlBase, NlMarker, NlMarks, makeGeo, pctOf } from "./NumberLinePrimitives";
import { NlStageFrame } from "./NlStageFrame";
import { useStageWidth } from "@/hooks/useStageWidth";
import { useRounding } from "./RoundingContext";
import { useCloser } from "./CloserContext";

type Side = "below" | "above";

function arcGeometry(x1: number, x2: number, side: Side) {
  const y = 62;
  const midX = (x1 + x2) / 2;
  const rise = side === "above" ? 28 : 22;
  return { d: `M ${x1} ${y} Q ${midX} ${y - rise} ${x2} ${y}`, midX, labelY: y - rise - 4 };
}

/** Ported from `renderCloser()`'s in-workspace half (arcs to both lower/upper, hop counts,
 * animated marker) - see CloserContext for the shared click-driven animation state, and
 * McqOptions for the sibling options-panel half of the same vanilla function. */
export function CloserView() {
  const { step } = useRounding();
  const { arcsHidden, markerSettled, badgeUpdated } = useCloser();
  const stageRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const width = useStageWidth(stageRef);
  const geo = makeGeo(step.lower, step.upper);
  const hopStart = hopStartOf(step);

  useEffect(() => {
    if (!markerSettled) return;
    const el = markerRef.current;
    if (!el) return;
    el.classList.remove("rd-hop-bounce");
    void el.offsetWidth;
    el.classList.add("rd-hop-bounce");
  }, [markerSettled]);

  const belowArcs: { from: number; to: number; index: number }[] = [];
  {
    let v = hopStart;
    for (let i = 1; i <= step.stepsToLower; i++) {
      const from = v;
      v -= step.hopStep;
      belowArcs.push({ from, to: v, index: i });
    }
  }
  const aboveArcs: { from: number; to: number; index: number }[] = [];
  {
    let v = hopStart;
    for (let i = 1; i <= step.stepsToUpper; i++) {
      const from = v;
      v += step.hopStep;
      aboveArcs.push({ from, to: v, index: i });
    }
  }

  const markerPct = pctOf(markerSettled ? step.rounded : hopStart, geo);
  const badgeValue = badgeUpdated ? step.rounded : step.n;

  return (
    <div className="flex flex-col items-center gap-2.5 px-1 py-1.5">
      <NlStageFrame ref={stageRef}>
        <NlBase />
        <NlMarks lower={step.lower} upper={step.upper} hopStep={step.hopStep} />
        {!markerSettled && (
          <svg className="absolute inset-0 z-[3] pointer-events-none overflow-visible" width="100%" height="100%">
            <g className={cn("transition-opacity duration-[250ms]", arcsHidden ? "opacity-0" : "opacity-100")}>
              {[...belowArcs.map((a) => ({ ...a, side: "below" as Side })), ...aboveArcs.map((a) => ({ ...a, side: "above" as Side }))].map(
                (a) => {
                  const x1 = (pctOf(a.from, geo) / 100) * width;
                  const x2 = (pctOf(a.to, geo) / 100) * width;
                  const { d, midX, labelY } = arcGeometry(x1, x2, a.side);
                  return (
                    <g key={`${a.side}-${a.index}`}>
                      <path
                        d={d}
                        style={{ strokeWidth: 2.5, strokeDasharray: "4 3" }}
                        className={cn("fill-none opacity-85", a.side === "below" ? "stroke-below" : "stroke-above")}
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
                },
              )}
            </g>
          </svg>
        )}
        <NlMarker ref={markerRef} value={badgeValue} leftPct={markerPct} hopping />
      </NlStageFrame>

      {!markerSettled && (
        <div
          className={cn(
            "flex gap-2.5 justify-center flex-wrap transition-opacity duration-[250ms]",
            arcsHidden ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="font-sans text-[15px] font-bold text-center px-4 py-2 rounded-xl bg-below-bg text-below min-w-[120px]">
            {step.lower}: <span className="font-mono text-xl">{step.stepsToLower}</span>{" "}
            {plural(step.stepsToLower, "hop")}
          </div>
          <div className="font-sans text-[15px] font-bold text-center px-4 py-2 rounded-xl bg-above-bg text-above min-w-[120px]">
            {step.upper}: <span className="font-mono text-xl">{step.stepsToUpper}</span>{" "}
            {plural(step.stepsToUpper, "hop")}
          </div>
        </div>
      )}
    </div>
  );
}
