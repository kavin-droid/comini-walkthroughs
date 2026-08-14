"use client";

import { useEffect, useState } from "react";
import type { GhostedIndices } from "@/lib/addition/types";
import { destPlace } from "@/lib/addition/pack";
import { cn } from "@/lib/utils";
import { isColumnOpen } from "@/lib/addition/visibility";
import { useDragDrop } from "@/hooks/useDragDrop";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { usePackAnimation, type PackAnimState } from "@/hooks/usePackAnimation";
import type { Place } from "@/lib/addition/types";
import { useAddition } from "./AdditionContext";
import { DragDropContextProvider } from "./DragDropContext";
import { DragClone } from "./DragClone";
import { GridRow } from "./GridRow";
import { CarryRow } from "./CarryRow";
import { BridgeArrow } from "./BridgeArrow";
import { CompareBanner } from "./CompareBanner";
import { PackPrompt } from "./PackPrompt";
import { FocusColumnOutline } from "./FocusColumnOutline";
import { DragArrowHint } from "./DragArrowHint";
import { Confetti } from "@/components/ds/Confetti";

const PLACE_LABEL: Record<string, string> = {
  hundreds: "Hundreds",
  tens: "Tens",
  ones: "Ones",
};

function emptyGhostedIndices(): GhostedIndices {
  return {
    hundreds: { n1: new Set(), n2: new Set() },
    tens: { n1: new Set(), n2: new Set() },
    ones: { n1: new Set(), n2: new Set() },
  };
}

function GridHeader({ previewPlace }: { previewPlace: Place | null }) {
  const { config, phaseObj, session } = useAddition();
  return (
    <div className="flex items-center gap-2.5 px-3 min-[900px]:gap-3 min-[900px]:px-5">
      {config.places.map((place) => {
        const visible = isColumnOpen(place, phaseObj, config, session) || place === previewPlace;
        return (
          <div
            key={place}
            data-row="header"
            data-place={place}
            aria-hidden={!visible}
            className={cn(
              "font-mono text-[11px] font-bold tracking-wide text-center w-[114px] min-[900px]:w-[190px] min-[900px]:text-[15px]",
              place === "hundreds" && "text-hundred",
              place === "tens" && "text-ten",
              place === "ones" && "text-one",
            )}
            style={{
              transition: "opacity 300ms ease-in-out, max-width 300ms ease-in-out, margin-left 300ms ease-in-out",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              maxWidth: visible ? 200 : 0,
              marginLeft: visible ? 0 : -10,
              pointerEvents: visible ? "auto" : "none",
            }}
          >
            {PLACE_LABEL[place]}
          </div>
        );
      })}
    </div>
  );
}

export function AdditionGrid() {
  const { session, config, dispatch, phaseObj, introRevealed, introEntryId } = useAddition();
  const [ghostedIndices, setGhostedIndices] = useState<GhostedIndices>(emptyGhostedIndices);
  // "fade in the workarea" the moment WorkingAnswerPanel starts shrinking (see
  // AdditionWalkthrough's introRevealed timer, shared via context so both components move on the
  // exact same beat, both stages) - stays true always once past 'intro' entirely.
  const gridRevealed = introRevealed || phaseObj.type !== "intro";

  // Reset in lockstep with the reducer's own moved[place] reset (see resetPlace in
  // lib/addition/session.ts, fired on entering predict-<place>) - keeps which dots are ghosted
  // and the session's own drag count from ever drifting apart.
  useEffect(() => {
    if (phaseObj.type !== "predict" || !phaseObj.place) return;
    const place = phaseObj.place;
    setGhostedIndices((prev) => ({ ...prev, [place]: { n1: new Set(), n2: new Set() } }));
  }, [phaseObj.type, phaseObj.place]);

  const { clone, onPointerDown } = useDragDrop({
    onCommit: (place, rowKey, index) => {
      setGhostedIndices((prev) => {
        const key = rowKey === "num1" ? "n1" : "n2";
        const nextSet = new Set(prev[place][key]);
        nextSet.add(index);
        return { ...prev, [place]: { ...prev[place], [key]: nextSet } };
      });
      dispatch({ type: "COMMIT_DRAG", place, rowKey });
    },
  });
  const { phase: packPhase, clusterRect, flyTarget, run } = usePackAnimation();
  // packAnim is null except while an active pack sequence is running; GridCell uses it to
  // render the highlight/fadeOut/fadeIn stages as real content in the source total-cell.
  const packAnim: PackAnimState | null =
    phaseObj.type === "drag" && phaseObj.place && packPhase !== "idle"
      ? { phase: packPhase, source: phaseObj.place, dest: destPlace(phaseObj.place) }
      : null;
  // While a pack sequence is running, the destination place's OWN column (header + its num1/num2
  // dot rows) briefly opens too, at reduced opacity (see GridRow/GridCell's `dimmed` handling) -
  // a contextual backdrop for the fly-to-CarryRow move animation to land in front of, not a
  // lasting reveal: it's still governed by isPlaceVisible/progressive disclosure the rest of the
  // time, and reverts the instant packPhase returns to "idle".
  const previewPlace: Place | null = packAnim?.dest ?? null;
  const { wrapRef, workspaceRef, scale, origin } = useFitWorkspace([
    session.phaseIdx,
    phaseObj.type,
    phaseObj.place,
    session.dragged,
    session.carryIn,
    packPhase,
  ]);

  return (
    <DragDropContextProvider value={onPointerDown}>
      <div
        key={introEntryId}
        id="workspace-wrap"
        ref={wrapRef}
        className={cn(
          "min-h-0 bg-card border border-line rounded-2xl relative flex justify-center",
          gridRevealed && "flex-1",
          origin === "center"
            ? "overflow-hidden items-center"
            : "overflow-y-auto overflow-x-hidden items-start",
        )}
        style={{
          opacity: gridRevealed ? 1 : 0,
          // Plain flex-grow/flex-basis (not framer-motion) mirroring WorkingAnswerPanel's own
          // transition - see its doc comment for why. Steady states rely on Tailwind's `flex-1`
          // (proven); only the transient "collapsed during stage3's full-size intro moment" state
          // gets an inline override, same reasoning as the panel's own `shrink-0` fallback.
          ...(gridRevealed ? {} : { flexGrow: 0, flexShrink: 0, flexBasis: "0%", minWidth: 0 }),
          transition: "opacity 500ms ease-in-out, flex-grow 700ms ease-in-out",
        }}
      >
        <div
          id="workspace"
          ref={workspaceRef}
          className="flex flex-col gap-2.5 py-3"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: origin === "center" ? "center center" : "top center",
          }}
        >
          <GridHeader previewPlace={previewPlace} />
          {config.allowCarry && <CarryRow />}
          <GridRow rowKey="num1" ghostedIndices={ghostedIndices} previewPlace={previewPlace} />
          <GridRow rowKey="num2" ghostedIndices={ghostedIndices} previewPlace={previewPlace} />
          <GridRow rowKey="total" packAnim={packAnim} previewPlace={previewPlace} />
          {phaseObj.type === "drag" && phaseObj.place && (
            <PackPrompt
              place={phaseObj.place}
              phase={packPhase}
              clusterRect={clusterRect}
              flyTarget={flyTarget}
              run={run}
            />
          )}
          {phaseObj.type === "compare" && phaseObj.place && (
            <CompareBanner place={phaseObj.place} />
          )}
        </div>
        {phaseObj.type === "done" && <Confetti />}
      </div>
      <DragClone clone={clone} />
      <FocusColumnOutline />
      <DragArrowHint />
      {config.allowCarry && <BridgeArrow />}
    </DragDropContextProvider>
  );
}
