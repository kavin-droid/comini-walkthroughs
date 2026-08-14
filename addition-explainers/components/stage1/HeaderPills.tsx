"use client";

import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StageDropdownContent } from "@/components/ds/StageDropdownContent";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useStage1 } from "./Stage1Context";

/** Desktop-only Concept + Progression pills - mirrors the addition app's HeaderPills exactly
 * (components/addition/HeaderPills.tsx) so the header reads the same way across all three
 * stages, not just stage2/3. On mobile these two fields live in the settings sheet instead (see
 * OptionsPanel), not duplicated here. */
export function HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { config } = useStage1();
  if (!isDesktop) return null;

  return (
    <>
      <div
        className="h-8 px-3 rounded-full border border-line bg-card text-[12px] font-mono text-ink-2 flex items-center max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
        title={config.conceptLabel}
      >
        {config.conceptLabel}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 px-2.5 rounded-full border border-line bg-card text-[12px] font-mono text-ink flex items-center gap-1 max-w-[120px] shrink-0">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {config.ageBand}
            </span>
            <ChevronDown size={12} className="text-ink-3 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <StageDropdownContent currentId={config.id} align="end" />
      </DropdownMenu>
    </>
  );
}
