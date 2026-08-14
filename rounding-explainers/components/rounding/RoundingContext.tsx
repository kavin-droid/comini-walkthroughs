"use client";

import { createContext, useContext, type Dispatch } from "react";
import type { SessionAction } from "@/lib/rounding/session";
import type { RoundingConfig, RoundingStep, Session } from "@/lib/rounding/types";

export interface RoundingContextValue {
  config: RoundingConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  step: RoundingStep;
}

const RoundingContext = createContext<RoundingContextValue | null>(null);

export function useRounding(): RoundingContextValue {
  const ctx = useContext(RoundingContext);
  if (!ctx) {
    throw new Error("useRounding must be called within a <RoundingWalkthrough>");
  }
  return ctx;
}

export function buildRoundingContextValue(
  config: RoundingConfig,
  session: Session,
  dispatch: Dispatch<SessionAction>,
): RoundingContextValue {
  return { config, session, dispatch, step: session.steps[session.stepIdx] };
}

export const RoundingContextProvider = RoundingContext.Provider;
