"use client";

import { useVisualizeForm } from "@/hooks/useVisualizeForm";
import { Button } from "@/components/ds/Button";

/** Desktop-only inline layout matching the vanilla app-shell spec: "Question" label, the four
 * number inputs, and the Visualize button all sit in a single row inside #options-row-desktop -
 * Concept/Progression live in the header instead, see HeaderPills. */
export function QuestionRow() {
  const { config, inputs, setInput, error, handleVisualize } = useVisualizeForm();

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <div className="flex items-center gap-4 flex-1 flex-wrap">
          {inputs.map((value, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                id={`num${i}-desktop`}
                type="number"
                inputMode="numeric"
                value={value}
                onChange={(e) => setInput(i, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
                min={config.min}
                max={config.max}
                style={{ width: config.sizing.inputWidth, fontSize: config.sizing.inputFontSize }}
                className="h-11 rounded-xl border-2 border-line-2 bg-paper px-2 font-mono font-medium text-center text-ink focus:outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>
      </div>
      <Button variant="primary" onClick={handleVisualize} className="shrink-0">
        Show
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
