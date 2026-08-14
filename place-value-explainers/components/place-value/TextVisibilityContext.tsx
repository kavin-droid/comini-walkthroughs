"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface TextVisibilityValue {
  hideText: boolean;
  toggleHideText: () => void;
}

const TextVisibilityContext = createContext<TextVisibilityValue | null>(null);

/** Lets a grown-up preview the walkthrough the way a pre-reading child would: toggling this
 * hides the narration/instruction prose entirely, leaving only the visuals and the interactive
 * controls. Deliberately a single top-level toggle (not per-stage, not reset on RESTART) so it
 * behaves like a standing preference for the whole session. */
export function TextVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideText, setHideText] = useState(false);

  return (
    <TextVisibilityContext.Provider
      value={{ hideText, toggleHideText: () => setHideText((h) => !h) }}
    >
      {children}
    </TextVisibilityContext.Provider>
  );
}

export function useTextVisibility(): TextVisibilityValue {
  const ctx = useContext(TextVisibilityContext);
  if (!ctx) throw new Error("useTextVisibility must be used within a <TextVisibilityProvider>");
  return ctx;
}
