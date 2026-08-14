"use client";

import { useState } from "react";
import { validateStage3 } from "@/lib/division/stage3";

export interface Stage3Committed {
  dividend: number;
  divisor: number;
}

/** Local input buffer, independent per mount point (mobile sheet vs desktop row) - mirrors
 * useStage2Form/the addition port's useVisualizeForm. Stage3's concept is fixed (not a runtime
 * choice, just an informational disabled field), so unlike stage2 there is no shared lifted
 * concept state to worry about here. */
export function useStage3Form(committed: Stage3Committed, onVisualize: (next: Stage3Committed) => void) {
  const [dividendInput, setDividendInput] = useState(String(committed.dividend));
  const [divisorInput, setDivisorInput] = useState(String(committed.divisor));
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    const dividend = parseInt(dividendInput, 10);
    const divisor = parseInt(divisorInput, 10);
    const validationError = validateStage3(dividend, divisor);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onVisualize({ dividend, divisor });
  }

  return { dividendInput, setDividendInput, divisorInput, setDivisorInput, error, handleVisualize };
}
