"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface CombineCountValue {
  onesCounted: number;
  tensCounted: number;
  setCombineCount: (onesCounted: number, tensCounted: number) => void;
}

const CombineCountContext = createContext<CombineCountValue | null>(null);

/** Bridges the "Regroup and Multiply" concept's counting animation (driven by ArrayMultiplyView's
 * BreakdownView, a child of the step-remounted Workspace) over to NumericPanel (a persistent
 * sibling of Workspace, never remounted) so both can show the SAME real-time running count
 * instead of the panel jumping straight to the final total while the workspace is still counting
 * it out - the two components have no other way to share this per-tick animation state, since
 * they aren't parent/child. Every other concept ignores this provider entirely (only
 * ArrayMultiplyStep's `countCombine` step ever calls `setCombineCount`). */
export function CombineCountProvider({ children }: { children: ReactNode }) {
  const [onesCounted, setOnesCounted] = useState(0);
  const [tensCounted, setTensCounted] = useState(0);

  function setCombineCount(nextOnes: number, nextTens: number) {
    setOnesCounted(nextOnes);
    setTensCounted(nextTens);
  }

  return (
    <CombineCountContext.Provider value={{ onesCounted, tensCounted, setCombineCount }}>
      {children}
    </CombineCountContext.Provider>
  );
}

export function useCombineCount(): CombineCountValue {
  const ctx = useContext(CombineCountContext);
  if (!ctx) throw new Error("useCombineCount must be used within a <CombineCountProvider>");
  return ctx;
}
