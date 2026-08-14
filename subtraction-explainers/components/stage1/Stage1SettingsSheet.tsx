"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconButton } from "@/components/ds/IconButton";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { Stage1OptionsPanel } from "./Stage1OptionsPanel";

/** Mirrors subtraction/SettingsSheet.tsx exactly (round-20: header consistency) - mobile-only gear
 * icon opening a bottom sheet with every field that used to be crammed inline into the header
 * (Question, Concept, Progression, Accessibility), instead of the header itself trying to fit
 * four separate controls next to the title on a narrow viewport. */
export function Stage1SettingsSheet() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [open, setOpen] = useState(false);
  if (isDesktop) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <IconButton aria-label="Settings" size={36}>
          <Settings size={18} />
        </IconButton>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-paper border-line rounded-t-2xl max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="font-serif">Options</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <Stage1OptionsPanel onVisualized={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
