"use client";

import { Button } from "@/components/ds/Button";
import { STAGE1_META } from "@/lib/division/stage1";
import { useStage1Form, type Stage1Committed } from "@/hooks/useStage1Form";

/** Desktop-only inline layout, same shape as stage2/3's QuestionRow: "Question" label, the two
 * number inputs, Visualize button in one row. No concept select here - stage1 only ever means
 * "share equally," there's nothing to choose between. */
export function Stage1QuestionRow({
  committed,
  onVisualize,
}: {
  committed: Stage1Committed;
  onVisualize: (next: Stage1Committed) => void;
}) {
  const { totalInput, setTotalInput, peopleInput, setPeopleInput, error, handleVisualize } = useStage1Form(
    committed,
    onVisualize,
  );

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <div className="flex items-center gap-[18px] flex-1 flex-nowrap">
          <input
            type="number"
            inputMode="numeric"
            value={totalInput}
            onChange={(e) => setTotalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={STAGE1_META.totalMin}
            max={STAGE1_META.totalMax}
            aria-label="Number of items"
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-2xl text-ink-3">÷</span>
          <input
            type="number"
            inputMode="numeric"
            value={peopleInput}
            onChange={(e) => setPeopleInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={STAGE1_META.peopleMin}
            max={STAGE1_META.peopleMax}
            aria-label="Number of people"
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <Button variant="primary" onClick={handleVisualize} className="w-[160px] shrink-0">
        Go
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
