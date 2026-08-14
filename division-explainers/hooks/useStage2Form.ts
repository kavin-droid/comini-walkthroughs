"use client";

import { useState } from "react";
import { validateStage2, type Stage2Concept } from "@/lib/division/stage2";

export interface Stage2Committed {
  dividend: number;
  divisor: number;
  concept: Stage2Concept;
}

/** Dividend/divisor input buffer, local per mount point (mobile sheet vs desktop row) - mirrors
 * the addition port's useVisualizeForm, since only one of those two mount points is ever visible
 * at a time. `concept` is passed in rather than owned here: on desktop the concept select lives
 * in the header (Stage2HeaderPills) while this same buffer's Visualize button lives in the
 * question row (Stage2QuestionRow) - two simultaneously-mounted components, so concept has to be
 * lifted to their shared parent instead of duplicated per-mount like dividend/divisor. */
export function useStage2Form(
  committed: Stage2Committed,
  concept: Stage2Concept,
  onVisualize: (next: Stage2Committed) => void,
) {
  const [dividendInput, setDividendInput] = useState(String(committed.dividend));
  const [divisorInput, setDivisorInput] = useState(String(committed.divisor));
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    const dividend = parseInt(dividendInput, 10);
    const divisor = parseInt(divisorInput, 10);
    const validationError = validateStage2(dividend, divisor);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onVisualize({ dividend, divisor, concept });
  }

  return { dividendInput, setDividendInput, divisorInput, setDivisorInput, error, handleVisualize };
}
