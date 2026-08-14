"use client";

import { isRevealAnswer } from "@/lib/skip-counting/phases";
import { actionWord, sessionSequence } from "@/lib/skip-counting/sequence";
import { useSkipCounting } from "./SkipCountingContext";

export function AnswerCard() {
  const { session, phaseObj } = useSkipCounting();
  const revealed = isRevealAnswer(phaseObj);
  const seq = sessionSequence(session);

  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      {/* Keyed on phaseIdx so the "new" pop-in replays every time the reveal re-renders,
          matching the vanilla app's full DOM rebuild on every renderStep() call. */}
      <span
        key={session.phaseIdx}
        className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink break-words"
      >
        {revealed ? (
          seq.map((v, i) => (
            <span key={i}>
              {i > 0 && " → "}
              {i === seq.length - 1 ? (
                <span
                  className="text-accent inline-block"
                  style={{ animation: "pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                >
                  {v}
                </span>
              ) : (
                v
              )}
            </span>
          ))
        ) : (
          <>
            {session.startVal}, {actionWord(session.dir)} by {session.step}s{" "}
            <span className="text-ink-3 opacity-50">→ ?</span>
          </>
        )}
      </span>
    </div>
  );
}
