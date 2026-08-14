import type { ReactNode } from "react";
import { FRIEND_AVATARS, type Stage2Session } from "@/lib/division/stage2";
import { Confetti } from "@/components/division/shared/Confetti";

function Dot() {
  return (
    <span className="w-5 h-5 bg-s2-row rounded-full border border-[rgba(18,136,100,0.4)] shrink-0 inline-block" />
  );
}

function NumberColumn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="font-mono text-[52px] font-semibold text-ink">{label}</div>
      <div className="flex flex-wrap gap-2 justify-center max-w-[180px] min-h-[20px]">{children}</div>
    </div>
  );
}

/** Step 8, sharing only: the final "we write it as ..." view - each number in 12 ÷ 4 = 3 sits
 * above its own visual: dots for the dividend, friend avatars for the divisor, dots for the
 * quotient (what one friend ends up with). Mirrors stage3's Stage3NotationView. */
export function Stage2NotationView({ session }: { session: Stage2Session }) {
  const { total, divisor, quotient, phase } = session;

  return (
    <div className="relative flex flex-col items-center gap-5 p-1">
      {phase === "done" && <Confetti />}
      <div className="flex items-start justify-center gap-6">
        <NumberColumn label={String(total)}>
          {Array.from({ length: total }).map((_, i) => (
            <Dot key={i} />
          ))}
        </NumberColumn>

        <div className="font-serif font-light text-4xl text-ink-3 pt-3">÷</div>

        <NumberColumn label={String(divisor)}>
          {Array.from({ length: divisor }).map((_, i) => (
            <span key={i} className="text-3xl leading-none" aria-hidden="true">
              {FRIEND_AVATARS[i % FRIEND_AVATARS.length]}
            </span>
          ))}
        </NumberColumn>

        <div className="font-serif font-light text-4xl text-ink-3 pt-3">=</div>

        <NumberColumn label={String(quotient)}>
          {Array.from({ length: quotient }).map((_, i) => (
            <Dot key={i} />
          ))}
        </NumberColumn>
      </div>
    </div>
  );
}
