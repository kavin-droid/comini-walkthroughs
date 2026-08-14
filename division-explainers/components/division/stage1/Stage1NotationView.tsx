import type { ReactNode } from "react";
import { PERSON_AVATARS, type Stage1Session } from "@/lib/division/stage1";
import { Confetti } from "@/components/division/shared/Confetti";
import { CANDY_COLORS } from "./canvas";

function Candy({ id }: { id: number }) {
  const color = CANDY_COLORS[id % CANDY_COLORS.length];
  return (
    <span
      className="inline-block rounded-full border-2 shrink-0"
      style={{
        width: 22,
        height: 22,
        background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${color} 60%, white), ${color})`,
        borderColor: "rgba(0,0,0,0.12)",
      }}
      aria-hidden="true"
    />
  );
}

function NumberColumn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="font-mono text-[48px] font-semibold text-ink">{label}</div>
      <div className="flex flex-wrap gap-2 justify-center max-w-[160px] min-h-[24px]">{children}</div>
    </div>
  );
}

/** Step 6, the "we write it as ..." payoff: each number in 10 ÷ 2 = 5 sits above its own visual -
 * candies for the total, faces for the people, candies again for what one person gets. Mirrors
 * stage2's Stage2NotationView/stage3's Stage3NotationView - always a fresh static illustration,
 * not a continuation of the interactive board (same precedent both those stages already set). */
export function Stage1NotationView({ session }: { session: Stage1Session }) {
  const { total, people, quotient, phase } = session;

  return (
    <div className="relative flex flex-col items-center gap-5 p-1">
      {phase === "done" && <Confetti />}
      <div className="flex items-start justify-center gap-5">
        <NumberColumn label={String(total)}>
          {Array.from({ length: total }).map((_, i) => (
            <Candy key={i} id={i} />
          ))}
        </NumberColumn>

        <div className="font-serif font-light text-4xl text-ink-3 pt-3">÷</div>

        <NumberColumn label={String(people)}>
          {Array.from({ length: people }).map((_, i) => (
            <span key={i} className="text-3xl leading-none" aria-hidden="true">
              {PERSON_AVATARS[i % PERSON_AVATARS.length]}
            </span>
          ))}
        </NumberColumn>

        <div className="font-serif font-light text-4xl text-ink-3 pt-3">=</div>

        <NumberColumn label={String(quotient)}>
          {Array.from({ length: quotient }).map((_, i) => (
            <Candy key={i} id={i} />
          ))}
        </NumberColumn>
      </div>
    </div>
  );
}
