"use client";

import { useVisualizeForm } from "@/hooks/useVisualizeForm";
import { Button } from "@/components/ds/Button";
import { QuestionFields } from "./QuestionFields";

/** Desktop-only inline layout matching the vanilla app-shell spec: the "Question" sentence and
 * the Visualize button sit in a single row (Concept/age-band live in the header instead, see
 * HeaderPills). */
export function QuestionRow() {
  const form = useVisualizeForm();
  const { error, handleVisualize } = form;

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <QuestionFields form={form} inputBg="bg-paper" />
      </div>
      <Button variant="primary" onClick={handleVisualize} className="w-[160px] shrink-0">
        Visualize
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
