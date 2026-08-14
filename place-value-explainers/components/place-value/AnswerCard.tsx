"use client";

import { usePlaceValue } from "./PlaceValueContext";
import { useQuiz } from "./QuizContext";
import { plural } from "@/lib/place-value/narration";

function Placeholder({ label }: { label: string }) {
  return (
    <>
      <span className="text-ink-3 opacity-50">?</span> {label}
    </>
  );
}

function Revealed({ value, label }: { value: number; label: string }) {
  return (
    <>
      <span className="text-accent inline-block animate-in fade-in zoom-in-95 duration-500">{value}</span>{" "}
      {label}
    </>
  );
}

/** Stage 2's answer expression reads from the global quiz-reveal flags (tensRevealed/onesRevealed),
 * not per-step data - once a quiz is answered, every step (even ones visited before the quiz) shows
 * the real count. Stage 3's hundreds digit is the same (driven by hundredsRevealed, since it now
 * has its own quiz), but its tens/ones digits stay driven by the current step's `revealAnswer`
 * flag (only present on the cards/chart steps, once the hundreds quiz has already resolved). */
export function AnswerCard() {
  const { config, session, step } = usePlaceValue();
  const { tensRevealed, onesRevealed, hundredsRevealed } = useQuiz();

  const n = session.n;

  if (config.hasQuiz) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return (
      <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
        <span className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink leading-snug">
          {n} ={" "}
          {tensRevealed ? (
            <Revealed value={tens} label={plural(tens, "ten")} />
          ) : (
            <Placeholder label="tens" />
          )}{" "}
          {onesRevealed ? (
            <Revealed value={ones} label={plural(ones, "one")} />
          ) : (
            <Placeholder label="ones" />
          )}
        </span>
      </div>
    );
  }

  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  const tens = Math.floor(rem / 10);
  const ones = rem % 10;
  const revealAnswer = "revealAnswer" in step ? step.revealAnswer : false;

  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      <span className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink leading-snug">
        {n} ={" "}
        {hundredsRevealed ? (
          <Revealed value={hundreds} label={plural(hundreds, "hundred")} />
        ) : (
          <Placeholder label="hundreds" />
        )}{" "}
        {revealAnswer ? (
          <Revealed value={tens} label={plural(tens, "ten")} />
        ) : (
          <Placeholder label="tens" />
        )}{" "}
        {revealAnswer ? (
          <Revealed value={ones} label={plural(ones, "one")} />
        ) : (
          <Placeholder label="ones" />
        )}
      </span>
    </div>
  );
}
