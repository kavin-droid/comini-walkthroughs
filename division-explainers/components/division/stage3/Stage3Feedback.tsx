import { cn } from "@/lib/utils";

/** With hideText, the sentence swaps for a plain icon in the same colored badge - the shape and
 * color already say "right" vs "not quite" without needing a word read. */
export function Stage3Feedback({ guess, correct, hideText }: { guess: number; correct: number; hideText: boolean }) {
  const isCorrect = guess === correct;
  return (
    <div
      className={cn(
        "text-center text-[15px] font-sans font-semibold py-2.5 px-5 rounded-xl border",
        isCorrect ? "bg-left-bg border-left text-left" : "bg-paper-2 border-line-2 text-ink-2",
      )}
      style={{ animation: "fade-in-up 0.35s ease" }}
    >
      {hideText ? (
        <span className="text-xl leading-none" aria-hidden="true">
          {isCorrect ? "✅" : "🤔"}
        </span>
      ) : isCorrect ? (
        `You guessed ${guess} - that's right!`
      ) : (
        `You guessed ${guess}, but the correct answer is ${correct}.`
      )}
    </div>
  );
}
