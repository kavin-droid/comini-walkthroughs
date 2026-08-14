"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface InstructionsVisibilityValue {
  hideInstructions: boolean;
  toggleHideInstructions: () => void;
}

const InstructionsVisibilityContext = createContext<InstructionsVisibilityValue | null>(null);

/** Header-level preference to hide the narration box's text. NarrationBox itself still shows the
 * text (with a read-aloud speaker button) whenever the current phase is an interactive question -
 * the child needs to actually see/hear the question to answer it, so "hide instructions" only
 * suppresses the passive walkthrough narration, never a posed question. */
export function InstructionsVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideInstructions, setHideInstructions] = useState(false);
  return (
    <InstructionsVisibilityContext.Provider
      value={{ hideInstructions, toggleHideInstructions: () => setHideInstructions((v) => !v) }}
    >
      {children}
    </InstructionsVisibilityContext.Provider>
  );
}

export function useInstructionsVisibility(): InstructionsVisibilityValue {
  const ctx = useContext(InstructionsVisibilityContext);
  if (!ctx) {
    throw new Error("useInstructionsVisibility must be used within an <InstructionsVisibilityProvider>");
  }
  return ctx;
}
