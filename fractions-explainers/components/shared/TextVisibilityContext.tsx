"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface TextVisibilityValue {
  hideText: boolean;
  toggleHideText: () => void;
}

const TextVisibilityContext = createContext<TextVisibilityValue | null>(null);

/** One flag + toggle, shared by stage 1 and stage 2: a control (bottom sheet on mobile, header
 * icon on desktop) that hides the walkthrough's own instruction text - stage 1's WordLabel
 * callouts, stage 2's NarrationBox prose. Never affects functional controls (stage 1's Whole/Half
 * MCQ buttons, stage 2's AnswerCard) since those aren't narration, they're the interaction itself.
 * Lives above the step/phase remount boundary in both apps so toggling it doesn't reset progress. */
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
