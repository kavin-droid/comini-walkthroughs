"use client";

import { Button } from "@/components/ds/Button";
import { StageDropdown } from "@/components/shared/StageDropdown";
import { useStage1VisualizeForm } from "@/hooks/useStage1VisualizeForm";
import { STAGE1_MINUEND_MIN, STAGE1_MINUEND_MAX, STAGE1_SUBTRAHEND_MIN, STAGE1_SUBTRAHEND_MAX } from "@/lib/stage1/config";
import { Stage1ConceptDropdown } from "./Stage1ConceptDropdown";
import { Stage1HideTextRow } from "./Stage1HideTextToggle";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: mirrors subtraction/OptionsPanel.tsx's field-stack layout exactly (round-20:
 * header consistency) - all fields stacked in the settings bottom sheet. Desktop uses
 * Stage1QuestionRow (Stage1DesktopOptionsRow) + Stage1HeaderPills in the header instead. */
export function Stage1OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { minuend, setMinuend, subtrahend, setSubtrahend, error, handleVisualize } =
    useStage1VisualizeForm(onVisualized);

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
            min={STAGE1_MINUEND_MIN}
            max={STAGE1_MINUEND_MAX}
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-xl text-ink-3">−</span>
          <input
            type="number"
            inputMode="numeric"
            value={subtrahend}
            onChange={(e) => setSubtrahend(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={STAGE1_SUBTRAHEND_MIN}
            max={STAGE1_SUBTRAHEND_MAX}
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
        </div>
        {error && <p className="text-accent text-[13px] mt-1.5">{error}</p>}
      </div>

      <div>
        <FieldLabel>Concept</FieldLabel>
        <Stage1ConceptDropdown className="w-full h-9 max-w-none justify-between px-3 rounded-lg" />
      </div>

      <div>
        <FieldLabel>Progression</FieldLabel>
        <StageDropdown currentId="stage1" className="w-full h-9 max-w-none justify-between px-3" />
      </div>

      <div>
        <FieldLabel>Accessibility</FieldLabel>
        <Stage1HideTextRow />
      </div>

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Show
      </Button>
    </div>
  );
}
