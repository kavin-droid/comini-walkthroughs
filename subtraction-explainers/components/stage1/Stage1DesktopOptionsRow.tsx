"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { Stage1QuestionRow } from "./Stage1QuestionRow";

/** Mirrors subtraction/DesktopOptionsRow.tsx exactly - the Question card only renders inline on
 * desktop; mobile gets the equivalent field inside the settings sheet instead (Stage1OptionsPanel,
 * via Stage1SettingsSheet), same split as every other stage. */
export function Stage1DesktopOptionsRow() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;
  return <Stage1QuestionRow />;
}
