"use client";

import { useVisualizeForm } from "@/hooks/useVisualizeForm";
import { Button } from "@/components/ds/Button";
import { RoundToToggle } from "./RoundToToggle";

/** Desktop-only inline layout matching the vanilla app-shell spec: "Question" label, the number
 * input, the round-to control, and the Visualize button all sit in a single row (not stacked),
 * inside #options-row-desktop - which on desktop shows Question only (Concept/Progression live
 * in the header instead, see HeaderPills). */
export function QuestionRow() {
  const { config, numberStr, setNumberStr, roundTo, setRoundTo, error, handleVisualize } =
    useVisualizeForm();
  const hasToggle = config.roundToOptions.length > 1;

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <div className="flex items-center gap-3 flex-1 flex-nowrap">
          <input
            type="number"
            inputMode="numeric"
            value={numberStr}
            onChange={(e) => setNumberStr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={config.numberMin}
            max={config.numberMax}
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-paper px-2 font-mono text-xl font-medium text-center text-ink focus:outline-none focus:border-accent"
          />
          {hasToggle ? (
            <RoundToToggle options={config.roundToOptions} value={roundTo} onChange={setRoundTo} />
          ) : (
            <span className="font-serif italic font-light text-[22px] text-ink-3 whitespace-nowrap">
              ≈ nearest ten
            </span>
          )}
        </div>
      </div>
      <Button variant="primary" onClick={handleVisualize} className="w-[160px] shrink-0">
        Go
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
