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
import { useRounding } from "./RoundingContext";
import { RoundToToggle } from "./RoundToToggle";
import { InstructionsToggle } from "./InstructionsToggle";
import { useNarrationVisibility } from "./NarrationVisibilityContext";

function ProgressionDropdown() {
  const { config } = useRounding();
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
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: all fields stacked in the settings bottom sheet. Desktop uses QuestionRow
 * (options-row-desktop) + HeaderPills (Concept/Progression in the header) instead. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config, numberStr, setNumberStr, roundTo, setRoundTo, error, handleVisualize } =
    useVisualizeForm(onVisualized);
  const hasToggle = config.roundToOptions.length > 1;
  const { visible: instructionsVisible } = useNarrationVisibility();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <input
            type="number"
            inputMode="numeric"
            value={numberStr}
            onChange={(e) => setNumberStr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={config.numberMin}
            max={config.numberMax}
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl font-medium text-center text-ink focus:outline-none focus:border-accent"
          />
          {hasToggle ? (
            <RoundToToggle options={config.roundToOptions} value={roundTo} onChange={setRoundTo} />
          ) : (
            <span className="font-serif italic font-light text-[22px] text-ink-3 whitespace-nowrap">
              ≈ nearest ten
            </span>
          )}
        </div>
        {error && <p className="text-accent text-[13px] mt-1.5 text-center">{error}</p>}
      </div>

      <div>
        <FieldLabel>Concept</FieldLabel>
        <div className="h-9 flex items-center px-3 rounded-lg border border-line bg-paper-2 text-[13px] text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {config.conceptLabel}
        </div>
      </div>

      <div>
        <FieldLabel>For ages</FieldLabel>
        <ProgressionDropdown />
      </div>

      <div>
        <FieldLabel>Hints</FieldLabel>
        <div className="flex items-center justify-between h-9">
          <span className="text-[13px] text-ink-2">{instructionsVisible ? "Shown" : "Hidden"}</span>
          <InstructionsToggle />
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Go
      </Button>
    </div>
  );
}
