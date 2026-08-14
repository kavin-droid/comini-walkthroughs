"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface TextVisibilityValue {
  hideText: boolean;
  toggleHideText: () => void;
}

const TextVisibilityContext = createContext<TextVisibilityValue | null>(null);

/** Global "hide instruction text" toggle - lets an adult preview the walkthrough the way a
 * non-reading child would experience it, relying only on the visuals (highlights, animations,
 * dots) with the narration/question prompt text and feedback line hidden (see NarrationBox). A
 * plain top-level toggle rather than part of MultiplicationContext's step data, since it's a
 * display preference that persists across steps and concepts, not walkthrough content. */
export function TextVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideText, setHideText] = useState(false);
  return (
    <TextVisibilityContext.Provider value={{ hideText, toggleHideText: () => setHideText((v) => !v) }}>
      {children}
    </TextVisibilityContext.Provider>
  );
}

export function useTextVisibility(): TextVisibilityValue {
  const ctx = useContext(TextVisibilityContext);
  if (!ctx) throw new Error("useTextVisibility must be used within a <TextVisibilityProvider>");
  return ctx;
}
