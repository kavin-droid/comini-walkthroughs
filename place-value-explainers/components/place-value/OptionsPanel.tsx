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
import { usePlaceValue } from "./PlaceValueContext";
import { useVisualizeForm } from "./VisualizeFormContext";
import { HideTextToggle } from "./HideTextToggle";

function ProgressionDropdown() {
  const { config } = usePlaceValue();
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

/** Mobile-only: all fields stacked in the settings bottom sheet (Question, Concept, Progression,
 * Visualize) - desktop splits the same shared form across QuestionRow (Question) and HeaderPills
 * (Concept + Progression) instead. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config } = usePlaceValue();
  const { numberText, setNumberText, error, handleVisualize } = useVisualizeForm();

  function submit() {
    if (handleVisualize()) onVisualized?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            aria-label={config.numberLabel}
            value={numberText}
            onChange={(e) => setNumberText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            min={config.numberMin}
            max={config.numberMax}
            className="w-24 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
        </div>
        {error && <p className="text-accent text-[13px] mt-1.5">{error}</p>}
      </div>

      <div>
        <FieldLabel>Concept</FieldLabel>
        <select
          className="w-full h-11 px-3 rounded-lg border border-line bg-card text-[14px] font-semibold text-ink disabled:bg-paper-2 disabled:text-ink-2 disabled:opacity-75 disabled:cursor-not-allowed"
          value={config.concepts[0].id}
          disabled
          onChange={() => {}}
        >
          <option value={config.concepts[0].id}>{config.concepts[0].label}</option>
        </select>
      </div>

      <div>
        <FieldLabel>Progression</FieldLabel>
        <ProgressionDropdown />
      </div>

      <div>
        <FieldLabel>Text</FieldLabel>
        <HideTextToggle variant="row" />
      </div>

      <Button variant="primary" fullWidth onClick={submit}>
        Show
      </Button>
    </div>
  );
}
