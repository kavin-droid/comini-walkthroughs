"use client";

import { useState } from "react";
import { useSubtraction } from "@/components/subtraction/SubtractionContext";

export function useSubtractionVisualizeForm(onVisualized?: () => void) {
  const { config, dispatch, session } = useSubtraction();
  const [minuend, setMinuend] = useState(String(session.minuend));
  const [subtrahend, setSubtrahend] = useState(String(session.subtrahend));
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    const m = parseInt(minuend, 10);
    const s = parseInt(subtrahend, 10);
    if (Number.isNaN(m) || Number.isNaN(s)) {
      setError("Please enter valid numbers.");
      return;
    }
    const validationError = config.validate(m, s);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    dispatch({ type: "RESTART", minuend: m, subtrahend: s });
    onVisualized?.();
  }

  return { config, minuend, setMinuend, subtrahend, setSubtrahend, error, handleVisualize };
}
