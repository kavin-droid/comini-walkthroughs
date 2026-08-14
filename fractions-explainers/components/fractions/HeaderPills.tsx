"use client";

import { Eye, EyeOff } from "lucide-react";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useTextVisibility } from "@/components/shared/TextVisibilityContext";
import { IconButton } from "@/components/ds/IconButton";
import { useFractions } from "./FractionContext";
import { useVisualizeForm } from "./VisualizeFormContext";

/** Desktop-only Concept pill, shown in the header ahead of the mode toggle - on mobile it lives
 * in the settings sheet instead (see OptionsPanel). Reads the shared VisualizeFormContext so its
 * value stays in sync with the same field rendered in the mobile sheet.
 *
 * No progression pill for now: stage 3 is temporarily unrouted (see app/page.tsx), so there is
 * nowhere to progress to - a static age-band label takes its place instead of a dead link. */
export function HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { config } = useFractions();
  const { conceptId, setConceptId } = useVisualizeForm();
  const { hideText, toggleHideText } = useTextVisibility();
  if (!isDesktop) return null;

  return (
    <>
      <select
        aria-label="Concept"
        className="h-8 px-3 rounded-full border border-line bg-card text-[12px] font-mono text-ink-2 max-w-[146px] shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75"
        value={conceptId}
        disabled={!config.conceptSelectable}
        onChange={(e) => setConceptId(e.target.value)}
      >
        {config.concepts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <span className="h-8 px-2.5 rounded-full border border-line bg-card text-[12px] font-mono text-ink flex items-center max-w-[120px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {config.ageBand}
      </span>

      <IconButton
        aria-label={hideText ? "Show instruction text" : "Hide instruction text"}
        onClick={toggleHideText}
        size={32}
      >
        {hideText ? <EyeOff size={15} /> : <Eye size={15} />}
      </IconButton>
    </>
  );
}
