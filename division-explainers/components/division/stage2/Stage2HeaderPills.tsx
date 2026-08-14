"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import type { Stage2Concept } from "@/lib/division/stage2";
import { ProgressionDropdown } from "@/components/division/shared/ProgressionDropdown";
import { Stage2ConceptSelect } from "./Stage2ConceptSelect";

/** Desktop-only Concept (interactive, unlike the addition port's static label - stage2's concept
 * is a real runtime choice) + Progression pills in the header, ahead of the mode toggle. On
 * mobile both live in the settings sheet instead (Stage2OptionsPanel). */
export function Stage2HeaderPills({
  concept,
  onConceptChange,
}: {
  concept: Stage2Concept;
  onConceptChange: (v: Stage2Concept) => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;

  return (
    <>
      <Stage2ConceptSelect value={concept} onChange={onConceptChange} compact />
      <ProgressionDropdown compact />
    </>
  );
}
