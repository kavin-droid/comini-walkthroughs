"use client";

import { useState } from "react";
import { useStage1 } from "@/components/stage1/Stage1Context";

export function useStage1VisualizeForm(onVisualized?: () => void) {
  const { config, dispatch, session } = useStage1();
  const [a1, setA1] = useState(String(session.a1));
  const [a2, setA2] = useState(String(session.a2));
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    const n1 = parseInt(a1, 10);
    const n2 = parseInt(a2, 10);
    if (Number.isNaN(n1) || Number.isNaN(n2)) {
      setError("Please enter valid numbers.");
      return;
    }
    const validationError = config.validate(n1, n2);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    dispatch({ type: "RESTART", a1: n1, a2: n2 });
    onVisualized?.();
  }

  return { config, a1, setA1, a2, setA2, error, handleVisualize };
}
