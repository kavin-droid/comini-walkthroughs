"use client";

import { ArrayGrid } from "./ArrayGrid";
import { SplitSlider } from "./SplitSlider";
import { useMultiplication } from "./MultiplicationContext";
import type { ArrayStep } from "@/lib/multiplication/types";

export function ArrayView({ step }: { step: ArrayStep }) {
  const { dispatch } = useMultiplication();

  return (
    <div className="flex flex-col items-center gap-3 p-1.5">
      <div className="font-serif text-[16px] italic text-ink text-center px-4 py-2 bg-row-bg border border-row/20 rounded-xl">
        {step.caption.map((f, i) =>
          f.emphasis === "key" ? (
            <strong key={i} className="font-mono not-italic font-semibold text-row">
              {f.text}
            </strong>
          ) : (
            <span key={i}>{f.text}</span>
          ),
        )}
      </div>
      {step.splitInteractive ? (
        <SplitSlider
          rows={step.rows}
          cols={step.cols}
          min={step.splitInteractive.min}
          max={step.splitInteractive.max}
          defaultValue={step.splitInteractive.default}
          onSplit={(value) => dispatch({ type: "SET_SPLIT", value })}
        />
      ) : (
        <ArrayGrid
          rows={step.rows}
          cols={step.cols}
          splitAt={step.splitAt}
          highlightLine={step.highlightLine}
          countReveal={step.countReveal}
        />
      )}
    </div>
  );
}
