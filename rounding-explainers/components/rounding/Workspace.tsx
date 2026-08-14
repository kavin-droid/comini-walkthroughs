"use client";

import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { useRounding } from "./RoundingContext";
import { useVisualizing } from "./VisualizingContext";
import { SplitView } from "./SplitView";
import { LineView } from "./LineView";
import { HopView } from "./HopView";
import { CloserView } from "./CloserView";
import { DoneView } from "./DoneView";

function ActiveView() {
  const { step } = useRounding();
  switch (step.view) {
    case "line":
      return <LineView />;
    case "hop":
      return <HopView />;
    case "closer":
      return <CloserView />;
    case "done":
      return <DoneView />;
    default:
      return <SplitView />;
  }
}

/** Ported from `#workspace-wrap`/`#workspace` + `fitWorkspace()`. Each step mounts a fresh
 * `<ActiveView>` (keyed on `stepIdx`) so its ephemeral animation/interaction state (hop-arc
 * progress, split-preview visibility, tap feedback) resets cleanly on step change - the
 * React-idiomatic replacement for the vanilla `clearHopTimers()`/`clearSplitPreviewTimers()`/
 * `clearMcqHost()` calls at the top of `renderStep()`. */
export function Workspace() {
  const { session } = useRounding();
  const { visualizing } = useVisualizing();
  const { wrapRef, workspaceRef, scale } = useFitWorkspace([session.stepIdx]);

  return (
    <div
      ref={wrapRef}
      className="flex-1 min-h-0 bg-card border border-line rounded-2xl relative flex items-center justify-center overflow-hidden shadow-sm"
    >
      <div
        ref={workspaceRef}
        className="shrink-0"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        <ActiveView key={session.stepIdx} />
      </div>
      {visualizing && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/85 rounded-2xl z-10">
          <div className="w-[34px] h-[34px] rounded-full border-[3px] border-line-2 border-t-left animate-spin" />
        </div>
      )}
    </div>
  );
}
