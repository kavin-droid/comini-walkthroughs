"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { StageDropdown } from "@/components/shared/StageDropdown";
import { Stage1ConceptDropdown } from "./Stage1ConceptDropdown";

/** Desktop-only Concept + Progression pills, mirroring subtraction/HeaderPills.tsx's slot in the
 * header (round-20: header consistency) - unlike stage2/3 (whose Concept is fixed per page, shown
 * as a static label), stage1's concept is itself switchable, so this uses the interactive
 * Stage1ConceptDropdown here instead of a plain label. On mobile both move into the settings sheet
 * instead (see Stage1OptionsPanel). */
export function Stage1HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;

  return (
    <>
      <Stage1ConceptDropdown />
      <StageDropdown currentId="stage1" />
    </>
  );
}
