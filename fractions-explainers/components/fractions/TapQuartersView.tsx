"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ds/Button";
import { useFractions } from "./FractionContext";
import { Callout } from "./Callout";
import { ReadOnlyBar } from "./ReadOnlyBar";
import type { TapQuartersStep } from "@/lib/fractions/types";

const RETRY_DELAY_MS = 1100;

function colorVar(color: "piece1" | "piece2") {
  return color === "piece1" ? "var(--color-piece1)" : "var(--color-piece2)";
}

/** The learner shades `step.target` cells themselves (tapping toggles, a Check button grades the
 * attempt) instead of the fraction being revealed for them. Every cell is always tappable; when
 * `step.referenceBar` is set (the combine concept's second piece), a separate read-only bar is
 * shown above it instead of sharing cells with it. `tapped`/`status` are plain local state: this
 * view remounts fresh every time the step changes (see Workspace's `key={session.stepIdx}`), so
 * there is nothing to reset by hand when moving on or going back. Once correct, rendering
 * deliberately switches from "whichever cells were actually tapped" to the canonical contiguous
 * positions (`0..target-1`) - the count is all that was ever graded, but every later step assumes
 * contiguous-from-left shading, so snapping to that on success keeps things visually continuous. */
export function TapQuartersView({ step }: { step: TapQuartersStep }) {
  const { session, dispatch } = useFractions();
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"answering" | "incorrect">("answering");
  const solved = session.solved;

  useEffect(() => {
    if (status !== "incorrect") return;
    const timer = window.setTimeout(() => {
      setTapped(new Set());
      setStatus("answering");
    }, RETRY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  function toggleCell(i: number) {
    if (solved || status !== "answering") return;
    setTapped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleCheck() {
    if (tapped.size === step.target) {
      dispatch({ type: "MARK_SOLVED" });
    } else {
      setStatus("incorrect");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {step.referenceBar && (
        <ReadOnlyBar
          cellCount={step.cellCount}
          shaded={step.referenceBar.shaded}
          color={colorVar(step.referenceBar.color)}
          caption={step.referenceBar.caption}
          compact
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-1.5"
      >
        <div
          className="flex w-[280px] max-w-[78vw] max-[380px]:w-[240px] h-16 rounded-[10px] overflow-hidden border-2"
          style={{
            borderColor: "var(--color-choco-dark)",
            boxShadow: "inset 0 2px 3px rgba(255,255,255,0.12), inset 0 -3px 5px rgba(0,0,0,0.25)",
          }}
        >
          {Array.from({ length: step.cellCount }).map((_, i) => {
            const isCanonicalActive = solved && i < step.target;
            const isTapped = !solved && tapped.has(i);
            const isShaded = isCanonicalActive || isTapped;
            const tappable = !solved && status === "answering";

            const cellStyle = {
              borderColor: "var(--color-choco-dark)",
              background: isShaded
                ? status === "incorrect" && isTapped
                  ? "var(--color-accent)"
                  : colorVar(step.activeColor)
                : "linear-gradient(155deg, var(--color-choco-2), var(--color-choco) 60%)",
            };

            if (!tappable) {
              return (
                <div
                  key={i}
                  className={cn("flex-1", i < step.cellCount - 1 && "border-r-[3px]")}
                  style={cellStyle}
                />
              );
            }

            return (
              <button
                key={i}
                type="button"
                aria-pressed={isTapped}
                aria-label={`Part ${i + 1} of ${step.cellCount}`}
                onClick={() => toggleCell(i)}
                className={cn(
                  "flex-1 cursor-pointer transition-transform active:scale-95",
                  i < step.cellCount - 1 && "border-r-[3px]",
                )}
                style={cellStyle}
              />
            );
          })}
        </div>
        <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-ink-3">quarters</div>
      </motion.div>

      <div className="flex flex-col items-center gap-2.5 min-h-[76px]">
        {solved ? (
          <>
            <div className="flex items-center gap-1.5 text-left font-sans text-[14px] font-semibold">
              <Check size={16} />
              Correct!
            </div>
            {step.solvedCallout && <Callout parts={step.solvedCallout} />}
          </>
        ) : status === "incorrect" ? (
          <div className="flex items-center gap-1.5 text-accent font-sans text-[14px] font-semibold">
            <X size={16} />
            Try again
          </div>
        ) : (
          <>
            {step.promptCallout && <Callout parts={step.promptCallout} />}
            <p className="font-sans text-[13px] text-ink-2">Tap, then check.</p>
            <Button variant="primary" onClick={handleCheck} disabled={tapped.size === 0}>
              Check
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
