"use client";

import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ds/Button";
import { StageDropdownContent } from "@/components/ds/StageDropdownContent";
import { useVisualizeForm } from "@/hooks/useVisualizeForm";
import { useAddition } from "./AdditionContext";

function ProgressionDropdown() {
  const { config } = useAddition();

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: all three fields stacked in the settings bottom sheet, unchanged from earlier
 * rounds. Desktop uses QuestionRow (options-row-desktop) + HeaderPills (Concept/Progression in
 * the header) instead - see APP-SHELL-LAYOUT.md's Settings-panel section. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config, a1, setA1, a2, setA2, error, handleVisualize } = useVisualizeForm(onVisualized);

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
          {config.conceptLabel}
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
