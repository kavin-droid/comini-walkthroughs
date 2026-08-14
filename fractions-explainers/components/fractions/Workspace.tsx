"use client";

import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { useFractions } from "./FractionContext";
import { WholeView } from "./WholeView";
import { StripView } from "./StripView";
import { TapQuartersView } from "./TapQuartersView";
import { TapCombineView } from "./TapCombineView";
import { SetView } from "./SetView";

export function Workspace() {
  const { session, step } = useFractions();
  const { wrapRef, workspaceRef, scale } = useFitWorkspace([
    session.stepIdx,
    session.conceptId,
    session.fraction,
    session.piece1,
    session.piece2,
    session.solved,
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
          {step.kind === "whole" && <WholeView />}
          {step.kind === "strip" && <StripView step={step} />}
          {step.kind === "tapQuarters" && <TapQuartersView step={step} />}
          {step.kind === "tapCombineTotal" && <TapCombineView step={step} />}
          {step.kind === "set" && <SetView step={step} />}
        </div>
      </div>
    </div>
  );
}
