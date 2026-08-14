"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { NarrationFragment } from "@/lib/rounding/narration";
import { useRounding } from "./RoundingContext";

interface NarrationOverrideValue {
  override: NarrationFragment[] | null;
  setOverride: (fragments: NarrationFragment[] | null) => void;
}

const NarrationOverrideContext = createContext<NarrationOverrideValue | null>(null);

/** The vanilla LineView's placeTap correct-answer handler directly overwrites
 * `#narration`'s innerHTML for the ~1.2s before auto-advancing ("Great. X is between L and U."),
 * temporarily replacing the step's own `explanation` text. This context is the React-idiomatic
 * home for that transient override - ephemeral, reset whenever the active step changes (see the
 * effect below), not part of session state. */
export function NarrationOverrideProvider({ children }: { children: ReactNode }) {
  const { session } = useRounding();
  const [override, setOverride] = useState<NarrationFragment[] | null>(null);

  useEffect(() => {
    setOverride(null);
  }, [session.stepIdx]);

  return (
    <NarrationOverrideContext.Provider value={{ override, setOverride }}>
      {children}
    </NarrationOverrideContext.Provider>
  );
}

export function useNarrationOverride(): NarrationOverrideValue {
  const ctx = useContext(NarrationOverrideContext);
  if (!ctx) {
    throw new Error("useNarrationOverride must be used within a <NarrationOverrideProvider>");
  }
  return ctx;
}
