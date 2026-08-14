"use client";

import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { useMultiplication } from "./MultiplicationContext";
import { GroupsView } from "./GroupsView";
import { GroupsToArrayView } from "./GroupsToArrayView";
import { ArrayView } from "./ArrayView";
import { CompareView } from "./CompareView";
import { PlaceValueView } from "./PlaceValueView";
import { BoxGroupsView } from "./BoxGroupsView";
import { ArrayBuildView } from "./ArrayBuildView";
import { ArrayMultiplyView } from "./ArrayMultiplyView";

export function Workspace() {
  const { session, step } = useMultiplication();
  const { wrapRef, workspaceRef, scale } = useFitWorkspace([
    session.stepIdx,
    session.a,
    session.b,
    session.conceptId,
  ]);

  // "Regroup and Multiply" docks a NumericPanel beside this component (see
  // MultiplicationWalkthrough's layout branch) instead of stacking AnswerCard above it - the
  // workspace itself fades/grows in once the panel has docked (step.panelDocked), a plain
  // opacity/flex-basis CSS transition since this wrap div is never remounted per step (only its
  // `key`-ed child is), mirroring how NumericPanel animates its own docking width.
  const dockedLayout = step.kind === "arrayMultiply";
  const panelDocked = step.kind === "arrayMultiply" ? step.panelDocked : true;

  return (
    <div
      id="workspace-wrap"
      ref={wrapRef}
      className="flex-1 min-h-0 bg-card border border-line rounded-2xl relative flex items-center justify-center overflow-hidden shadow-sm"
      style={
        dockedLayout
          ? {
              opacity: panelDocked ? 1 : 0,
              flexGrow: panelDocked ? 1 : 0,
              flexBasis: panelDocked ? "0%" : "0px",
              pointerEvents: panelDocked ? "auto" : "none",
              transition: "opacity 500ms ease-in-out 150ms, flex-grow 600ms ease-in-out, flex-basis 600ms ease-in-out",
            }
          : undefined
      }
    >
      <div
        id="workspace"
        ref={workspaceRef}
        className="flex-none"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        <div key={session.stepIdx}>
          {step.kind === "groups" && <GroupsView step={step} />}
          {step.kind === "groupsToArray" && <GroupsToArrayView step={step} />}
          {step.kind === "array" && <ArrayView step={step} />}
          {step.kind === "compare" && <CompareView step={step} />}
          {step.kind === "placeValue" && <PlaceValueView step={step} />}
          {step.kind === "boxGroups" && <BoxGroupsView step={step} />}
          {step.kind === "arrayBuild" && <ArrayBuildView step={step} />}
          {step.kind === "arrayMultiply" && <ArrayMultiplyView step={step} />}
        </div>
      </div>
    </div>
  );
}
