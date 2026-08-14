"use client";

import { createContext, useContext, type Dispatch } from "react";
import type { SessionAction } from "@/lib/compare-order/session";
import type { CompareOrderConfig, Session, Step } from "@/lib/compare-order/types";

export interface CompareOrderContextValue {
  config: CompareOrderConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  step: Step;
  loading: boolean;
  /** Ported from the vanilla apps' start(): shows the loader overlay for a fixed 450ms before
   * committing the new values, a deliberate UX pacing beat rather than real async work. */
  visualize: (values: number[]) => void;
  /** Hides the passive explanatory narration (digit reveals, "X has the smallest...", the intro
   * walkthrough text) while leaving action-required text - the tap prompt and wrong-tap feedback -
   * always visible, since those are needed to use the app at all. */
  instructionsVisible: boolean;
  toggleInstructions: () => void;
}

const CompareOrderContext = createContext<CompareOrderContextValue | null>(null);

export function useCompareOrder(): CompareOrderContextValue {
  const ctx = useContext(CompareOrderContext);
  if (!ctx) {
    throw new Error("useCompareOrder must be called within a <CompareOrderWalkthrough>");
  }
  return ctx;
}

export const CompareOrderContextProvider = CompareOrderContext.Provider;
