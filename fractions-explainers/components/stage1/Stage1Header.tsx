"use client";

import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useTextVisibility } from "@/components/shared/TextVisibilityContext";
import { Stage1SettingsSheet } from "./Stage1SettingsSheet";

/** Mirrors components/fractions/Header.tsx's shape exactly (Back chevron, title+age-band block,
 * a desktop-only hide-text icon, a mobile settings sheet) so stage 1 reads as the same app as
 * stage 2/3, not a bespoke one-off - stage 1 just has no concept picker or autoplay toggle to
 * put in the middle, since it's a single fixed linear walkthrough. */
export function Stage1Header() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { hideText, toggleHideText } = useTextVisibility();

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-line shrink-0">
      <IconButton aria-label="Back" onClick={() => window.history.back()} size={36}>
        <ChevronLeft size={18} />
      </IconButton>
      <div className="flex-1 min-w-0">
        <div className="font-sans font-bold text-[17px] min-[900px]:text-[20px] leading-tight truncate">
          Fractions
        </div>
        <div className="font-mono text-[12px] text-ink-3">Ages 5–6</div>
      </div>
      {isDesktop && (
        <IconButton
          aria-label={hideText ? "Show instruction text" : "Hide instruction text"}
          onClick={toggleHideText}
          size={36}
        >
          {hideText ? <EyeOff size={15} /> : <Eye size={15} />}
        </IconButton>
      )}
      <Stage1SettingsSheet />
    </header>
  );
}
