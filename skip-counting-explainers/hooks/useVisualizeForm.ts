"use client";

import { useState } from "react";
import { useSkipCounting } from "@/components/skip-counting/SkipCountingContext";
import type { Direction, StepSize } from "@/lib/skip-counting/types";

/** Draft form state for the Question sentence (start / direction / step / jumps), separate from
 * the active session - mirrors the vanilla app's module-level `selectedDir`/`selectedStep` plus
 * the raw <input> values, all only committed to the walkthrough on "Visualize". */
export function useVisualizeForm(onVisualized?: () => void) {
  const { config, dispatch, session } = useSkipCounting();
  const [startVal, setStartVal] = useState(String(session.startVal));
  const [jumps, setJumps] = useState(String(session.jumps));
  const [dir, setDir] = useState<Direction>(session.dir);
  const [step, setStep] = useState<StepSize>(session.step);
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    const startNum = parseInt(startVal, 10);
    const jumpsNum = parseInt(jumps, 10);
    const validationError = config.validate(startNum, dir, step, jumpsNum);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    dispatch({ type: "RESTART", startVal: startNum, dir, step, jumps: jumpsNum });
    onVisualized?.();
  }

  return {
    config,
    startVal,
    setStartVal,
    jumps,
    setJumps,
    dir,
    setDir,
    step,
    setStep,
    error,
    handleVisualize,
  };
}
