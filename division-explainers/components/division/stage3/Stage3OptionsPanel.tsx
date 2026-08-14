"use client";

import { Button } from "@/components/ds/Button";
import { STAGE3_META } from "@/lib/division/stage3";
import { useStage3Form, type Stage3Committed } from "@/hooks/useStage3Form";
import { ProgressionDropdown } from "@/components/division/shared/ProgressionDropdown";
import { Stage3DivisorSelect } from "./Stage3DivisorSelect";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: all fields stacked in the settings bottom sheet. Desktop splits this across
 * Stage3QuestionRow (question only) + Stage3HeaderPills (concept + progression, in the header). */
export function Stage3OptionsPanel({
  committed,
  onVisualize,
  onVisualized,
}: {
  committed: Stage3Committed;
  onVisualize: (next: Stage3Committed) => void;
  onVisualized?: () => void;
}) {
  const { dividendInput, setDividendInput, divisorInput, setDivisorInput, error, handleVisualize } = useStage3Form(
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
        <div className="flex items-center gap-2.5 justify-center">
          <input
            type="number"
            inputMode="numeric"
            value={dividendInput}
            onChange={(e) => setDividendInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={STAGE3_META.dividendMin}
            max={STAGE3_META.dividendMax}
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-2xl text-ink-3">÷</span>
          <Stage3DivisorSelect value={divisorInput} onChange={setDivisorInput} />
        </div>
      </div>

      <div>
        <FieldLabel>Type</FieldLabel>
        <div className="w-full h-11 flex items-center px-3.5 rounded-xl border-2 border-line-2 bg-paper-2 text-ink-2 text-[14px] font-sans font-semibold opacity-75 cursor-not-allowed overflow-hidden text-ellipsis whitespace-nowrap">
          Tens & Ones Division
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
