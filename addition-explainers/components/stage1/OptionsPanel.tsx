"use client";

import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StageDropdownContent } from "@/components/ds/StageDropdownContent";
import { useStage1VisualizeForm } from "@/hooks/useStage1VisualizeForm";
import { useStage1 } from "./Stage1Context";
import { Button } from "@/components/ds/Button";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

function ProgressionDropdown() {
  const { config } = useStage1();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full h-9 flex items-center justify-between px-3 rounded-lg border border-line bg-card text-[13px] text-ink font-mono">
          <span>{config.ageBand}</span>
          <ChevronDown size={14} className="text-ink-3" />
        </button>
      </DropdownMenuTrigger>
      <StageDropdownContent currentId={config.id} align="start" />
    </DropdownMenu>
  );
}

/** Mobile-only: fields stacked in the settings bottom sheet. Matches the addition app's
 * OptionsPanel structure (Question/Concept/Progression) for consistency across all 3 stages -
 * previously a leaner single-link version, upgraded so Concept shows here too and Progression
 * lists all 3 stages via the same dropdown, not just a single "next stage" link. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config, a1, setA1, a2, setA2, error, handleVisualize } = useStage1VisualizeForm(onVisualized);
  const { config: stage1Config } = useStage1();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={a1}
            onChange={(e) => setA1(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={config.addendMin}
            max={config.addendMax}
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-xl text-ink-3">+</span>
          <input
            type="number"
            inputMode="numeric"
            value={a2}
            onChange={(e) => setA2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={config.addendMin}
            max={config.addendMax}
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
        </div>
        {error && <p className="text-accent text-[13px] mt-1.5">{error}</p>}
      </div>

      <div>
        <FieldLabel>Concept</FieldLabel>
        <div className="h-9 flex items-center px-3 rounded-lg border border-line bg-paper-2 text-[13px] text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {stage1Config.conceptLabel}
        </div>
      </div>

      <div>
        <FieldLabel>Stage</FieldLabel>
        <ProgressionDropdown />
      </div>

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Start
      </Button>
    </div>
  );
}
