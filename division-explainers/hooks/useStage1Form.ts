"use client";

import { useState } from "react";
import { validateStage1 } from "@/lib/division/stage1";

export interface Stage1Committed {
  total: number;
  people: number;
}

export function useStage1Form(committed: Stage1Committed, onVisualize: (next: Stage1Committed) => void) {
  const [totalInput, setTotalInput] = useState(String(committed.total));
  const [peopleInput, setPeopleInput] = useState(String(committed.people));
  const [error, setError] = useState<string | null>(null);

  function handleVisualize() {
    const total = parseInt(totalInput, 10);
    const people = parseInt(peopleInput, 10);
    const validationError = validateStage1(total, people);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onVisualize({ total, people });
  }

  return { totalInput, setTotalInput, peopleInput, setPeopleInput, error, handleVisualize };
}
