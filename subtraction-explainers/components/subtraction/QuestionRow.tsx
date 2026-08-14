"use client";

import { useSubtractionVisualizeForm } from "@/hooks/useSubtractionVisualizeForm";
import { Button } from "@/components/ds/Button";

/** Desktop-only inline layout: "Question" label, the two number inputs, and the Visualize
 * button all sit in a single row (Concept/Progression live in the header instead, see
 * HeaderPills). */
export function QuestionRow() {
  const { config, minuend, setMinuend, subtrahend, setSubtrahend, error, handleVisualize } =
    useSubtractionVisualizeForm();

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <div className="flex items-center gap-[18px] flex-1 flex-nowrap">
          <input
            type="number"
            inputMode="numeric"
            value={minuend}
            onChange={(e) => setMinuend(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={config.minuendMin}
            max={config.minuendMax}
            className="w-20 h-11 rounded-lg border border-line bg-paper px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-xl text-ink-3">−</span>
          <input
            type="number"
            inputMode="numeric"
            value={subtrahend}
            onChange={(e) => setSubtrahend(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={config.subtrahendMin}
            max={config.subtrahendMax}
            className="w-20 h-11 rounded-lg border border-line bg-paper px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <Button variant="primary" onClick={handleVisualize} className="w-[160px] shrink-0">
        Show
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
