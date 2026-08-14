"use client";

import { Button } from "@/components/ds/Button";
import { useVisualizeForm } from "@/hooks/useVisualizeForm";
import { QuestionFields } from "./QuestionFields";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: all fields stacked in the settings bottom sheet. Desktop uses QuestionRow
 * (options-row-desktop) + HeaderPills (Concept/age-band in the header) instead. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const form = useVisualizeForm(onVisualized);
  const { config, error, handleVisualize } = form;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <QuestionFields form={form} inputBg="bg-card" />
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
        <div className="w-full h-9 flex items-center px-3 rounded-lg border border-line bg-card text-[13px] text-ink font-mono">
          {config.ageBand}
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Visualize
      </Button>
    </div>
  );
}
