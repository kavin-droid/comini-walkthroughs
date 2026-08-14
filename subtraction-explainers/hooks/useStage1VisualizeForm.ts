"use client";

import { useEffect, useState } from "react";
import { useStage1 } from "@/components/stage1/Stage1Context";
import { validateStage1 } from "@/lib/stage1/config";

/** Mirrors useSubtractionVisualizeForm's shape exactly (round-20: "the container should reflect
 * the same as stage2"), wired to Stage1Context/SET_CUSTOM instead. The local input strings resync
 * whenever the ACTIVE pair changes for a reason other than typing (a preset pill click, or
 * switching concept) - unlike stage2/3 (where the only thing that ever changes session.minuend is
 * this same hook's own handleVisualize), stage1's active pair can ALSO change from the sibling
 * preset-pills component, so without this resync the input boxes would silently go stale/wrong
 * the moment a pill is tapped. */
export function useStage1VisualizeForm(onVisualized?: () => void) {
  const { state, dispatch } = useStage1();
  const current = state.numbers[state.concept];
  const [minuend, setMinuend] = useState(String(current.minuend));
  const [subtrahend, setSubtrahend] = useState(String(current.subtrahend));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMinuend(String(current.minuend));
    setSubtrahend(String(current.subtrahend));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.minuend, current.subtrahend, state.concept]);

  function handleVisualize() {
    const m = parseInt(minuend, 10);
    const s = parseInt(subtrahend, 10);
    if (Number.isNaN(m) || Number.isNaN(s)) {
      setError("Please enter valid numbers.");
      return;
    }
    const validationError = validateStage1(m, s);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    dispatch({ type: "SET_CUSTOM", concept: state.concept, minuend: m, subtrahend: s });
    onVisualized?.();
  }

  return { minuend, setMinuend, subtrahend, setSubtrahend, error, handleVisualize };
}
