"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { StageDropdown } from "@/components/shared/StageDropdown";
import { useSubtraction } from "./SubtractionContext";

/** Desktop-only Concept + Progression pills, shown in the header ahead of the mode toggle. On
 * mobile these two fields live in the settings sheet instead (see OptionsPanel). */
export function HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { config } = useSubtraction();
  if (!isDesktop) return null;

  return (
    <>
      <div
        className="h-8 px-3 rounded-full border border-line bg-card text-[12px] font-mono text-ink-2 flex items-center max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
        title={config.conceptLabel}
      >
        {config.conceptLabel}
      </div>
      <StageDropdown currentId={config.id} />
    </>
  );
}
