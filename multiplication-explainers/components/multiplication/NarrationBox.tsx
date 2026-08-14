"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ds/IconButton";
import { useMultiplication } from "./MultiplicationContext";
import { useTextVisibility } from "./TextVisibilityContext";

/** "Yes"/"No" read better capitalized than the raw option values ("yes"/"no") used as dispatch
 * payloads; any other value (a numeric MCQ pick) is already display-ready as-is. */
function displayValue(value: string): string {
  return value === "yes" ? "Yes" : value === "no" ? "No" : value;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function NarrationBox() {
  const { step, session } = useMultiplication();
  const { hideText } = useTextVisibility();
  const feedback = step.feedback;
  const picked = feedback ? session.answers[feedback.questionId] : undefined;
  const showFeedback = !!feedback && picked !== undefined;
  const isCorrect = showFeedback && picked === feedback.correctValue;
  // The step's own explanation doubles as the MCQ prompt (see StepQuestion) - a child who can't
  // read still needs to hear/see what's being asked, so a question step's text is exempt from the
  // hide-text toggle. Plain narration (no question attached) still hides entirely, same as before.
  const isQuestion = !!step.question;

  if (hideText && !isQuestion) return null;

  const narrationText = step.explanation.map((f) => f.text).join("");

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px]">
      <div className="flex items-start gap-2">
        <IconButton
          aria-label="Read text aloud"
          size={28}
          className="shrink-0 mt-[1px]"
          onClick={() => speak(narrationText)}
        >
          <Volume2 size={14} />
        </IconButton>
        <p className="font-serif text-[16px] leading-snug text-ink">
          {step.explanation.map((f, i) =>
            f.emphasis === "key" ? (
              <span key={i} className="font-semibold text-ink">
                {f.text}
              </span>
            ) : f.emphasis === "quote" ? (
              <span
                key={i}
                className="font-mono text-[0.88em] bg-card text-accent px-1.5 py-0.5 rounded border border-line"
              >
                {f.text}
              </span>
            ) : (
              <span key={i}>{f.text}</span>
            ),
          )}
        </p>
      </div>
      {showFeedback && !hideText && (
        <motion.p
          key={feedback.questionId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: (feedback.feedbackDelayMs ?? 1600) / 1000 }}
          className={cn("font-mono text-[13px] font-semibold mt-1.5 pl-[36px]", isCorrect ? "text-row" : "text-accent")}
        >
          {isCorrect
            ? `You said ${displayValue(picked!)} - nice, that's right!`
            : `You said ${displayValue(picked!)} - it's actually ${displayValue(feedback.correctValue)}.`}
        </motion.p>
      )}
    </div>
  );
}
