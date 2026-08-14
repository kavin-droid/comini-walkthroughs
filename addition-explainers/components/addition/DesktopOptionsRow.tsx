"use client";

import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { QuestionRow } from "./QuestionRow";

export function DesktopOptionsRow() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;

  return <QuestionRow />;
}
