"use client";

import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { STAGE1_META } from "@/lib/division/stage1";
import { ModeToggle } from "@/components/division/shared/ModeToggle";
import { SettingsSheet } from "@/components/division/shared/SettingsSheet";
import { HideTextToggle } from "@/components/division/shared/HideTextToggle";
import { Stage1HeaderPills } from "./Stage1HeaderPills";
import { Stage1OptionsPanel } from "./Stage1OptionsPanel";
import type { Stage1Committed } from "@/hooks/useStage1Form";

export function Stage1Header({
  committed,
  onVisualize,
  mode,
  onToggleMode,
  hideText,
  onToggleHideText,
}: {
  committed: Stage1Committed;
  onVisualize: (next: Stage1Committed) => void;
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
          {STAGE1_META.title}
        </div>
        <div className="font-mono text-[12px] text-ink-3">{STAGE1_META.ageBand}</div>
      </div>
      <Stage1HeaderPills />
      <ModeToggle mode={mode} onToggle={onToggleMode} />
      <HideTextToggle hidden={hideText} onToggle={onToggleHideText} />
      <SettingsSheet hideText={hideText} onToggleHideText={onToggleHideText}>
        {(close) => <Stage1OptionsPanel committed={committed} onVisualize={onVisualize} onVisualized={close} />}
      </SettingsSheet>
    </header>
  );
}
