"use client";

import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { TITLE, AGE_BAND } from "@/lib/stage1/config";
import { Stage1ModeToggle } from "./Stage1ModeToggle";
import { Stage1HeaderPills } from "./Stage1HeaderPills";
import { Stage1HideTextIconButton } from "./Stage1HideTextToggle";
import { Stage1SettingsSheet } from "./Stage1SettingsSheet";

/** Mirrors subtraction/Header.tsx's structure exactly (round-20: "the header is not responsive...
 * make it consistent with stage2") - on mobile this used to cram FOUR separate controls
 * (StageDropdown, Stage1ConceptDropdown, Stage1ModeToggle, a bare hideText icon button) directly
 * next to the title with no breakpoint-gating at all, which overflowed/wrapped badly on a narrow
 * viewport. Now only ModeToggle stays inline on every breakpoint (it always did, even on
 * stage2/3); everything else (Stage1HeaderPills, Stage1HideTextIconButton) is desktop-only, with
 * a single mobile-only Stage1SettingsSheet gear icon taking their place. */
export function Stage1Header() {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-line shrink-0">
      <IconButton aria-label="Back" onClick={() => window.history.back()} size={36}>
        <ChevronLeft size={18} />
      </IconButton>
      <div className="flex-1 min-w-0">
        <div className="font-serif font-semibold text-[17px] min-[900px]:text-[20px] leading-tight truncate">
          {TITLE}
        </div>
        <div className="font-mono text-[12px] text-ink-3">{AGE_BAND}</div>
      </div>
      <Stage1HeaderPills />
      <Stage1ModeToggle />
      <Stage1HideTextIconButton />
      <Stage1SettingsSheet />
    </header>
  );
}
