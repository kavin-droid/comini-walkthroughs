"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Q, T } from "@/lib/rounding/narration";
import { NlBase, NlMarker, NlMarks, makeGeo, pctOf } from "./NumberLinePrimitives";
import { NlCaption } from "./NlCaption";
import { NlStageFrame } from "./NlStageFrame";
import { TapHint } from "./TapHint";
import { useRounding } from "./RoundingContext";
import { useNarrationOverride } from "./NarrationOverrideContext";

/** Ported from `renderLine()`. Handles both the interactive placeTap step (tap the line to place
 * the marker at `n`, with tolerance for roundTo=100 - see the vanilla `tolerance` constant) and
 * every static-marker line step (bridge, exact-case, etc). */
export function LineView() {
  const { step, dispatch } = useRounding();
  const { setOverride } = useNarrationOverride();
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const [placed, setPlaced] = useState(false);
  const [tapPct, setTapPct] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "right" | "wrong"; text: string } | null>(null);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  const geo = makeGeo(step.lower, step.upper);
  const interactive = step.placeTap && !placed;

  function handleStageClick(e: MouseEvent<HTMLDivElement>) {
    if (!interactive || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const snapped = Math.round(geo.lo + (pct / 100) * geo.span);
    const tolerance = step.roundTo === 100 ? 3 : 0;
    const accepted = Math.abs(snapped - step.n) <= tolerance;

    if (accepted) {
      setTapPct(pctOf(step.n, geo));
      setPlaced(true);
      setFeedback({
        kind: "right",
        text: `Yes! ${step.n} sits right there, between ${step.lower} and ${step.upper}.`,
      });
      setOverride([T("Great. "), Q(step.n), T(" is between "), Q(step.lower), T(" and "), Q(step.upper), T(".")]);
      const t = window.setTimeout(() => {
        dispatch({ type: "PLACE_MARKER" });
        dispatch({ type: "ADVANCE_PHASE" });
      }, 1200);
      timers.current.push(t);
    } else {
      setTapPct(pctOf(snapped, geo));
      setFeedback({ kind: "wrong", text: `Try again, closer to ${step.n}.` });
      const t = window.setTimeout(() => {
        setFeedback(null);
        setTapPct(null);
      }, 1200);
      timers.current.push(t);
    }
  }

  const staticVal = step.settleTo ?? step.showMarkerAt ?? step.n;
  const staticPct = pctOf(staticVal, geo);

  return (
    <div className="flex flex-col items-center gap-2.5 px-1 py-1.5">
      {step.caption && <NlCaption fragments={step.caption} />}

      <NlStageFrame ref={stageRef} interactive={interactive} onClickStage={handleStageClick}>
        <NlBase />
        <NlMarks lower={step.lower} upper={step.upper} hopStep={step.hopStep} />
        {interactive ? (
          tapPct !== null && <NlMarker value={step.n} leftPct={tapPct} />
        ) : (
          <NlMarker value={step.n} leftPct={staticPct} />
        )}
        {interactive && <TapHint />}
      </NlStageFrame>

      {step.placeTap && feedback && (
        <div
          className={cn(
            "font-sans text-[14px] font-semibold text-center px-3.5 py-2.5 rounded-[10px] rd-fade-in max-w-[320px]",
            feedback.kind === "right" && "text-left bg-left/10",
            feedback.kind === "wrong" && "text-used bg-used/[0.08]",
          )}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
