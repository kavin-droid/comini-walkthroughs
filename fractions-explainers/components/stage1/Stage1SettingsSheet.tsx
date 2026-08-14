"use client";

import { Settings, Eye, EyeOff } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconButton } from "@/components/ds/IconButton";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useTextVisibility } from "@/components/shared/TextVisibilityContext";

/** Mobile-only: a settings sheet holding just the hide-text toggle - there is nothing else to
 * configure in stage 1 (no concept/fraction picker), so this is a much smaller version of
 * stage2's SettingsSheet, but self-guards on desktop the same way (`isDesktop` returns null
 * rather than the caller conditionally rendering it) so Stage1Header can render it unconditionally
 * just like Header.tsx does with SettingsSheet. On desktop the same toggle lives directly in
 * Stage1Header instead. */
export function Stage1SettingsSheet() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { hideText, toggleHideText } = useTextVisibility();
  if (isDesktop) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <IconButton aria-label="Settings" size={36}>
          <Settings size={18} />
        </IconButton>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-paper border-line rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-serif">Options</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <button
            type="button"
            onClick={toggleHideText}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-line-2 bg-card"
          >
            <span className="font-sans font-semibold text-[15px] text-ink">Instruction text</span>
            <span className="flex items-center gap-2 font-mono text-[13px] text-ink-2">
              {hideText ? <EyeOff size={18} /> : <Eye size={18} />}
              {hideText ? "Hidden" : "Shown"}
            </span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
