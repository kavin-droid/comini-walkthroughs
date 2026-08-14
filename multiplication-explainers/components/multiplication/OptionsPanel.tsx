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
import { cn } from "@/lib/utils";
import { useMultiplication } from "./MultiplicationContext";
import { useVisualizeForm } from "./VisualizeFormContext";
import { useTextVisibility } from "./TextVisibilityContext";

function ProgressionDropdown() {
  const { config } = useMultiplication();
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

/** Mobile-only: all four fields stacked in the settings bottom sheet (Question, Concept,
 * Progression, Visualize), plus the "hide instruction text" toggle - desktop splits the shared
 * form across QuestionRow (Question) and HeaderPills (Concept + Progression) instead, and gets
 * its own header toggle button (HideTextButton) rather than a row here, see
 * APP-SHELL-LAYOUT.md's Settings-panel section. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config } = useMultiplication();
  const { aText, setAText, bText, setBText, conceptId, setConceptId, error, handleVisualize } =
    useVisualizeForm();
  const { hideText, toggleHideText } = useTextVisibility();
  const activeConcept = config.concepts.find((c) => c.id === conceptId);
  const bLocked = activeConcept?.lockFactorB ?? false;

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
            aria-label={config.factorALabel}
            value={aText}
            onChange={(e) => setAText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            min={activeConcept?.factorAMin ?? config.factorAMin}
            max={activeConcept?.factorAMax ?? config.factorAMax}
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-xl text-ink-3">×</span>
          <input
            type="number"
            inputMode="numeric"
            aria-label={config.factorBLabel}
            value={bText}
            onChange={(e) => setBText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            min={activeConcept?.factorBMin ?? config.factorBMin}
            max={activeConcept?.factorBMax ?? config.factorBMax}
            disabled={bLocked}
            className="w-20 h-11 rounded-lg border border-line bg-card px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent disabled:bg-paper-2 disabled:text-ink-2 disabled:opacity-75"
          />
        </div>
        {error && <p className="text-accent text-[13px] mt-1.5">{error}</p>}
      </div>

      <div>
        <FieldLabel>Concept</FieldLabel>
        <select
          className="w-full h-11 px-3 rounded-lg border border-line bg-card text-[14px] font-semibold text-ink disabled:bg-paper-2 disabled:text-ink-2 disabled:opacity-75 disabled:cursor-not-allowed"
          value={conceptId}
          disabled={!config.conceptSelectable}
          onChange={(e) => setConceptId(e.target.value)}
        >
          {config.concepts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>Next Stage</FieldLabel>
        <ProgressionDropdown />
      </div>

      <div>
        <FieldLabel>Instruction Text</FieldLabel>
        <button
          type="button"
          role="switch"
          aria-checked={hideText}
          onClick={toggleHideText}
          className="w-full h-11 flex items-center justify-between px-3 rounded-lg border border-line bg-card text-[14px] font-semibold text-ink"
        >
          <span>{hideText ? "Hidden" : "Shown"}</span>
          <span
            className={cn(
              "relative block w-[44px] h-[26px] rounded-full border-[1.5px] transition-colors duration-200",
              hideText ? "bg-accent/15 border-accent" : "bg-paper-2 border-line-2",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-[19px] h-[19px] rounded-full border transition-all duration-200",
                hideText
                  ? "translate-x-[18px] bg-accent border-accent"
                  : "translate-x-0 bg-card border-line-2",
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
          </span>
        </button>
      </div>

      <Button variant="primary" fullWidth onClick={submit}>
        Go
      </Button>
    </div>
  );
}
