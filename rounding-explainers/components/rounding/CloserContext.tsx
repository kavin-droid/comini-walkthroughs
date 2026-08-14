"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Side } from "@/lib/rounding/types";
import { useRounding } from "./RoundingContext";

interface CloserAnimState {
  mcqAnswered: boolean;
  /** Which side was the (only ever) correct answer, once answered. */
  correctSide: Side | null;
  wrongSide: Side | null;
  feedback: { kind: "right" | "wrong"; text: string } | null;
  arcsHidden: boolean;
  markerSettled: boolean;
  badgeUpdated: boolean;
  answer: (side: Side) => void;
}

const CloserContext = createContext<CloserAnimState | null>(null);

/**
 * Ported from `renderCloser()`'s MCQ click handler. Vanilla renders the arcs/marker/hop-counts
 * (inside the scaled workspace) and the two option buttons (outside it, in `#mcq-host`) from the
 * SAME function call, sharing one closure - the click handler directly mutates DOM elements it
 * just created in both places. This context is the React-idiomatic equivalent: one shared
 * ephemeral-animation-state owner (mounted fresh per step via `key={session.stepIdx}` at the
 * call site, see RoundingWalkthrough) consumed by both `<CloserView>` (in the workspace) and
 * `<McqOptions>` (the sibling options panel), so a single click drives both halves of the
 * sequence without a DOM portal. Timing: 800ms (fade arcs/counts) -> 250ms (settle marker +
 * bounce) -> 400ms (swap badge to the rounded value) -> 700ms (advance) - ported 1:1 from the
 * vanilla's nested `hopTimers.push(setTimeout(...))` chain.
 */
export function CloserProvider({ children }: { children: ReactNode }) {
  const { step, session, dispatch } = useRounding();
  const [wrongSide, setWrongSide] = useState<Side | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "right" | "wrong"; text: string } | null>(null);
  const [arcsHidden, setArcsHidden] = useState(false);
  const [markerSettled, setMarkerSettled] = useState(false);
  const [badgeUpdated, setBadgeUpdated] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  function answer(side: Side) {
    if (session.mcqAnswered || step.view !== "closer") return;
    const accept = step.isTie ? side === "above" : side === step.closerSide;

    if (!accept) {
      setWrongSide(side);
      setFeedback({ kind: "wrong", text: "Not quite. Try again." });
      timers.current.push(
        window.setTimeout(() => {
          setWrongSide(null);
          setFeedback(null);
        }, 1200),
      );
      return;
    }

    dispatch({ type: "ANSWER_MCQ" });
    setFeedback({
      kind: "right",
      text: step.isTie
        ? `Yes! Same hops. We round up to ${step.upper}.`
        : `Yes! ${step.rounded} is closer.`,
    });

    timers.current.push(
      window.setTimeout(() => {
        setArcsHidden(true);
        timers.current.push(
          window.setTimeout(() => {
            setMarkerSettled(true);
            timers.current.push(
              window.setTimeout(() => {
                setBadgeUpdated(true);
                timers.current.push(window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), 700));
              }, 400),
            );
          }, 250),
        );
      }, 800),
    );
  }

  const correctSide: Side | null = session.mcqAnswered ? (step.isTie ? "above" : step.closerSide) : null;

  const value: CloserAnimState = {
    mcqAnswered: session.mcqAnswered,
    correctSide,
    wrongSide,
    feedback,
    arcsHidden,
    markerSettled,
    badgeUpdated,
    answer,
  };

  return <CloserContext.Provider value={value}>{children}</CloserContext.Provider>;
}

export function useCloser(): CloserAnimState {
  const ctx = useContext(CloserContext);
  if (!ctx) throw new Error("useCloser must be used within a <CloserProvider>");
  return ctx;
}
