"use client";

import { createContext, useContext, type Dispatch } from "react";
import { buildPhases, parsePhase } from "@/lib/stage1/phases";
import type { Stage1Action } from "@/lib/stage1/session";
import type { Stage1Config, Stage1PhaseObj, Stage1Session, Stage1PhaseType } from "@/lib/stage1/types";

export interface Stage1ContextValue {
  config: Stage1Config;
  session: Stage1Session;
  dispatch: Dispatch<Stage1Action>;
  phases: Stage1PhaseType[];
  phaseObj: Stage1PhaseObj;
}

const Stage1Context = createContext<Stage1ContextValue | null>(null);

export function useStage1(): Stage1ContextValue {
  const ctx = useContext(Stage1Context);
  if (!ctx) {
    throw new Error("useStage1 must be called within a <Stage1Walkthrough>");
  }
  return ctx;
}

export function buildStage1ContextValue(
  config: Stage1Config,
  session: Stage1Session,
  dispatch: Dispatch<Stage1Action>,
): Stage1ContextValue {
  const phases = buildPhases();
  const phaseObj = parsePhase(phases[session.phaseIdx]);
  return { config, session, dispatch, phases, phaseObj };
}

export const Stage1ContextProvider = Stage1Context.Provider;
