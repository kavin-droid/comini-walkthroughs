"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { ProgressionDropdown } from "@/components/division/shared/ProgressionDropdown";

/** Desktop-only Progression pill in the header, ahead of the mode toggle - no concept select here
 * (unlike stage2), since stage1 is a single fixed concept. */
export function Stage1HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;

  return <ProgressionDropdown compact />;
}
