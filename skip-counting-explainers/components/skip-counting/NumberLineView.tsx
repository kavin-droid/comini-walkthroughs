"use client";

import { useLayoutEffect, useRef } from "react";
import { useSkipCounting } from "./SkipCountingContext";
import { getCurrent, getLanded, getTapTargetIndex, isRevealAnswer } from "@/lib/skip-counting/phases";
import { opSymbol, sessionSequence } from "@/lib/skip-counting/sequence";
import { tapStepsOff } from "@/lib/skip-counting/narration";
import { cn } from "@/lib/utils";

const PX = 32;
const SIDE_PAD = 22;

export function NumberLineView() {
  const { session, phaseObj, dispatch } = useSkipCounting();
  const { startVal, dir, step, jumps, phaseIdx, lastWrongTap } = session;
  const landed = getLanded(phaseObj, jumps);
  const current = getCurrent(phaseObj, jumps);
  const revealAnswer = isRevealAnswer(phaseObj);
  const fullSeq = sessionSequence(session);
  const end = fullSeq[fullSeq.length - 1];

  const tapTargetIdx = getTapTargetIndex(phaseObj);
  const interactive = tapTargetIdx !== null;
  const targetValue = tapTargetIdx !== null ? fullSeq[tapTargetIdx] : null;
  // Once a wrong tap "hops" onto a point, tapping is disabled until Try Again - see Footer.
  const wrongValue = interactive ? lastWrongTap : null;
  const currentValue = current >= 0 ? fullSeq[current] : null;

  const seq = fullSeq.slice(0, landed + 1);
  const landedSet = new Set(seq);

  const seqMin = Math.min(...fullSeq, ...(wrongValue !== null ? [wrongValue] : []));
  const seqMax = Math.max(...fullSeq, ...(wrongValue !== null ? [wrongValue] : []));
  const totalWidth = (seqMax - seqMin) * PX + SIDE_PAD * 2;
  const xOf = (v: number) => SIDE_PAD + (v - seqMin) * PX;

  const stageWrapRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const wrap = stageWrapRef.current;
    if (!wrap) return;

    if (interactive) {
      // Only scroll (smoothly) when the tap target isn't already fully visible - unlike the
      // passive-phase case below, tapping doesn't need the target re-centered every render.
      const el = targetRef.current;
      if (!el) return;
      const wrapRect = wrap.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const outOfView = elRect.left < wrapRect.left || elRect.right > wrapRect.right;
      if (outOfView) {
        wrap.scrollTo({ left: Math.max(0, el.offsetLeft - wrap.clientWidth / 2), behavior: "smooth" });
      }
      return;
    }

    const el = currentRef.current ?? startRef.current;
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [phaseIdx, interactive, targetValue]);

  const arcPaths: string[] = [];
  const deltas: { midX: number; alt: boolean }[] = [];
  for (let i = 0; i < seq.length - 1; i++) {
    const x1 = xOf(seq[i]);
    const x2 = xOf(seq[i + 1]);
    const midX = (x1 + x2) / 2;
    arcPaths.push(`M ${x1} 96 Q ${midX} 4 ${x2} 96`);
    deltas.push({ midX, alt: jumps >= 6 && i % 2 === 1 });
  }

  // The wrong-hop dashed arc, from the last confirmed point to where the child mistakenly tapped.
  let wrongArc: { path: string; midX: number; stepsOff: number } | null = null;
  if (wrongValue !== null && currentValue !== null) {
    const x1 = xOf(currentValue);
    const x2 = xOf(wrongValue);
    const midX = (x1 + x2) / 2;
    wrongArc = {
      path: `M ${x1} 96 Q ${midX} 4 ${x2} 96`,
      midX,
      stepsOff: targetValue !== null ? tapStepsOff(wrongValue, targetValue) : 0,
    };
  }

  const neutralPoints: number[] = [];
  for (let v = seqMin; v <= seqMax; v++) {
    if (!landedSet.has(v) && v !== wrongValue) neutralPoints.push(v);
  }

  return (
    <div className="flex flex-col items-center gap-2 max-w-full">
      <div className="font-serif italic text-[14px] text-ink text-center py-[7px] px-3.5 bg-jump-bg rounded-[10px] border border-[rgba(107,95,204,0.2)]">
        {revealAnswer ? (
          <>
            {dir === 1 ? "Skip counting" : "Counting back"} from{" "}
            <strong className="font-mono not-italic font-bold text-jump">{startVal}</strong> to{" "}
            <strong className="font-mono not-italic font-bold text-jump">{end}</strong>, {jumps} jumps of {step}
          </>
        ) : (
          <>
            {dir === 1 ? "Skip counting" : "Counting back"} from{" "}
            <strong className="font-mono not-italic font-bold text-jump">{startVal}</strong> in {step}s
          </>
        )}
      </div>

      <div ref={stageWrapRef} className="arc-stage-wrap">
        <div className="arc-stage" style={{ width: totalWidth }}>
          <div className="arc-baseline" />

          <svg
            className="arc-svg"
            viewBox={`0 0 ${totalWidth} 96`}
            width={totalWidth}
            height={96}
          >
            {arcPaths.map((d, i) => (
              <path key={i} className="arc-line" d={d} />
            ))}
            {wrongArc && <path className="arc-line-wrong" d={wrongArc.path} />}
          </svg>

          {deltas.map((d, i) => (
            <div
              key={i}
              className={cn("arc-delta", d.alt && "alt")}
              style={{ left: d.midX }}
            >
              {opSymbol(dir)}
              {step}
            </div>
          ))}

          {wrongArc && (
            <div className="arc-delta wrong" style={{ left: wrongArc.midX }}>
              {wrongArc.stepsOff} {wrongArc.stepsOff === 1 ? "step" : "steps"} off
            </div>
          )}

          {neutralPoints.map((v) => (
            <div key={v} className="arc-point neutral" style={{ left: xOf(v) }}>
              <div className={cn("arc-point-dot", interactive && wrongValue === null && "tappable")} />
              <div className="arc-point-label">{v}</div>
              {interactive && wrongValue === null && (
                <button
                  ref={v === targetValue ? targetRef : undefined}
                  type="button"
                  aria-label={`Tap ${v}`}
                  data-tap-value={v}
                  className="arc-tap-hit"
                  onClick={() => dispatch({ type: "TAP_NUMBER", value: v })}
                />
              )}
            </div>
          ))}

          {wrongValue !== null && (
            <div className="arc-point wrong-hop current" style={{ left: xOf(wrongValue) }}>
              <div className="arc-point-dot" />
              <div className="arc-point-label">{wrongValue}</div>
            </div>
          )}

          {seq.map((v, i) => {
            const isCurrent = i === current && wrongValue === null;
            return (
              <div
                key={v}
                ref={i === 0 ? startRef : isCurrent ? currentRef : undefined}
                className={cn("arc-point", i === 0 ? "start" : "landed", isCurrent && "current")}
                style={{ left: xOf(v) }}
              >
                <div className="arc-point-dot" />
                <div className="arc-point-label">{v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
