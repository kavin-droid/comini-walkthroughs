"use client";

import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { usePlaceValue } from "./PlaceValueContext";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { ModeToggle } from "./ModeToggle";
import { HideTextToggle } from "./HideTextToggle";
import { SettingsSheet } from "./SettingsSheet";
import { HeaderPills } from "./HeaderPills";

export function Header() {
  const { config } = usePlaceValue();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-line shrink-0">
      <IconButton aria-label="Back" onClick={() => window.history.back()} size={36}>
        <ChevronLeft size={18} />
      </IconButton>
      <div className="flex-1 min-w-0">
        <div className="font-serif font-semibold text-[17px] min-[900px]:text-[20px] leading-tight truncate">
          {config.title}
        </div>
        <div className="font-mono text-[12px] text-ink-3">{config.ageBand}</div>
      </div>
      <HeaderPills />
      <ModeToggle />
      {isDesktop && <HideTextToggle variant="icon" />}
      <SettingsSheet />
    </header>
  );
}
