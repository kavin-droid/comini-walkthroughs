"use client";

import type { ReactNode } from "react";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";

export function DesktopRow({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;
  return <>{children}</>;
}
