"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface NarrationVisibilityValue {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const NarrationVisibilityContext = createContext<NarrationVisibilityValue | null>(null);

/** Global on/off for the main instruction paragraph (NarrationBox), toggled from the header
 * (desktop) or settings sheet (mobile) - see InstructionsToggle. Defaults to visible, matching
 * the walkthrough's always-on-narration behavior before this toggle existed. Deliberately does
 * NOT gate the MCQ's own instruction text (see McqInstructionBanner, rendered unconditionally by
 * NarrationBox for the "closer" step) - answering the question requires reading it, so it can't
 * be turned off. */
export function NarrationVisibilityProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  return (
    <NarrationVisibilityContext.Provider value={{ visible, setVisible }}>
      {children}
    </NarrationVisibilityContext.Provider>
  );
}

export function useNarrationVisibility(): NarrationVisibilityValue {
  const ctx = useContext(NarrationVisibilityContext);
  if (!ctx) {
    throw new Error("useNarrationVisibility must be used within a <NarrationVisibilityProvider>");
  }
  return ctx;
}
