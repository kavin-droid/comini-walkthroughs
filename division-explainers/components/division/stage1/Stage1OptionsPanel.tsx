"use client";

import { Button } from "@/components/ds/Button";
import { STAGE1_META } from "@/lib/division/stage1";
import { useStage1Form, type Stage1Committed } from "@/hooks/useStage1Form";
import { ProgressionDropdown } from "@/components/division/shared/ProgressionDropdown";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: all fields stacked in the settings bottom sheet, matching stage2/3's
 * Stage2OptionsPanel/Stage3OptionsPanel shape - just without a concept select, since stage1 has
 * nothing to choose. */
export function Stage1OptionsPanel({
  committed,
  onVisualize,
  onVisualized,
}: {
  committed: Stage1Committed;
  onVisualize: (next: Stage1Committed) => void;
  onVisualized?: () => void;
}) {
  const { totalInput, setTotalInput, peopleInput, setPeopleInput, error, handleVisualize } = useStage1Form(
    committed,
    (next) => {
      onVisualize(next);
      onVisualized?.();
    },
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <div className="flex flex-col items-center gap-1">
            <label htmlFor="s1-total" className="sr-only">
              Number of items
            </label>
            <input
              id="s1-total"
              type="number"
              inputMode="numeric"
              value={totalInput}
              onChange={(e) => setTotalInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
              min={STAGE1_META.totalMin}
              max={STAGE1_META.totalMax}
              className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
            />
          </div>
          <span className="font-serif font-light text-2xl text-ink-3">÷</span>
          <div className="flex flex-col items-center gap-1">
            <label htmlFor="s1-people" className="sr-only">
              Number of people
            </label>
            <input
              id="s1-people"
              type="number"
              inputMode="numeric"
              value={peopleInput}
              onChange={(e) => setPeopleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
              min={STAGE1_META.peopleMin}
              max={STAGE1_META.peopleMax}
              className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Stage</FieldLabel>
        <ProgressionDropdown />
      </div>

      {error && <p className="text-accent text-[13px] text-center">{error}</p>}

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Go
      </Button>
    </div>
  );
}
