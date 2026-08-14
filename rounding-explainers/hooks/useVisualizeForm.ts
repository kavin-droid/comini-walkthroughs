"use client";

import { useState } from "react";
import { useRounding } from "@/components/rounding/RoundingContext";
import { useVisualizing } from "@/components/rounding/VisualizingContext";

export function useVisualizeForm(onVisualized?: () => void) {
  const { config, dispatch, session } = useRounding();
  const { runVisualize } = useVisualizing();
  const [numberStr, setNumberStr] = useState(String(session.n));
  const [roundTo, setRoundTo] = useState(session.roundTo);
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    const n = parseInt(numberStr, 10);
    const validationError = config.validate(n);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    // Matches the vanilla apps' start(): close the mobile settings sheet immediately, THEN show
    // the loader spinner for 450ms before the new number's steps actually render.
    onVisualized?.();
    runVisualize(() => dispatch({ type: "RESTART", n, roundTo }));
  }

  return { config, numberStr, setNumberStr, roundTo, setRoundTo, error, handleVisualize };
}
