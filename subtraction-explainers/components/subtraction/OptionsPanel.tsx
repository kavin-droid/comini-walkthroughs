"use client";

import { Button } from "@/components/ds/Button";
import { StageDropdown } from "@/components/shared/StageDropdown";
import { useSubtractionVisualizeForm } from "@/hooks/useSubtractionVisualizeForm";
import { useSubtraction } from "./SubtractionContext";
import { HideTextRow } from "./HideTextToggle";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: all three fields stacked in the settings bottom sheet. Desktop uses QuestionRow
 * (options-row-desktop) + HeaderPills (Concept/Progression in the header) instead. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config, minuend, setMinuend, subtrahend, setSubtrahend, error, handleVisualize } =
    useSubtractionVisualizeForm(onVisualized);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={minuend}
            onChange={(e) => setMinuend(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={config.minuendMin}
            max={config.minuendMax}
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
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
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
        </div>
        {error && <p className="text-accent text-[13px] mt-1.5">{error}</p>}
      </div>

      <div>
        <FieldLabel>Concept</FieldLabel>
        <div className="h-9 flex items-center px-3 rounded-lg border border-line bg-paper-2 text-[13px] text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {config.conceptLabel}
        </div>
      </div>

      <div>
        <FieldLabel>Progression</FieldLabel>
        <StageDropdown currentId={config.id} className="w-full h-9 max-w-none justify-between px-3" />
      </div>

      <div>
        <FieldLabel>Accessibility</FieldLabel>
        <HideTextRow />
      </div>

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Show
      </Button>
    </div>
  );
}
