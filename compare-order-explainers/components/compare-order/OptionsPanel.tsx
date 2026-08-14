"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ds/Button";
import { useVisualizeForm } from "@/hooks/useVisualizeForm";
import { useCompareOrder } from "./CompareOrderContext";
import { InstructionsToggleRow } from "./InstructionsToggle";

function ProgressionDropdown() {
  const { config } = useCompareOrder();
  const currentLabel = `${config.id === "stage2" ? "Stage 2" : "Stage 3"} · ${config.ageBand}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full h-9 flex items-center justify-between px-3 rounded-lg border border-line bg-card text-[13px] text-ink font-mono">
          <span>{config.ageBand}</span>
          <ChevronDown size={14} className="text-ink-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuItem disabled className="font-mono text-[13px]">
          {currentLabel}
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="font-mono text-[13px]">
          <Link href={config.progressionHref}>{config.progressionLabel}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-2">
      {children}
    </label>
  );
}

/** Mobile-only: all fields stacked in the settings bottom sheet. Desktop uses QuestionRow
 * (options-row-desktop) + HeaderPills (Concept/Progression in the header) instead, matching the
 * vanilla app-shell's relayoutOptionsPanel() split. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config, inputs, setInput, error, handleVisualize } = useVisualizeForm(onVisualized);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {inputs.map((value, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <input
                id={`num${i}`}
                type="number"
                inputMode="numeric"
                value={value}
                onChange={(e) => setInput(i, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
                min={config.min}
                max={config.max}
                style={{ width: config.sizing.inputWidth, fontSize: config.sizing.inputFontSize }}
                className="h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono font-medium text-center text-ink focus:outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>
        {error && <p className="text-accent text-[13px] mt-2.5 text-center">{error}</p>}
      </div>

      <div>
        <FieldLabel>Concept</FieldLabel>
        <div className="h-9 flex items-center px-3 rounded-lg border border-line bg-paper-2 text-[13px] text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {config.conceptLabel}
        </div>
      </div>

      <div>
        <FieldLabel>Progression</FieldLabel>
        <ProgressionDropdown />
      </div>

      <div>
        <FieldLabel>Accessibility</FieldLabel>
        <InstructionsToggleRow />
      </div>

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Show
      </Button>
    </div>
  );
}
