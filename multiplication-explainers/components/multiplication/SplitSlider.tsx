"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrayGrid } from "./ArrayGrid";
import { Button } from "@/components/ds/Button";

const ITEM = 14;
const GAP = 5;
const TAG_W = 18;
const TAG_GAP = 8;
const PAD = 10;
const OFFSET_TO_FIRST_DOT = PAD + TAG_W + TAG_GAP;

/** Distributive property only: an interactive stand-in for ArrayView's plain grid on the "split
 * the columns" step (see ArrayStep.splitInteractive) - the child drags a slider to move a line
 * between two columns, previewed live via ArrayGrid's own `splitAt` coloring, then presses
 * "Split" to confirm. `onSplit` dispatches SET_SPLIT, which both stores the choice and advances -
 * matching QuestionOptions' store-and-advance pattern for MCQ answers. The line's pixel position
 * mirrors ArrayGrid's own layout constants (dot size, row-tag width/gap, grid padding) exactly,
 * same technique CompareView's rotation sizing already uses. */
export function SplitSlider({
  rows,
  cols,
  min,
  max,
  defaultValue,
  onSplit,
}: {
  rows: number;
  cols: number;
  min: number;
  max: number;
  defaultValue: number;
  onSplit: (value: number) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const lineLeft = OFFSET_TO_FIRST_DOT + value * (ITEM + GAP) - GAP / 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <ArrayGrid rows={rows} cols={cols} splitAt={value} />
        <motion.div
          className="absolute top-[10px] bottom-[10px] w-[3px] -ml-[1.5px] rounded-full bg-accent pointer-events-none shadow-[0_0_0_3px_rgba(200,68,62,0.18)]"
          animate={{ left: lineLeft }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </div>
      <div className="flex flex-col items-center gap-1.5 w-full max-w-[240px]">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-accent"
          aria-label="Split position"
        />
        <div className="font-mono text-[13px] text-ink-3">
          {value} + {cols - value}
        </div>
      </div>
      <Button variant="primary" onClick={() => onSplit(value)}>
        Split
      </Button>
    </div>
  );
}
