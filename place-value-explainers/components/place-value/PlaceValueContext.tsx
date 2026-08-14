"use client";

import { createContext, useContext, type Dispatch } from "react";
import { getActiveConcept, getSteps, type Session, type SessionAction } from "@/lib/place-value/session";
import type { ConceptConfig, PlaceValueConfig, PlaceValueStep } from "@/lib/place-value/types";

export interface PlaceValueContextValue {
  config: PlaceValueConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  steps: PlaceValueStep[];
  step: PlaceValueStep;
  activeConcept: ConceptConfig;
}

const PlaceValueContext = createContext<PlaceValueContextValue | null>(null);

export function usePlaceValue(): PlaceValueContextValue {
  const ctx = useContext(PlaceValueContext);
  if (!ctx) {
    throw new Error("usePlaceValue must be called within a <PlaceValueWalkthrough>");
  }
  return ctx;
}

export function buildPlaceValueContextValue(
  config: PlaceValueConfig,
  session: Session,
  dispatch: Dispatch<SessionAction>,
): PlaceValueContextValue {
  const activeConcept = getActiveConcept(config, session);
  const steps = getSteps(config, session);
  const step = steps[session.stepIdx];
  return { config, session, dispatch, steps, step, activeConcept };
}

export const PlaceValueContextProvider = PlaceValueContext.Provider;
