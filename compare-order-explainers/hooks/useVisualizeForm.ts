"use client";

import { useState } from "react";
import { useCompareOrder } from "@/components/compare-order/CompareOrderContext";

export function useVisualizeForm(onVisualized?: () => void) {
  const { config, session, visualize } = useCompareOrder();
  const [inputs, setInputs] = useState<string[]>(() => session.values.map(String));
  const [error, setError] = useState<string | null>(null);

  function setInput(i: number, value: string) {
    setInputs((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function handleVisualize() {
    const values = inputs.map((v) => parseInt(v, 10));
    const validationError = config.validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onVisualized?.();
    visualize(values);
  }

  return { config, inputs, setInput, error, handleVisualize };
}
