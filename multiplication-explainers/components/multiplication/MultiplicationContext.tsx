"use client";

import { createContext, useContext, type Dispatch } from "react";
import { getActiveConcept, getSteps, type Session, type SessionAction } from "@/lib/multiplication/session";
import type { ConceptConfig, MultiplicationConfig, MultiplicationStep } from "@/lib/multiplication/types";

export interface MultiplicationContextValue {
  config: MultiplicationConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  steps: MultiplicationStep[];
  step: MultiplicationStep;
  activeConcept: ConceptConfig;
}

const MultiplicationContext = createContext<MultiplicationContextValue | null>(null);

export function useMultiplication(): MultiplicationContextValue {
  const ctx = useContext(MultiplicationContext);
  if (!ctx) {
    throw new Error("useMultiplication must be called within a <MultiplicationWalkthrough>");
  }
  return ctx;
}

export function buildMultiplicationContextValue(
  config: MultiplicationConfig,
  session: Session,
  dispatch: Dispatch<SessionAction>,
): MultiplicationContextValue {
  const activeConcept = getActiveConcept(config, session);
  const steps = getSteps(config, session);
  const step = steps[session.stepIdx];
  return { config, session, dispatch, steps, step, activeConcept };
}

export const MultiplicationContextProvider = MultiplicationContext.Provider;
