"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrayGrid } from "./ArrayGrid";
import { AdditionCallout } from "./AdditionCallout";
import type { CompareSide, CompareStep, Fragment } from "@/lib/multiplication/types";

function CaptionText({ caption }: { caption: Fragment[] }) {
  return (
    <>
      {caption.map((f, i) =>
        f.emphasis === "key" ? (
          <strong key={i} className="font-mono not-italic font-semibold text-row">
            {f.text}
          </strong>
        ) : (
          <span key={i}>{f.text}</span>
        ),
      )}
    </>
  );
}

const APPEAR_MS = 550;
const ROTATE_MS = 700;
const SETTLE_MS = 350;

// Mirrors ArrayGrid.tsx's own arbitrary Tailwind values exactly (dot size, row-tag width/gap,
// grid padding/gap) - needed here purely to pre-size the rotating panel's wrapper to whatever
// footprint the shape will occupy once it's turned 90 degrees, so the surrounding compare-row
// layout doesn't jump around while the rotation plays.
const ITEM = 14;
const GAP = 5;
const TAG_W = 18;
const TAG_GAP = 8;
const PAD = 10;
function gridW(cols: number): number {
  return TAG_W + TAG_GAP + cols * ITEM + (cols - 1) * GAP + 2 * PAD;
}
function gridH(rows: number): number {
  return rows * ITEM + (rows - 1) * GAP + 2 * PAD;
}

type RotatePhase = "appear" | "rotating" | "settled";

/** Animation #2: the array first fades in exactly as a normal, unrotated a x b grid, pauses so a
 * child can register what it's looking at, then the *whole shape* spins 90 degrees as one rigid
 * block - an honest "this got turned on its side" motion instead of individual dots relocating,
 * which read as "dots appearing from somewhere" rather than a rotation. Once the spin finishes it
 * crossfades into the real, correctly-labeled target grid (rows/cols swapped, tags upright again)
 * - ported from an earlier per-dot layoutId version that glided each dot from its old rectangle
 * straight into its new one; smoother in principle, but the *shape* of the motion wasn't legible
 * as "rotation" to a young reader, only as things drifting into new places. */
function RotatingArrayPanel({ side }: { side: CompareSide }) {
  const from = side.rotateFrom!;
  const [phase, setPhase] = useState<RotatePhase>("appear");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("rotating"), APPEAR_MS);
    const t2 = window.setTimeout(() => setPhase("settled"), APPEAR_MS + ROTATE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const spinning = phase !== "settled";
  const wrapStyle = spinning ? { width: gridH(from.rows), height: gridW(from.cols) } : undefined;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", side.dimmed && "opacity-35")}>
      <div className="font-serif text-[15px] italic text-ink text-center px-4 py-2 bg-row-bg border border-row/20 rounded-xl min-h-[38px] min-w-[80px] flex items-center justify-center">
        {phase === "settled" ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <CaptionText caption={side.caption} />
          </motion.span>
        ) : (
          <span aria-hidden className="opacity-0">
            .
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-center" style={wrapStyle}>
        {spinning && (
          <motion.div
            initial={false}
            animate={{ rotate: phase === "rotating" ? 90 : 0 }}
            transition={{ duration: ROTATE_MS / 1000, ease: "easeInOut" }}
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <ArrayGrid rows={from.rows} cols={from.cols} />
            </motion.div>
          </motion.div>
        )}
        {phase === "settled" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: SETTLE_MS / 1000 }}>
            <ArrayGrid
              rows={side.rows}
              cols={side.cols}
              splitAt={side.splitAt}
              allColor={side.allColor}
              countReveal={side.countReveal}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ArrayPanel({ side }: { side: CompareSide }) {
  if (side.rotateFrom) return <RotatingArrayPanel side={side} />;
  return (
    <div className={cn("flex flex-col items-center gap-1.5", side.dimmed && "opacity-35")}>
      <div className="font-serif text-[15px] italic text-ink text-center px-4 py-2 bg-row-bg border border-row/20 rounded-xl">
        <CaptionText caption={side.caption} />
      </div>
      <ArrayGrid
        rows={side.rows}
        cols={side.cols}
        splitAt={side.splitAt}
        allColor={side.allColor}
        countReveal={side.countReveal}
      />
    </div>
  );
}

export function CompareView({ step }: { step: CompareStep }) {
  return (
    <div className="flex flex-col items-center gap-3.5 w-full">
      <div className="flex flex-wrap gap-[18px] justify-center items-center p-1.5">
        <ArrayPanel side={step.left} />
        {step.showPlusBetween && (
          <div className="self-center font-serif font-light text-2xl text-ink-3 pb-1.5">+</div>
        )}
        <ArrayPanel side={step.right} />
      </div>
      {step.calloutAddition && (
        <AdditionCallout terms={step.calloutAddition.terms} total={step.calloutAddition.total} />
      )}
    </div>
  );
}
