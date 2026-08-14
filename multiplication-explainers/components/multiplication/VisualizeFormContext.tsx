"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useMultiplication } from "./MultiplicationContext";

interface VisualizeFormValue {
  aText: string;
  setAText: (v: string) => void;
  bText: string;
  setBText: (v: string) => void;
  conceptId: string;
  setConceptId: (v: string) => void;
  error: string | null;
  /** Returns true on success (mirrors vanilla's start(): validate, and only proceed - i.e. close
   * the mobile sheet - once validation actually passed). */
  handleVisualize: () => boolean;
}

const VisualizeFormContext = createContext<VisualizeFormValue | null>(null);

/** Single shared instance of the draft question/concept form, mounted once at the walkthrough
 * root - not per-viewport like addition's OptionsPanel/QuestionRow. Multiplication's desktop
 * layout splits one logical form across two DOM locations (Concept+Progression in the header via
 * HeaderPills, Question+Visualize in the options row via QuestionRow), matching the vanilla
 * app's relayoutOptionsPanel DOM move - since both locations must agree on one underlying value,
 * they need one shared hook instance (via context) rather than addition's two independent,
 * viewport-exclusive instances. */
export function VisualizeFormProvider({ children }: { children: ReactNode }) {
  const { config, session, dispatch } = useMultiplication();
  const [aText, setAText] = useState(String(session.a));
  const [bText, setBText] = useState(String(session.b));
  const [conceptId, setConceptIdState] = useState(session.conceptId);
  const [error, setError] = useState<string | null>(null);

  function setConceptId(next: string) {
    setConceptIdState(next);
    const prevConcept = config.concepts.find((c) => c.id === conceptId);
    const concept = config.concepts.find((c) => c.id === next);
    // A concept with its own factor range (e.g. "Regroup and Multiply", 2-digit x 1-digit) needs
    // its own defaults too - whatever's currently typed almost certainly falls outside a
    // different concept's range. Swap when the current value still matches where it came from
    // (either the previous concept's own default, or the stage's, if it had none) - an
    // intentional edit the child just typed is otherwise left alone, UNLESS it's actually out of
    // the new concept's range (e.g. typed "21" for Regroup and Multiply, then switched to a
    // single-digit-only concept) - a stale value the child would only discover via a validation
    // error on Go is worse than resetting to a value that's at least valid.
    const prevDefaultA = prevConcept?.defaultFactorA ?? config.defaultFactorA;
    const prevDefaultB = prevConcept?.defaultFactorB ?? config.defaultFactorB;
    const newAMin = concept?.factorAMin ?? config.factorAMin;
    const newAMax = concept?.factorAMax ?? config.factorAMax;
    const newBMin = concept?.factorBMin ?? config.factorBMin;
    const newBMax = concept?.factorBMax ?? config.factorBMax;
    const aNum = parseInt(aText, 10);
    const bNum = parseInt(bText, 10);
    const aOutOfRange = Number.isNaN(aNum) || aNum < newAMin || aNum > newAMax;
    const bOutOfRange = Number.isNaN(bNum) || bNum < newBMin || bNum > newBMax;
    if (aText === String(prevDefaultA) || aOutOfRange) {
      setAText(String(concept?.defaultFactorA ?? config.defaultFactorA));
    }
    if (concept?.lockFactorB) {
      setBText("10");
    } else if (bText === "10" || bText === String(prevDefaultB) || bOutOfRange) {
      setBText(String(concept?.defaultFactorB ?? config.defaultFactorB));
    }
  }

  function handleVisualize(): boolean {
    const a = parseInt(aText, 10);
    const b = parseInt(bText, 10);
    const concept = config.concepts.find((c) => c.id === conceptId) ?? config.concepts[0];
    const validationError = config.validate(a, b, concept);
    if (validationError) {
      setError(validationError);
      return false;
    }
    setError(null);
    dispatch({ type: "RESTART", a, b, conceptId: concept.id });
    return true;
  }

  return (
    <VisualizeFormContext.Provider
      value={{ aText, setAText, bText, setBText, conceptId, setConceptId, error, handleVisualize }}
    >
      {children}
    </VisualizeFormContext.Provider>
  );
}

export function useVisualizeForm(): VisualizeFormValue {
  const ctx = useContext(VisualizeFormContext);
  if (!ctx) throw new Error("useVisualizeForm must be used within a <VisualizeFormProvider>");
  return ctx;
}
