"use client";

import { createContext, useContext, type Dispatch } from "react";
import { buildPhases, parsePhase } from "@/lib/subtraction/phases";
import type { SessionAction } from "@/lib/subtraction/session";
import type { PhaseObj, Session, SubtractionConfig } from "@/lib/subtraction/types";

export interface SubtractionContextValue {
  config: SubtractionConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  phases: string[];
  phaseObj: PhaseObj;
}

const SubtractionContext = createContext<SubtractionContextValue | null>(null);

export function useSubtraction(): SubtractionContextValue {
  const ctx = useContext(SubtractionContext);
  if (!ctx) {
    throw new Error("useSubtraction must be called within a <SubtractionWalkthrough>");
  }
  return ctx;
}

export function buildSubtractionContextValue(
  config: SubtractionConfig,
  session: Session,
  dispatch: Dispatch<SessionAction>,
): SubtractionContextValue {
  const phases = buildPhases(config, session.regroupPlan);
  const phaseObj = parsePhase(phases[session.phaseIdx]);
  return { config, session, dispatch, phases, phaseObj };
}

export const SubtractionContextProvider = SubtractionContext.Provider;
