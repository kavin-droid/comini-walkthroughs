"use client";

import { Eye, EyeOff } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useTextVisibility } from "./TextVisibilityContext";

/** Desktop-only entry point for the "hide instruction text" toggle, top-right in the header
 * (mobile gets the same toggle as a labeled row in the settings sheet instead - see
 * OptionsPanel). Self-contained breakpoint gating, matching HeaderPills/SettingsSheet. */
export function HideTextButton() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { hideText, toggleHideText } = useTextVisibility();
  if (!isDesktop) return null;

  return (
    <IconButton
      aria-label={hideText ? "Show instruction text" : "Hide instruction text"}
      aria-pressed={hideText}
      size={36}
      variant={hideText ? "primary" : "default"}
      onClick={toggleHideText}
    >
      {hideText ? <EyeOff size={18} /> : <Eye size={18} />}
    </IconButton>
  );
}
