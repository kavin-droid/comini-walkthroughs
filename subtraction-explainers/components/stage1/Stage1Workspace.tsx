"use client";

import { cn } from "@/lib/utils";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useStage1 } from "./Stage1Context";
import { NumberLineScene } from "./NumberLineScene";
import { TakeAwayScene } from "./TakeAwayScene";

/** Same scale-to-fit mechanism as stage2/3's Grid (see useFitWorkspace) - each scene draws itself
 * (equation banner + visual) at a fixed pixel footprint sized for the current breakpoint (see
 * their own layoutFor()) and this scales that box up to fill the available card, so the visuals
 * use the available white space instead of sitting small and centered. Scenes are self-contained
 * now (own their own width/height), so this component just picks which one to render and forwards
 * the single "advance on correct tap/drag" callback each interactive step needs. */
export function Stage1Workspace() {
  const { step, dispatch } = useStage1();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { wrapRef, workspaceRef, scale, origin } = useFitWorkspace([step.id, isDesktop]);
  const advance = () => dispatch({ type: "ADVANCE" });

  return (
    <div
      id="stage1-workspace-wrap"
      ref={wrapRef}
      className={cn(
        "flex-1 min-h-0 bg-card border border-line rounded-2xl relative flex justify-center",
        origin === "center" ? "overflow-hidden items-center" : "overflow-y-auto overflow-x-hidden items-start",
      )}
    >
      <div
        id="stage1-workspace"
        ref={workspaceRef}
        className="py-4"
        style={{ transform: `scale(${scale})`, transformOrigin: origin === "center" ? "center center" : "top center" }}
      >
        {step.view === "countBack" && <NumberLineScene step={step} isDesktop={isDesktop} onCorrectHop={advance} />}
        {step.view === "takeAway" && <TakeAwayScene step={step} isDesktop={isDesktop} onCorrectRemove={advance} />}
      </div>
    </div>
  );
}
