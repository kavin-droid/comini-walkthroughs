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
import { OptionsPanel } from "./OptionsPanel";

/** Mobile-only settings entry point. On desktop the same shared form renders inline instead,
 * split between QuestionRow and HeaderPills (see DesktopOptionsRow / HeaderPills) - plain
 * conditional rendering off one shared VisualizeFormContext instance, replacing the vanilla
 * apps' relayoutOptionsPanel DOM-reparenting trick. */
export function SettingsSheet() {
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
          <OptionsPanel onVisualized={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
