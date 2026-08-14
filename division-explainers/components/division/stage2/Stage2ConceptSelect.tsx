import { cn } from "@/lib/utils";
import type { Stage2Concept } from "@/lib/division/stage2";

export function Stage2ConceptSelect({
  value,
  onChange,
  compact,
}: {
  value: Stage2Concept;
  onChange: (v: Stage2Concept) => void;
  compact?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Stage2Concept)}
      className={cn(
        "border-2 border-line-2 bg-card text-ink font-sans font-semibold cursor-pointer transition-colors focus:outline-none focus:border-accent",
        compact
          ? "h-8 px-3 rounded-full text-[12px] max-w-[140px]"
          : "w-full h-11 px-3.5 rounded-xl text-[14px]",
      )}
    >
      <option value="sharing">Sharing (how many does each friend get?)</option>
      <option value="grouping">Grouping (how many friends can we serve?)</option>
    </select>
  );
}
