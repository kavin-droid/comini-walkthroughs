"use client";

import { isTotalRevealed } from "@/lib/addition/visibility";
import { useAddition } from "./AdditionContext";

export function AnswerCard() {
  const { session, phaseObj } = useAddition();
  const revealed = isTotalRevealed(phaseObj);

  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      <span className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink">
        {session.a1} + {session.a2} ={" "}
        {revealed ? (
          <span className="text-sum">{session.sum}</span>
        ) : (
          <span className="text-ink-3">?</span>
        )}
      </span>
    </div>
  );
}
