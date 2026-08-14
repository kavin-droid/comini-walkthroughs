import { generateStepsCombine, generateStepsEquivalence } from "./stage2";
import { generateSteps } from "./stage3";
import type { FractionConfig } from "./types";

export const STAGE2_CONFIG: FractionConfig = {
  id: "stage2",
  title: "Fractions",
  ageBand: "Ages 6–7",
  conceptSelectable: true,
  concepts: [
    {
      id: "equivalence",
      label: "Understand Unit Fractions & Equivalence",
      inputMode: "single",
      fractionOptions: [
        { value: "1/4", label: "1/4" },
        { value: "1/2", label: "1/2" },
        { value: "3/4", label: "3/4" },
        { value: "1", label: "1" },
      ],
      defaultFraction: "1/2",
      piece1Options: [],
      piece2Options: [],
      defaultPiece1: "1/4",
      defaultPiece2: "1/2",
      generate: (fraction) => generateStepsEquivalence(fraction),
    },
    {
      id: "combine",
      label: "Combine Unit Fractions",
      inputMode: "combine",
      fractionOptions: [],
      defaultFraction: "1/2",
      piece1Options: [
        { value: "1/4", label: "1/4" },
        { value: "1/2", label: "1/2" },
      ],
      piece2Options: [
        { value: "1/4", label: "1/4" },
        { value: "1/2", label: "1/2" },
      ],
      defaultPiece1: "1/4",
      defaultPiece2: "1/2",
      generate: (_fraction, piece1, piece2) => generateStepsCombine(piece1, piece2),
    },
  ],
  progressionHref: "/stage3/",
  progressionLabel: "Stage 3 · Ages 7–8",
};

export const STAGE3_CONFIG: FractionConfig = {
  id: "stage3",
  title: "Fractions",
  ageBand: "Ages 7–8",
  conceptSelectable: false,
  concepts: [
    {
      id: "equalParts",
      label: "Equal Parts of a Whole or Set",
      inputMode: "single",
      fractionOptions: [
        { value: "1/2", label: "1/2" },
        { value: "1/3", label: "1/3" },
        { value: "2/3", label: "2/3" },
        { value: "1/4", label: "1/4" },
        { value: "3/4", label: "3/4" },
      ],
      defaultFraction: "2/3",
      piece1Options: [],
      piece2Options: [],
      defaultPiece1: "1/2",
      defaultPiece2: "1/2",
      generate: (fraction) => generateSteps(fraction),
    },
  ],
  progressionHref: "/stage2/",
  progressionLabel: "Stage 2 · Ages 6–7",
};
