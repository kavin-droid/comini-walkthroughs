"use client";

import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { usePlaceValue } from "./PlaceValueContext";
import { UnitsFieldView } from "./UnitsFieldView";
import { QuizTensView } from "./QuizTensView";
import { QuizOnesView } from "./QuizOnesView";
import { BundledView } from "./BundledView";
import { RodsOnesView } from "./RodsOnesView";
import { QuizHundredsView } from "./QuizHundredsView";
import { CardsView } from "./CardsView";

export function Workspace() {
  const { session, step } = usePlaceValue();
  const { wrapRef, workspaceRef, scale } = useFitWorkspace([
    session.stepIdx,
    session.n,
    session.conceptId,
  ]);

  return (
    <div
      id="workspace-wrap"
      ref={wrapRef}
      className="flex-1 min-h-0 bg-card border border-line rounded-2xl relative flex items-center justify-center overflow-hidden shadow-sm"
    >
      <div
        id="workspace"
        ref={workspaceRef}
        className="flex-none"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        <div key={session.stepIdx}>
          {step.kind === "unitsField" && <UnitsFieldView step={step} />}
          {step.kind === "quizTens" && <QuizTensView step={step} />}
          {step.kind === "quizOnes" && <QuizOnesView step={step} />}
          {step.kind === "bundled" && <BundledView step={step} />}
          {step.kind === "rodsOnes" && <RodsOnesView step={step} />}
          {step.kind === "quizHundreds" && <QuizHundredsView step={step} />}
          {step.kind === "cards" && <CardsView step={step} />}
        </div>
      </div>
    </div>
  );
}
