"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { useStage1DragDrop } from "@/hooks/useStage1DragDrop";
import { isBoxVisible } from "@/lib/stage1/phases";
import { useStage1 } from "./Stage1Context";
import { Dot } from "./Dot";
import { AnswerCard } from "./AnswerCard";
import { CombineHeading } from "./CombineHeading";
import { AnswerBox } from "./AnswerBox";
import { FinalCallout } from "./FinalCallout";
import { Stage1DragClone } from "./Stage1DragClone";
import { Stage1DragArrowHint } from "./Stage1DragArrowHint";
import { FeedbackBanner } from "./FeedbackBanner";
import { Confetti } from "@/components/ds/Confetti";
import { COLOR_A, COLOR_B } from "./colors";

const REVEAL_STEP_MS = 380;
const COUNT_STEP_MS = 550;
const FEEDBACK_DELAY_MS = 500;

export function Stage1Scene() {
  const { session, phaseObj, dispatch } = useStage1();
  const { a1, a2, sum, draggedA, draggedB } = session;

  const [revealedA, setRevealedA] = useState(0);
  const [revealedB, setRevealedB] = useState(0);
  // 0..sum during the "count" phase's one-at-a-time recount (see AnswerBox's `count` prop).
  const [countedThrough, setCountedThrough] = useState(0);
  const [feedbackReady, setFeedbackReady] = useState(false);
  // Which specific dot INDICES have been dragged, not just a count - lets the ghost left behind
  // in the source cluster be the exact dot the child grabbed, not just "however many by array
  // order" (see the reducer's draggedA/draggedB, which only track a count for progress/box
  // purposes - deriving ghosting from that count alone always ghosts index 0,1,2... regardless
  // of which physical dot was actually dragged, which is the bug this fixes).
  const [ghostedA, setGhostedA] = useState<Set<number>>(new Set());
  const [ghostedB, setGhostedB] = useState<Set<number>>(new Set());

  // Reset in lockstep with the reducer's own draggedA/draggedB reset (see
  // lib/stage1/session.ts's applyPhaseChange) so the two never drift apart.
  useEffect(() => {
    if (phaseObj.type === "showSetA" || phaseObj.type === "showSetB" || phaseObj.type === "dragA") {
      setGhostedA(new Set());
      setGhostedB(new Set());
    }
  }, [phaseObj.type]);

  useEffect(() => {
    if (phaseObj.type === "intro") {
      setRevealedA(0);
      return;
    }
    if (phaseObj.type !== "showSetA") {
      setRevealedA(a1);
      return;
    }
    setRevealedA(0);
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setRevealedA(i);
      if (i >= a1) window.clearInterval(interval);
    }, REVEAL_STEP_MS);
    return () => window.clearInterval(interval);
  }, [phaseObj.type, a1]);

  useEffect(() => {
    if (phaseObj.type === "intro" || phaseObj.type === "showSetA") {
      setRevealedB(0);
      return;
    }
    if (phaseObj.type !== "showSetB") {
      setRevealedB(a2);
      return;
    }
    setRevealedB(0);
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setRevealedB(i);
      if (i >= a2) window.clearInterval(interval);
    }, REVEAL_STEP_MS);
    return () => window.clearInterval(interval);
  }, [phaseObj.type, a2]);

  useEffect(() => {
    if (phaseObj.type !== "count") {
      setCountedThrough(phaseObj.type === "done" ? sum : 0);
      setFeedbackReady(phaseObj.type === "done");
      return;
    }
    setCountedThrough(0);
    setFeedbackReady(false);
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setCountedThrough(i);
      if (i >= sum) {
        window.clearInterval(interval);
        window.setTimeout(() => setFeedbackReady(true), FEEDBACK_DELAY_MS);
      }
    }, COUNT_STEP_MS);
    return () => window.clearInterval(interval);
  }, [phaseObj.type, sum]);

  const { clone, onPointerDown } = useStage1DragDrop({
    onCommit: (set, index) => {
      if (set === "A") {
        setGhostedA((prev) => new Set(prev).add(index));
        dispatch({ type: "DRAG_A" });
      } else {
        setGhostedB((prev) => new Set(prev).add(index));
        dispatch({ type: "DRAG_B" });
      }
    },
  });

  const { wrapRef, workspaceRef, scale, origin } = useFitWorkspace([
    phaseObj.type,
    revealedA,
    revealedB,
    draggedA,
    draggedB,
    countedThrough,
    a1,
    a2,
  ]);

  if (phaseObj.type === "done") {
    return (
      <div
        id="workspace-wrap"
        className="flex-1 min-h-0 bg-card border border-line rounded-2xl relative flex items-center justify-center overflow-hidden"
      >
        <FinalCallout a1={a1} a2={a2} sum={sum} />
        <Confetti />
      </div>
    );
  }

  const showClusters = phaseObj.type !== "predict" && phaseObj.type !== "count";
  const boxVisible = isBoxVisible(phaseObj);
  const highlightIndex = phaseObj.type === "count" ? countedThrough - 1 : -1;
  const displayCount = phaseObj.type === "count" ? countedThrough : draggedA + draggedB;

  return (
    <div
      id="workspace-wrap"
      ref={wrapRef}
      className={cn(
        "flex-1 min-h-0 bg-card border border-line rounded-2xl relative flex justify-center",
        origin === "center" ? "overflow-hidden items-center" : "overflow-y-auto overflow-x-hidden items-start",
      )}
    >
      <div
        id="workspace"
        ref={workspaceRef}
        style={{ transform: `scale(${scale})`, transformOrigin: origin === "center" ? "center center" : "top center" }}
        className="flex flex-col items-center gap-5 min-[900px]:gap-8 px-6 py-8 min-[900px]:px-16 min-[900px]:py-12"
      >
        <AnswerCard />
        <CombineHeading />

        {showClusters && (
          <div className="flex items-start gap-6 min-[900px]:gap-12">
            <div
              data-stage1-cluster="A"
              className="flex flex-wrap justify-center gap-1.5 min-[900px]:gap-3 max-w-[160px] min-[900px]:max-w-[260px]"
            >
              {Array.from({ length: revealedA }).map((_, i) => {
                const ghosted = ghostedA.has(i);
                const draggable = phaseObj.type === "dragA" && !ghosted;
                return (
                  <Dot
                    key={`a-${i}`}
                    color={COLOR_A}
                    ghost={ghosted}
                    draggable={draggable}
                    onPointerDown={draggable ? (e) => onPointerDown(e, "A", COLOR_A, i) : undefined}
                  />
                );
              })}
            </div>
            <div
              data-stage1-cluster="B"
              className="flex flex-wrap justify-center gap-1.5 min-[900px]:gap-3 max-w-[160px] min-[900px]:max-w-[260px]"
            >
              {Array.from({ length: revealedB }).map((_, i) => {
                const ghosted = ghostedB.has(i);
                const draggable = phaseObj.type === "dragB" && !ghosted;
                return (
                  <Dot
                    key={`b-${i}`}
                    color={COLOR_B}
                    ghost={ghosted}
                    draggable={draggable}
                    onPointerDown={draggable ? (e) => onPointerDown(e, "B", COLOR_B, i) : undefined}
                  />
                );
              })}
            </div>
          </div>
        )}

        {boxVisible && (
          <AnswerBox
            draggedA={draggedA}
            draggedB={draggedB}
            count={displayCount}
            hideCount={phaseObj.type === "predict"}
            highlightIndex={highlightIndex}
          />
        )}
      </div>

      <Stage1DragClone clone={clone} />
      <Stage1DragArrowHint active={phaseObj.type === "dragA"} sourceSelector='[data-stage1-cluster="A"]' />
      <Stage1DragArrowHint active={phaseObj.type === "dragB"} sourceSelector='[data-stage1-cluster="B"]' />
      {phaseObj.type === "count" && feedbackReady && (
        <div className="absolute bottom-3 left-0 right-0 px-3">
          <FeedbackBanner correct={session.prediction === sum} sum={sum} guess={session.prediction} />
        </div>
      )}
    </div>
  );
}
