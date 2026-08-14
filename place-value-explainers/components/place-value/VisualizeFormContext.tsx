"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePlaceValue } from "./PlaceValueContext";

interface VisualizeFormValue {
  numberText: string;
  setNumberText: (v: string) => void;
  error: string | null;
  /** Returns true on success (mirrors vanilla's start(): validate, and only proceed - i.e. close
   * the mobile sheet - once validation actually passed). */
  handleVisualize: () => boolean;
}

const VisualizeFormContext = createContext<VisualizeFormValue | null>(null);

/** Single shared instance of the draft question form, mounted once at the walkthrough root -
 * mirrors multiplication's VisualizeFormProvider, but place value only has one field (a single
 * number) instead of two factors, and the concept select is always a fixed, disabled label
 * (`conceptSelectable` is false for both stages) rather than something this form needs to track. */
export function VisualizeFormProvider({ children }: { children: ReactNode }) {
  const { config, session, dispatch } = usePlaceValue();
  const [numberText, setNumberText] = useState(String(session.n));
  const [error, setError] = useState<string | null>(null);

  function handleVisualize(): boolean {
    const n = parseInt(numberText, 10);
    const validationError = config.validate(n);
    if (validationError) {
      setError(validationError);
      return false;
    }
    setError(null);
    dispatch({ type: "RESTART", n, conceptId: config.concepts[0].id });
    return true;
  }

  return (
    <VisualizeFormContext.Provider value={{ numberText, setNumberText, error, handleVisualize }}>
      {children}
    </VisualizeFormContext.Provider>
  );
}

export function useVisualizeForm(): VisualizeFormValue {
  const ctx = useContext(VisualizeFormContext);
  if (!ctx) throw new Error("useVisualizeForm must be used within a <VisualizeFormProvider>");
  return ctx;
}
