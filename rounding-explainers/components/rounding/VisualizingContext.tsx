"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

interface VisualizingValue {
  visualizing: boolean;
  /** Ported from the vanilla apps' `start()`: shows the `.loader-overlay` spinner, waits 450ms
   * (matching the vanilla `window.setTimeout(..., 450)`), then runs `commit` (the actual
   * `RESTART` dispatch). */
  runVisualize: (commit: () => void) => void;
}

const VisualizingContext = createContext<VisualizingValue | null>(null);

export function VisualizingProvider({ children }: { children: ReactNode }) {
  const [visualizing, setVisualizing] = useState(false);
  const timer = useRef<number | null>(null);

  function runVisualize(commit: () => void) {
    if (timer.current) window.clearTimeout(timer.current);
    setVisualizing(true);
    timer.current = window.setTimeout(() => {
      commit();
      setVisualizing(false);
      timer.current = null;
    }, 450);
  }

  return (
    <VisualizingContext.Provider value={{ visualizing, runVisualize }}>{children}</VisualizingContext.Provider>
  );
}

export function useVisualizing(): VisualizingValue {
  const ctx = useContext(VisualizingContext);
  if (!ctx) throw new Error("useVisualizing must be used within a <VisualizingProvider>");
  return ctx;
}
