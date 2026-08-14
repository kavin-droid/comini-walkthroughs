"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ds/Button";
import { useFractions } from "./FractionContext";
import { Callout } from "./Callout";
import { ReadOnlyBar } from "./ReadOnlyBar";
import type { TapCombineStep } from "@/lib/fractions/types";

const RETRY_DELAY_MS = 1600;
const COUNT_STEP_MS = 180;

/** The combine concept's closing question: the first two bars are read-only recaps of the two
 * pieces already tapped (see TapQuartersView); the third is a fresh bar the learner taps
 * themselves to show the combined total, checked the same tap-then-Check way. Checking counts
 * whatever was actually tapped right there on the third bar - a numbered badge pops onto each
 * tapped cell in left-to-right order. No separate right/wrong text banner is shown in the
 * workarea for this step - the badges themselves are the feedback, and NarrationBox (outside the
 * workarea) still carries the reasoning once solved. A wrong attempt still silently resets after
 * `RETRY_DELAY_MS` so the learner can try again. Local state resets for free on remount (see
 * Workspace's `key={session.stepIdx}`); the only global state is `session.solved`. */
export function TapCombineView({ step }: { step: TapCombineStep }) {
  const { session, dispatch } = useFractions();
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"answering" | "counting" | "feedback">("answering");
  const solved = session.solved;
  const sortedTapped = Array.from(tapped).sort((a, b) => a - b);

  useEffect(() => {
    if (phase !== "counting") return;
    const timer = window.setTimeout(
      () => {
        if (tapped.size === step.target) dispatch({ type: "MARK_SOLVED" });
        setPhase("feedback");
      },
      tapped.size * COUNT_STEP_MS + 500,
    );
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "feedback" || solved) return;
    const timer = window.setTimeout(() => {
      setTapped(new Set());
      setPhase("answering");
    }, RETRY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, solved]);

  function toggleCell(i: number) {
    if (phase !== "answering") return;
    setTapped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleCheck() {
    if (tapped.size > 0) setPhase("counting");
  }

  const isCanonicalActive = (i: number) => solved && i < step.target;

  return (
    <div className="flex flex-col items-center gap-3">
      <ReadOnlyBar
        cellCount={step.cellCount}
        shaded={step.piece1Shaded}
        color="var(--color-piece1)"
        caption={step.piece1Caption}
        compact
      />
      <ReadOnlyBar
        cellCount={step.cellCount}
        shaded={step.piece2Shaded}
        color="var(--color-piece2)"
        caption={step.piece2Caption}
        compact
      />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-1.5"
      >
        <div
          className="flex w-[280px] max-w-[78vw] max-[380px]:w-[240px] h-11 rounded-[10px] overflow-hidden border-2"
          style={{
            borderColor: "var(--color-choco-dark)",
            boxShadow: "inset 0 2px 3px rgba(255,255,255,0.12), inset 0 -3px 5px rgba(0,0,0,0.25)",
          }}
        >
          {Array.from({ length: step.cellCount }).map((_, i) => {
            const wasTapped = tapped.has(i);
            const isShaded = isCanonicalActive(i) || (!solved && wasTapped);
            const tappable = !solved && phase === "answering";

            // Once solved, shading has already snapped to the canonical 0..target-1 positions
            // (see isCanonicalActive) regardless of which cells were actually tapped, so the
            // badge numbering snaps right along with it - otherwise a correct-but-scattered tap
            // (e.g. cells 0 and 2 for a target of 2) would leave a badge sitting on an unshaded
            // cell once the view re-renders with canonical shading. Pre-solve (mid-count or a
            // wrong attempt awaiting retry), badges instead number the cells actually tapped, in
            // left-to-right order.
            const badgeNumber = solved
              ? i < step.target
                ? i + 1
                : null
              : (phase === "counting" || phase === "feedback") && wasTapped
                ? sortedTapped.indexOf(i) + 1
                : null;
            const showBadge = badgeNumber !== null;
            const cellStyle = {
              borderColor: "var(--color-choco-dark)",
              background: isShaded
                ? "var(--color-half)"
                : "linear-gradient(155deg, var(--color-choco-2), var(--color-choco) 60%)",
            };

            const badge = showBadge && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: solved ? 0 : ((badgeNumber - 1) * COUNT_STEP_MS) / 1000,
                  duration: 0.3,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="absolute inset-0 flex items-center justify-center font-mono text-[15px] font-bold text-white"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}
              >
                {badgeNumber}
              </motion.span>
            );

            if (!tappable) {
              return (
                <div key={i} className={cn("relative flex-1", i < step.cellCount - 1 && "border-r-[3px]")} style={cellStyle}>
                  {badge}
                </div>
              );
            }

            return (
              <button
                key={i}
                type="button"
                aria-pressed={wasTapped}
                aria-label={`Part ${i + 1} of ${step.cellCount}`}
                onClick={() => toggleCell(i)}
                className={cn(
                  "relative flex-1 cursor-pointer transition-transform active:scale-95",
                  i < step.cellCount - 1 && "border-r-[3px]",
                )}
                style={cellStyle}
              >
                {badge}
              </button>
            );
          })}
        </div>
        <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-ink-3">{step.totalCaption}</div>
      </motion.div>

      <div className="flex flex-col items-center gap-2.5 min-h-[76px]">
        {phase === "answering" && (
          <>
            {step.promptCallout && <Callout parts={step.promptCallout} />}
            <p className="font-sans text-[13px] text-ink-2">Tap this bar, then check.</p>
            <Button variant="primary" onClick={handleCheck} disabled={tapped.size === 0}>
              Check
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
