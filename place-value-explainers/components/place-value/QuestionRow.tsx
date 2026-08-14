"use client";

import { usePlaceValue } from "./PlaceValueContext";
import { useVisualizeForm } from "./VisualizeFormContext";
import { Button } from "@/components/ds/Button";

/** Desktop-only inline layout matching the vanilla app-shell spec: "Question" label, the single
 * number input, and the Visualize button sit in a single row - on desktop this shows the question
 * only (Concept/Progression live in the header instead, see HeaderPills). */
export function QuestionRow() {
  const { config } = usePlaceValue();
  const { numberText, setNumberText, error, handleVisualize } = useVisualizeForm();

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <input
          type="number"
          inputMode="numeric"
          aria-label={config.numberLabel}
          value={numberText}
          onChange={(e) => setNumberText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
          min={config.numberMin}
          max={config.numberMax}
          className="w-24 h-11 rounded-lg border border-line bg-paper px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
        />
      </div>
      <Button variant="primary" onClick={() => handleVisualize()} className="w-[160px] shrink-0">
        Show
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
