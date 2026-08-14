"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { ProgressionDropdown } from "@/components/division/shared/ProgressionDropdown";

/** Desktop-only Concept (static label - stage3's concept is fixed, not a runtime choice) +
 * Progression pills in the header, ahead of the mode toggle. On mobile both live in the settings
 * sheet instead (Stage3OptionsPanel). */
export function Stage3HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;

  return (
    <>
      <div
        className="h-8 px-3 rounded-full border border-line bg-card text-[12px] font-mono text-ink-2 flex items-center max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
        title="Tens & Ones Division"
      >
        Tens & Ones
      </div>
      <ProgressionDropdown compact />
    </>
  );
}
