"use client";

import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { STAGE2_META, type Stage2Concept } from "@/lib/division/stage2";
import { ModeToggle } from "@/components/division/shared/ModeToggle";
import { SettingsSheet } from "@/components/division/shared/SettingsSheet";
import { HideTextToggle } from "@/components/division/shared/HideTextToggle";
import { Stage2HeaderPills } from "./Stage2HeaderPills";
import { Stage2OptionsPanel } from "./Stage2OptionsPanel";
import type { Stage2Committed } from "@/hooks/useStage2Form";

export function Stage2Header({
  committed,
  concept,
  onConceptChange,
  onVisualize,
  mode,
  onToggleMode,
  hideText,
  onToggleHideText,
}: {
  committed: Stage2Committed;
  concept: Stage2Concept;
  onConceptChange: (v: Stage2Concept) => void;
  onVisualize: (next: Stage2Committed) => void;
  mode: "manual" | "auto";
  onToggleMode: () => void;
  hideText: boolean;
  onToggleHideText: () => void;
}) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-line shrink-0">
      <IconButton aria-label="Back" onClick={() => window.history.back()} size={36}>
        <ChevronLeft size={18} />
      </IconButton>
      <div className="flex-1 min-w-0">
        <div className="font-serif font-semibold text-[17px] min-[900px]:text-[20px] leading-tight truncate">
          {STAGE2_META.title}
        </div>
        <div className="font-mono text-[12px] text-ink-3">{STAGE2_META.ageBand}</div>
      </div>
      <Stage2HeaderPills concept={concept} onConceptChange={onConceptChange} />
      <ModeToggle mode={mode} onToggle={onToggleMode} />
      <HideTextToggle hidden={hideText} onToggle={onToggleHideText} />
      <SettingsSheet hideText={hideText} onToggleHideText={onToggleHideText}>
        {(close) => (
          <Stage2OptionsPanel
            committed={committed}
            concept={concept}
            onConceptChange={onConceptChange}
            onVisualize={onVisualize}
            onVisualized={close}
          />
        )}
      </SettingsSheet>
    </header>
  );
}
