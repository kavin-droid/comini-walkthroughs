import {
  generateArrayMultiplySteps,
  generateCommutativeSteps,
  generateDistributiveSteps,
  generatePlaceValueSteps,
} from "./stage3";
import { generateArraySteps, generateEquationGroupsSteps } from "./stage2";
import type { ConceptConfig, MultiplicationConfig } from "./types";

function validateStage2(a: number, b: number): string | null {
  if (Number.isNaN(a) || Number.isNaN(b)) return "Please enter valid numbers.";
  if (a < 2 || a > 5) return "First number must be between 2 and 5.";
  if (b < 1 || b > 10) return "Second number must be between 1 and 10.";
  return null;
}

function validateStage3(a: number, b: number, concept: ConceptConfig): string | null {
  if (Number.isNaN(a) || Number.isNaN(b)) return "Please enter valid numbers.";
  const aMin = concept.factorAMin ?? 2;
  const aMax = concept.factorAMax ?? 9;
  const bMin = concept.factorBMin ?? 2;
  const bMax = concept.factorBMax ?? 10;
  if (a < aMin || a > aMax) return `First number must be between ${aMin} and ${aMax}.`;
  if (b < bMin || b > bMax) return `Second number must be between ${bMin} and ${bMax}.`;
  if (concept.lockFactorB && b !== 10) return "Second number is fixed at 10 for this concept.";
  return null;
}

export const STAGE2_CONFIG: MultiplicationConfig = {
  id: "stage2",
  title: "Multiplication",
  ageBand: "Ages 6–7",
  conceptSelectable: true,
  concepts: [
    {
      id: "equationGroups",
      label: "Repeated Addition",
      lockFactorB: false,
      generate: generateEquationGroupsSteps,
    },
    {
      id: "arrays",
      label: "Arrays",
      lockFactorB: false,
      generate: generateArraySteps,
    },
  ],
  factorALabel: "First number",
  factorBLabel: "Second number",
  factorAMin: 2,
  factorAMax: 5,
  factorBMin: 1,
  factorBMax: 10,
  defaultFactorA: 3,
  defaultFactorB: 4,
  validate: validateStage2,
  progressionHref: "/stage3/",
  progressionLabel: "Stage 3 · Ages 7–8",
};

export const STAGE3_CONFIG: MultiplicationConfig = {
  id: "stage3",
  title: "Multiplication",
  ageBand: "Ages 7–8",
  conceptSelectable: true,
  concepts: [
    {
      id: "commutative",
      label: "Commutative Property",
      lockFactorB: false,
      generate: generateCommutativeSteps,
    },
    {
      id: "distributive",
      label: "Distributive Property",
      lockFactorB: false,
      generate: generateDistributiveSteps,
    },
    {
      id: "placeValue",
      label: "Multiply by 10",
      lockFactorB: true,
      generate: (a) => generatePlaceValueSteps(a),
    },
    {
      id: "regroupMultiply",
      label: "Regroup and Multiply",
      lockFactorB: false,
      // 2-digit x 1-digit, unlike every other Stage 3 concept - see ConceptConfig's doc comment.
      factorAMin: 10,
      factorAMax: 99,
      factorBMin: 2,
      factorBMax: 9,
      defaultFactorA: 23,
      defaultFactorB: 4,
      generate: generateArrayMultiplySteps,
    },
  ],
  factorALabel: "First number",
  factorBLabel: "Second number",
  factorAMin: 2,
  factorAMax: 9,
  factorBMin: 2,
  factorBMax: 10,
  defaultFactorA: 3,
  defaultFactorB: 4,
  validate: validateStage3,
  progressionHref: "/stage2/",
  progressionLabel: "Stage 2 · Ages 6–7",
};
