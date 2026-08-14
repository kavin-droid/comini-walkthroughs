import { cn } from "@/lib/utils";

/** The equation, shown large and connected directly to whichever visual is currently being built -
 * highlighting the total while dots fade in, then the people count while friends fade in, is what
 * actually ties the abstract numbers to the concrete pile/trays for a pre-reader (previously the
 * numbers only lived in the header AnswerCard, entirely disconnected from the workarea). */
export function Stage1Equation({
  total,
  people,
  highlight,
}: {
  total: number;
  people: number;
  highlight: "total" | "people" | null;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className={cn(
          "font-mono text-[44px] font-semibold rounded-xl px-3 py-1 transition-colors duration-300",
          highlight === "total" ? "bg-s1-glow-bg text-s1-glow" : "text-ink",
        )}
      >
        {total}
      </span>
      <span className="font-serif font-light text-3xl text-ink-3">÷</span>
      <span
        className={cn(
          "font-mono text-[44px] font-semibold rounded-xl px-3 py-1 transition-colors duration-300",
          highlight === "people" ? "bg-s1-person-bg text-s1-person" : "text-ink",
        )}
      >
        {people}
      </span>
    </div>
  );
}
