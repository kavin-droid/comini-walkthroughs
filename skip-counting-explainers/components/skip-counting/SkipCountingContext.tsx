"use client";

import { createContext, useContext, type Dispatch } from "react";
import { buildPhases } from "@/lib/skip-counting/phases";
import type { SessionAction } from "@/lib/skip-counting/session";
import type { PhaseObj, Session, SkipCountingConfig } from "@/lib/skip-counting/types";

export interface SkipCountingContextValue {
  config: SkipCountingConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  phases: PhaseObj[];
  phaseObj: PhaseObj;
}

const SkipCountingContext = createContext<SkipCountingContextValue | null>(null);

export function useSkipCounting(): SkipCountingContextValue {
  const ctx = useContext(SkipCountingContext);
  if (!ctx) {
    throw new Error("useSkipCounting must be called within a <SkipCountingWalkthrough>");
  }
  return ctx;
}

export function buildSkipCountingContextValue(
  config: SkipCountingConfig,
  session: Session,
  dispatch: Dispatch<SessionAction>,
): SkipCountingContextValue {
  const phases = buildPhases(session.jumps);
  const phaseObj = phases[session.phaseIdx];
  return { config, session, dispatch, phases, phaseObj };
}

export const SkipCountingContextProvider = SkipCountingContext.Provider;
