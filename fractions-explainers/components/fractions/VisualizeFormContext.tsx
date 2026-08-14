"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useFractions } from "./FractionContext";

interface VisualizeFormValue {
  conceptId: string;
  setConceptId: (v: string) => void;
  fraction: string;
  setFraction: (v: string) => void;
  piece1: string;
  setPiece1: (v: string) => void;
  piece2: string;
  setPiece2: (v: string) => void;
  handleVisualize: () => boolean;
}

const VisualizeFormContext = createContext<VisualizeFormValue | null>(null);

/** Single shared instance of the draft question/concept form, mounted once at the walkthrough
 * root - desktop splits it across QuestionRow (Question) and HeaderPills (Concept + Progression),
 * mobile renders it all in one sheet (OptionsPanel), matching the vanilla app's single
 * relayoutOptionsPanel DOM-reparenting trick via one shared hook instance instead of two.
 *
 * Every field is a closed-set <select>, so - unlike multiplication's numeric text inputs - there
 * is no invalid combination to validate against: `handleVisualize` always succeeds, matching the
 * vanilla app's `#options-error` element, which is present in the markup but never actually
 * populated by any code path. Switching concepts does not reset fraction/piece1/piece2: the
 * vanilla markup keeps the single-fraction select and the two combine selects as three
 * independent, always-mounted DOM elements that just get shown/hidden, so each one's value
 * persists across concept switches on its own. */
export function VisualizeFormProvider({ children }: { children: ReactNode }) {
  const { config, session, dispatch } = useFractions();
  const [conceptId, setConceptId] = useState(session.conceptId);
  const [fraction, setFraction] = useState(session.fraction);
  const [piece1, setPiece1] = useState(session.piece1);
  const [piece2, setPiece2] = useState(session.piece2);

  function handleVisualize(): boolean {
    const concept = config.concepts.find((c) => c.id === conceptId) ?? config.concepts[0];
    dispatch({ type: "RESTART", conceptId: concept.id, fraction, piece1, piece2 });
    return true;
  }

  return (
    <VisualizeFormContext.Provider
      value={{
        conceptId,
        setConceptId,
        fraction,
        setFraction,
        piece1,
        setPiece1,
        piece2,
        setPiece2,
        handleVisualize,
      }}
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
