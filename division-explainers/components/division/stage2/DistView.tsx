import { cn } from "@/lib/utils";
import { FRIEND_AVATARS, type Stage2Session } from "@/lib/division/stage2";
import { Confetti } from "@/components/division/shared/Confetti";
import { LiveCounter } from "@/components/division/shared/LiveCounter";
import { GhostSlot, MotionItem } from "./MotionItem";

function containerCount(session: Stage2Session, containerIndex: number): number {
  let n = 0;
  for (let i = 0; i < session.dotsPlaced; i++) if (session.placements[i] === containerIndex) n++;
  return n;
}

function Bucket({
  label,
  emoji,
  count,
  pending,
  dotIds,
}: {
  label: string;
  emoji: string;
  count: number;
  pending: boolean;
  dotIds: number[];
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 pt-3.5 px-3.5 pb-2.5 rounded-xl min-w-[76px] relative",
        "before:content-[''] before:absolute before:-top-1.5 before:left-2 before:right-2 before:h-1 before:rounded-t",
        pending
          ? "bg-paper-2 border-[1.5px] border-dashed border-line-2 opacity-50 before:bg-line-2 before:opacity-40"
          : "bg-s2-group-bg border-[1.5px] border-dashed border-s2-group before:bg-s2-group before:opacity-25",
      )}
      style={{ animation: "fade-in-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <div className="text-4xl leading-none" aria-hidden="true">
        {emoji}
      </div>
      <span className="sr-only">{label}</span>
      <div className="flex flex-wrap gap-1.5 justify-center max-w-[120px] min-h-[20px]">
        {count > 0 ? (
          dotIds.map((id) => <MotionItem key={id} id={id} />)
        ) : (
          <div className="font-mono text-[14px] text-ink-3 py-1 px-0.5">?</div>
        )}
      </div>
      <div className="font-mono text-[13px] font-bold text-s2-group bg-card px-2.5 py-1 rounded-full border border-line">
        {count}
      </div>
    </div>
  );
}

/** With hideText, the sentence swaps for a plain icon in the same colored badge - the shape and
 * color already say "right" vs "not quite" without needing a word read. */
function PredictionFeedback({ session, hideText }: { session: Stage2Session; hideText: boolean }) {
  const { predicted, quotient, concept } = session;
  if (predicted === null) return null;
  const correct = predicted === quotient;
  const wrongGuessText =
    concept === "sharing"
      ? `You guessed ${predicted}, but each friend gets ${quotient}.`
      : `You guessed ${predicted}, but we can serve ${quotient} friends.`;
  return (
    <div
      className={cn(
        "text-center text-[13px] font-sans font-semibold py-2 px-4 rounded-xl border",
        correct ? "bg-left-bg border-left text-left" : "bg-paper-2 border-line-2 text-ink-2",
      )}
      style={{ animation: "fade-in-up 0.35s ease" }}
    >
      {hideText ? (
        <span className="text-xl leading-none" aria-hidden="true">
          {correct ? "✅" : "🤔"}
        </span>
      ) : correct ? (
        `You guessed ${predicted} - that's right!`
      ) : (
        wrongGuessText
      )}
    </div>
  );
}

export function DistView({ session, hideText }: { session: Stage2Session; hideText: boolean }) {
  const { total, divisor, concept, dotsPlaced, phase, previewCount } = session;
  const isDividendCount = phase === "reveal-dividend";
  const isDivisorReveal = phase === "reveal-divisor";
  const pileRemaining = total - (isDividendCount ? previewCount : dotsPlaced);
  const isSharing = concept === "sharing";

  // Grouping only knows its container count is the quotient once distribution has run - before
  // that, reveal-divisor/round1 show exactly one friend (a demo of what a full group looks like)
  // while distribute grows further containers as each group completes.
  const containersToShow = isSharing
    ? divisor
    : isDivisorReveal || phase === "round1" || phase === "predict"
      ? 1
      : dotsPlaced === 0
        ? 0
        : Math.ceil(dotsPlaced / divisor);

  return (
    <div className="relative flex flex-col items-center gap-4 p-1">
      {phase === "done" && <Confetti />}

      <div
        className={cn(
          "flex flex-col items-center gap-2 py-3.5 px-6 rounded-xl min-w-[170px] border-[1.5px] border-dashed transition-colors",
          pileRemaining === 0 ? "border-left bg-left-bg" : "border-line-2 bg-paper-2",
        )}
      >
        {/* Chunked into groups of 5, each group laid out as its own row of 5 (not stacked into
            columns) - [][][][][]  [][][][][] - same layout as Stage2SharingScene's pile, so a
            group is countable as one unit at a glance. */}
        <div className="flex flex-wrap gap-3 justify-center max-w-[340px] min-h-[20px]">
          {Array.from({ length: Math.ceil(total / 5) }).map((_, g) => {
            const chunk = Array.from({ length: 5 }).map((_, j) => {
              const i = g * 5 + j;
              if (i >= total) return null;
              if (isDividendCount) return i < previewCount ? <MotionItem key={i} id={i} /> : null;
              return i < dotsPlaced ? <GhostSlot key={i} /> : <MotionItem key={i} id={i} />;
            });
            if (chunk.every((d) => d === null)) return null;
            return (
              <div key={g} className="grid gap-1.5 justify-items-center" style={{ gridTemplateColumns: "repeat(5, min-content)" }}>
                {chunk}
              </div>
            );
          })}
        </div>
        <LiveCounter
          show={isDividendCount && previewCount < total}
          count={previewCount}
          colorClass="text-s2-item bg-s2-item-bg border-[rgba(201,127,15,0.3)]"
        />
      </div>

      <div className="flex flex-wrap gap-4 justify-center items-start">
        {containersToShow === 0 ? (
          <div className="font-serif italic text-[15px] text-ink-3 p-2 max-w-[240px] text-center">
            Let&apos;s start sharing!
          </div>
        ) : (
          Array.from({ length: containersToShow }).map((_, c) => {
            const count = containerCount(session, c);
            const dotIds = session.placements
              .map((container, i) => ({ container, i }))
              .filter(({ container, i }) => container === c && i < dotsPlaced)
              .map(({ i }) => i);
            return (
              <div key={c} style={{ animationDelay: `${c * 40}ms` }}>
                <Bucket
                  label={`Friend ${c + 1}`}
                  emoji={FRIEND_AVATARS[c % FRIEND_AVATARS.length]}
                  count={count}
                  pending={count === 0}
                  dotIds={dotIds}
                />
              </div>
            );
          })
        )}
      </div>

      {phase === "feedback" && <PredictionFeedback session={session} hideText={hideText} />}
    </div>
  );
}
