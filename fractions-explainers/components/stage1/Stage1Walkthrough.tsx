"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/fractions/AppShell";
import { Stage1Header } from "./Stage1Header";
import { Stage1Footer } from "./Stage1Footer";
import { Stage1ProgressDots } from "./Stage1ProgressDots";
import { Stage1NarrationBox } from "./Stage1NarrationBox";
import { Mcq } from "./Mcq";
import { TextVisibilityProvider } from "@/components/shared/TextVisibilityContext";
import { BarWholeIntro } from "./BarWholeIntro";
import { BarSplitInteractive } from "./BarSplitInteractive";
import { CompareWholeHalfMcq } from "./CompareWholeHalfMcq";
import { JarWholeDemo } from "./JarWholeDemo";
import { JarHalfDemo } from "./JarHalfDemo";
import { JarFillHalf } from "./JarFillHalf";
import { PizzaWholeIntro } from "./PizzaWholeIntro";
import { PizzaCutHalf } from "./PizzaCutHalf";
import { RecapWhole } from "./RecapWhole";
import { RecapHalf } from "./RecapHalf";
import { FinalRecap } from "./FinalRecap";
import { STAGE1_STEPS, type Stage1StepKind } from "@/lib/stage1/scenes";

function StepContent({
  kind,
  onSolved,
  onMcqReady,
}: {
  kind: Stage1StepKind;
  onSolved: () => void;
  onMcqReady: (correct: "Whole" | "Half") => void;
}) {
  switch (kind) {
    case "barWholeIntro":
      return <BarWholeIntro onSolved={onSolved} />;
    case "barFreeSplit":
      return <BarSplitInteractive onSolved={onSolved} />;
    case "barCompareMcq":
      return <CompareWholeHalfMcq shape="bar" onMcqReady={onMcqReady} />;
    case "jarWholeDemo":
      return <JarWholeDemo onSolved={onSolved} />;
    case "jarHalfDemo":
      return <JarHalfDemo onSolved={onSolved} />;
    case "jarFillHalf":
      return <JarFillHalf onSolved={onSolved} />;
    case "pizzaWholeIntro":
      return <PizzaWholeIntro onSolved={onSolved} />;
    case "pizzaFreeCut":
      return <PizzaCutHalf onSolved={onSolved} />;
    case "pizzaCompareMcq":
      return <CompareWholeHalfMcq shape="pizza" onMcqReady={onMcqReady} />;
    case "recapWhole":
      return <RecapWhole onSolved={onSolved} />;
    case "recapHalf":
      return <RecapHalf onSolved={onSolved} />;
    case "finalRecap":
      return <FinalRecap onSolved={onSolved} />;
  }
}

function WalkthroughInner() {
  const [stepIdx, setStepIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [mcqCorrect, setMcqCorrect] = useState<"Whole" | "Half" | null>(null);

  const kind = STAGE1_STEPS[stepIdx];
  const atStart = stepIdx === 0;
  const atEnd = stepIdx === STAGE1_STEPS.length - 1;

  function goNext() {
    if (atEnd) {
      if (solved) window.location.href = "/";
      return;
    }
    setStepIdx((i) => i + 1);
    setSolved(false);
    setMcqCorrect(null);
  }

  function goBack() {
    if (atStart) return;
    setStepIdx((i) => i - 1);
    setSolved(false);
    setMcqCorrect(null);
  }

  return (
    <AppShell>
      <Stage1Header />
      <Stage1ProgressDots index={stepIdx} total={STAGE1_STEPS.length} />
      <main className="relative flex-1 min-h-0 flex items-center justify-center px-4 overflow-hidden">
        {/* No `mode="wait"` - see the note in the previous version of this file (kept via git
         * history/memory): gating the new step's mount on the old one's exit-animation-complete
         * callback risks a permanent stall if that callback ever fails to fire (a backgrounded or
         * throttled tab). Mounting immediately and letting the old step fade out independently
         * avoids that failure mode. */}
        <AnimatePresence>
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center px-4"
          >
            <StepContent kind={kind} onSolved={() => setSolved(true)} onMcqReady={setMcqCorrect} />
          </motion.div>
        </AnimatePresence>
      </main>
      <Stage1NarrationBox kind={kind} />
      {/* The compare-and-check steps' Mcq lives here rather than inside the workarea - answer
       * controls always sit in this one place, below the instruction text, regardless of which
       * step produced them (see CompareWholeHalfMcq's onMcqReady note). */}
      {mcqCorrect && (
        <div className="shrink-0 flex justify-center pb-3">
          <Mcq correct={mcqCorrect} onSolved={() => setSolved(true)} />
        </div>
      )}
      <Stage1Footer atStart={atStart} nextReady={solved} onBack={goBack} onNext={goNext} />
    </AppShell>
  );
}

/** No text-driven session model here (contrast lib/fractions/session.ts) - there is nothing to
 * configure, so the whole walkthrough is just "which of the eleven fixed steps is showing" plus
 * whether the child has completed it yet. Each step resets itself for free on remount (see the
 * `key={stepIdx}` above), so there is no per-step state to track beyond that - except the
 * hide-text preference, which deliberately lives above this remount boundary (via the shared
 * TextVisibilityProvider) so toggling it doesn't reset wherever the child currently is. */
export function Stage1Walkthrough() {
  return (
    <TextVisibilityProvider>
      <WalkthroughInner />
    </TextVisibilityProvider>
  );
}
