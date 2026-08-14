"use client";

import { useState, type ReactNode } from "react";
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
import { HideTextRow } from "./HideTextToggle";

/** Mobile-only settings entry point. On desktop the equivalent fields render inline instead (see
 * each stage's DesktopOptionsRow/header pills) - deliberately two separate mount points rather
 * than one node moved between DOM homes (the vanilla apps' relayoutOptionsPanel trick). The
 * hide-text toggle rides along here too - its desktop counterpart is HideTextToggle, a standalone
 * header icon button (no bottom sheet on desktop to put it in). */
export function SettingsSheet({
  hideText,
  onToggleHideText,
  children,
}: {
  hideText: boolean;
  onToggleHideText: () => void;
  children: (close: () => void) => ReactNode;
}) {
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
          <HideTextRow hidden={hideText} onToggle={onToggleHideText} />
          <div className="h-px bg-line my-1" />
          {children(() => setOpen(false))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
