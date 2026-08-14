"use client";

import { cn } from "@/lib/utils";

/** Ported from the vanilla stage3 app's `.roundto-toggle`/`.roundto-btn` pill switch. Stage2
 * never renders this - it shows the static "≈ nearest ten" label instead (see QuestionRow /
 * OptionsPanel, gated on `config.roundToOptions.length > 1`). */
export function RoundToToggle({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1 bg-paper-2 p-1 rounded-full border-[1.5px] border-line-2 h-11 items-center">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "font-mono text-[13px] font-bold px-4 h-9 rounded-full border-none transition-colors cursor-pointer",
            opt === value ? "bg-ink text-card" : "bg-transparent text-ink-2 hover:text-ink",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
