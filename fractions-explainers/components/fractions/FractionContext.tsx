"use client";

import { createContext, useContext, type Dispatch } from "react";
import { getActiveConcept, getSteps, type Session, type SessionAction } from "@/lib/fractions/session";
import type { ConceptConfig, FractionConfig, FractionStep } from "@/lib/fractions/types";

export interface FractionContextValue {
  config: FractionConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  steps: FractionStep[];
  step: FractionStep;
  activeConcept: ConceptConfig;
}

const FractionContext = createContext<FractionContextValue | null>(null);

export function useFractions(): FractionContextValue {
  const ctx = useContext(FractionContext);
  if (!ctx) {
    throw new Error("useFractions must be called within a <FractionWalkthrough>");
  }
  return ctx;
}

export function buildFractionContextValue(
  config: FractionConfig,
  session: Session,
  dispatch: Dispatch<SessionAction>,
): FractionContextValue {
  const activeConcept = getActiveConcept(config, session);
  const steps = getSteps(config, session);
  const step = steps[session.stepIdx];
  return { config, session, dispatch, steps, step, activeConcept };
}

export const FractionContextProvider = FractionContext.Provider;
