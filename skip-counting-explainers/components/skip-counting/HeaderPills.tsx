"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useSkipCounting } from "./SkipCountingContext";

/** Desktop-only Concept + Age-band pills, shown in the header ahead of the mode toggle - matches
 * the vanilla app-shell spec (on mobile these two fields live in the settings sheet instead, see
 * OptionsPanel). The vanilla version renders the age-band pill as a dropdown that opens to reveal
 * a single, non-clickable "is-current" entry (there's nowhere else to navigate to - this is the
 * only skip-counting stage) - ported here as a plain static pill instead of dead dropdown chrome. */
export function HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { config } = useSkipCounting();
  if (!isDesktop) return null;

  return (
    <>
      <div
        className="h-8 px-3 rounded-full border border-line bg-card text-[12px] font-mono text-ink-2 flex items-center max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
        title={config.conceptLabel}
      >
        {config.conceptLabel}
      </div>
      <div className="h-8 px-2.5 rounded-full border border-line bg-card text-[12px] font-mono text-ink flex items-center max-w-[120px] shrink-0">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{config.ageBand}</span>
      </div>
    </>
  );
}
