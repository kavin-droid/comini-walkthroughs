"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { makeQuizOptions } from "@/lib/place-value/quiz";
import { usePlaceValue } from "./PlaceValueContext";

interface QuizSlot {
  /** "intro": the spacing-scaffold animation is still playing, options aren't shown yet - only
   * used by the tens/hundreds slots (the ones the quiz that changes spacing). "question": the
   * animation is done, options are visible, waiting for an answer. */
  phase: "intro" | "question" | "revealing" | "feedback";
  selected: number | null;
  options: number[];
}

interface QuizState {
  tens: QuizSlot;
  ones: QuizSlot;
  hundreds: QuizSlot;
}

type QuizAction =
  | { type: "RESET"; tens: number; ones: number; hundreds: number }
  | { type: "TENS_INTRO_DONE" }
  | { type: "ANSWER_TENS"; value: number }
  | { type: "TENS_REVEAL_DONE" }
  | { type: "ANSWER_ONES"; value: number }
  | { type: "ONES_REVEAL_DONE" }
  | { type: "HUNDREDS_INTRO_DONE" }
  | { type: "ANSWER_HUNDREDS"; value: number }
  | { type: "HUNDREDS_REVEAL_DONE" };

function freshSlot(correct: number, startPhase: QuizSlot["phase"] = "question"): QuizSlot {
  return { phase: startPhase, selected: null, options: makeQuizOptions(correct) };
}

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "RESET":
      return {
        tens: freshSlot(action.tens, "intro"),
        ones: freshSlot(action.ones, "question"),
        hundreds: freshSlot(action.hundreds, "intro"),
      };
    case "TENS_INTRO_DONE":
      return { ...state, tens: { ...state.tens, phase: "question" } };
    case "ANSWER_TENS":
      if (state.tens.selected !== null) return state;
      return { ...state, tens: { ...state.tens, selected: action.value, phase: "revealing" } };
    case "TENS_REVEAL_DONE":
      return { ...state, tens: { ...state.tens, phase: "feedback" } };
    case "ANSWER_ONES":
      if (state.ones.selected !== null) return state;
      return { ...state, ones: { ...state.ones, selected: action.value, phase: "revealing" } };
    case "ONES_REVEAL_DONE":
      return { ...state, ones: { ...state.ones, phase: "feedback" } };
    case "HUNDREDS_INTRO_DONE":
      return { ...state, hundreds: { ...state.hundreds, phase: "question" } };
    case "ANSWER_HUNDREDS":
      if (state.hundreds.selected !== null) return state;
      return {
        ...state,
        hundreds: { ...state.hundreds, selected: action.value, phase: "revealing" },
      };
    case "HUNDREDS_REVEAL_DONE":
      return { ...state, hundreds: { ...state.hundreds, phase: "feedback" } };
    default:
      return state;
  }
}

interface QuizContextValue {
  quiz: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  tensRevealed: boolean;
  onesRevealed: boolean;
  hundredsRevealed: boolean;
  isLocked: boolean;
}

const QuizContext = createContext<QuizContextValue | null>(null);

/** Tracks every interactive quiz across both stages: stage 2's "how many tens / how many ones"
 * pair, and stage 3's "how many hundreds". Reveal flags are global to the question (not
 * per-step) - once answered, every step (even ones visited before the quiz) shows the real
 * count. Resets whenever a new question is visualized (session.n/conceptId change). Stage 3's
 * `hundreds` slot is simply unused by stage 2 (and vice versa) - harmless, since a stage only
 * ever produces steps of its own quiz kind. */
export function QuizProvider({ children }: { children: ReactNode }) {
  const { session, step } = usePlaceValue();
  const hundreds = Math.floor(session.n / 100);
  const tens = Math.floor(session.n / 10) % 10;
  const ones = session.n % 10;

  const [quiz, dispatch] = useReducer(
    quizReducer,
    { tens, ones, hundreds },
    ({ tens, ones, hundreds }) => ({
      tens: freshSlot(tens, "intro"),
      ones: freshSlot(ones, "question"),
      hundreds: freshSlot(hundreds, "intro"),
    }),
  );

  useEffect(() => {
    dispatch({ type: "RESET", tens, ones, hundreds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.n, session.conceptId]);

  const tensRevealed = quiz.tens.phase === "feedback";
  const onesRevealed = quiz.ones.phase === "feedback";
  const hundredsRevealed = quiz.hundreds.phase === "feedback";
  const isLocked =
    (step.kind === "quizTens" && quiz.tens.phase !== "feedback") ||
    (step.kind === "quizOnes" && quiz.ones.phase !== "feedback") ||
    (step.kind === "quizHundreds" && quiz.hundreds.phase !== "feedback");

  return (
    <QuizContext.Provider
      value={{ quiz, dispatch, tensRevealed, onesRevealed, hundredsRevealed, isLocked }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within a <QuizProvider>");
  return ctx;
}
