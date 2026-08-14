"use client";

import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { STAGE3_META } from "@/lib/division/stage3";
import { ModeToggle } from "@/components/division/shared/ModeToggle";
import { SettingsSheet } from "@/components/division/shared/SettingsSheet";
import { HideTextToggle } from "@/components/division/shared/HideTextToggle";
import { Stage3HeaderPills } from "./Stage3HeaderPills";
import { Stage3OptionsPanel } from "./Stage3OptionsPanel";
import type { Stage3Committed } from "@/hooks/useStage3Form";

export function Stage3Header({
  committed,
  onVisualize,
  mode,
  onToggleMode,
  hideText,
  onToggleHideText,
}: {
  committed: Stage3Committed;
  onVisualize: (next: Stage3Committed) => void;
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
          {STAGE3_META.title}
        </div>
        <div className="font-mono text-[12px] text-ink-3">{STAGE3_META.ageBand}</div>
      </div>
      <Stage3HeaderPills />
      <ModeToggle mode={mode} onToggle={onToggleMode} />
      <HideTextToggle hidden={hideText} onToggle={onToggleHideText} />
      <SettingsSheet hideText={hideText} onToggleHideText={onToggleHideText}>
        {(close) => <Stage3OptionsPanel committed={committed} onVisualize={onVisualize} onVisualized={close} />}
      </SettingsSheet>
    </header>
  );
}
