import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FRIEND_AVATARS, type Stage2Session } from "@/lib/division/stage2";
import { LiveCounter } from "@/components/division/shared/LiveCounter";
import { MotionItem, GhostSlot } from "./MotionItem";

function containerCount(session: Stage2Session, containerIndex: number): number {
  let n = 0;
  for (let i = 0; i < session.dotsPlaced; i++) if (session.placements[i] === containerIndex) n++;
  return n;
}

function FriendBucket({ index, count, dotIds }: { index: number; count: number; dotIds: number[] }) {
  return (
    <div
      className="flex flex-col items-center gap-2 pt-3.5 px-3.5 pb-2.5 rounded-xl min-w-[76px] bg-s2-group-bg border-[1.5px] border-dashed border-s2-group"
      style={{ animation: "fade-in-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <div className="text-4xl leading-none" aria-hidden="true">
        {FRIEND_AVATARS[index % FRIEND_AVATARS.length]}
      </div>
      <span className="sr-only">Friend {index + 1}</span>
      <div className="flex flex-wrap gap-1 justify-center max-w-[120px] min-h-[20px]">
        {dotIds.map((id) => (
          <MotionItem key={id} id={id} />
        ))}
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
  const { predicted, quotient } = session;
  if (predicted === null) return null;
  const correct = predicted === quotient;
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
        `You guessed ${predicted}, but each friend gets ${quotient}.`
      )}
    </div>
  );
}

/** Sharing's unified workspace, from "count the dividend" all the way through feedback and the
 * "bring the equation back" reveal - one continuous scene, not a chain of visually distinct
 * components, so dots (and later friends) persist across every phase transition via Framer's
 * shared layoutId instead of popping between different layouts. The dots are always the same
 * MotionItem/GhostSlot pair used everywhere else in stage2 - one constant color, never
 * recolored/highlighted, through the whole flow. Notation/done still get their own dedicated
 * view (the final per-numeral breakdown doesn't fit this "pile + friends" shape). */
export function Stage2SharingScene({ session, hideText }: { session: Stage2Session; hideText: boolean }) {
  const { total, divisor, phase, previewCount, dotsPlaced } = session;

  const isDividendCount = phase === "reveal-dividend";
  const isDivisorCount = phase === "reveal-divisor";
  // Friends are introduced starting reveal-divisor and stay visible for the rest of the flow.
  const showFriends = !isDividendCount;
  const friendCount = isDivisorCount ? previewCount : divisor;

  return (
    <div className="flex flex-col items-center gap-6 p-1 w-full">
      {/* The dot pile - always the same MotionItem ids as the buckets below, so dots genuinely
          travel (FLIP), not pop, as they move out of the pile. Chunked into groups of 5, each
          group laid out as its OWN row of 5 (not stacked into columns) - [][][][][]  [][][][][] -
          so a group reads as one countable unit at a glance; the outer flex-wrap lets multiple
          groups sit side by side and wrap to the next line once they run out of room. */}
      <div className="flex flex-wrap gap-4 justify-center max-w-[440px] min-h-[20px]">
        {Array.from({ length: Math.ceil(total / 5) }).map((_, g) => {
          const chunk = Array.from({ length: 5 }).map((_, j) => {
            const i = g * 5 + j;
            if (i >= total) return null;
            if (isDividendCount) return i < previewCount ? <MotionItem key={i} id={i} /> : null;
            return i < dotsPlaced ? <GhostSlot key={i} /> : <MotionItem key={i} id={i} />;
          });
          if (chunk.every((d) => d === null)) return null;
          return (
            <div key={g} className="grid gap-2 justify-items-center" style={{ gridTemplateColumns: "repeat(5, min-content)" }}>
              {chunk}
            </div>
          );
        })}
      </div>
      <LiveCounter show={isDividendCount && previewCount < total} count={previewCount} colorClass="text-s2-item bg-s2-item-bg border-[rgba(201,127,15,0.3)]" />

      <AnimatePresence>
        {showFriends && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex flex-wrap gap-4 justify-center items-start">
              {Array.from({ length: friendCount }).map((_, c) => {
                const count = containerCount(session, c);
                const dotIds = session.placements
                  .map((container, i) => ({ container, i }))
                  .filter(({ container, i }) => container === c && i < dotsPlaced)
                  .map(({ i }) => i);
                return <FriendBucket key={c} index={c} count={count} dotIds={dotIds} />;
              })}
            </div>
            <LiveCounter show={isDivisorCount && previewCount < divisor} count={previewCount} colorClass="text-s2-group bg-s2-group-bg border-[rgba(107,95,204,0.3)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "feedback" && <PredictionFeedback session={session} hideText={hideText} />}
    </div>
  );
}
