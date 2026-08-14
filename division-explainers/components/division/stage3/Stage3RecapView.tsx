import { CONTAINER_AVATARS, type Stage3Session } from "@/lib/division/stage3";
import { Block } from "./Block";

/** The full picture (step 1's layout) again, but now showing the final settled counts - a
 * dedicated view rather than reusing Stage3MainScene, since MainScene's tens pool doesn't know
 * about unpacking (it would otherwise show the already-unpacked leftover tens as still sitting
 * in the tens column). */
export function Stage3RecapView({ session }: { session: Stage3Session }) {
  const { divisor, tensContainerCounts, onesSharedRounds, remainder } = session;

  return (
    <div className="flex flex-col items-center gap-4 p-1 w-full">
      <div className="flex flex-wrap gap-4 justify-center items-start">
        {Array.from({ length: divisor }).map((_, c) => {
          const tensCount = tensContainerCounts[c];
          const total = tensCount * 10 + onesSharedRounds;
          return (
            <div
              key={c}
              className="flex flex-col items-center gap-2.5 pt-4 px-4 pb-3 rounded-xl min-w-[96px] border-[1.5px] border-dashed bg-left-bg border-left"
              style={{ animation: "fade-in-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both", animationDelay: `${c * 60}ms` }}
            >
              <div className="text-5xl leading-none" aria-hidden="true">
                {CONTAINER_AVATARS[c % CONTAINER_AVATARS.length]}
              </div>
              <span className="sr-only">Friend {c + 1}</span>
              {/* Tens and ones never share a flex-wrap row. */}
              <div className="flex flex-col items-center gap-2 min-h-[30px] max-w-[180px]">
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from({ length: tensCount }).map((_, i) => (
                    <Block key={`t${i}`} kind="tens" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from({ length: onesSharedRounds }).map((_, i) => (
                    <Block key={`o${i}`} kind="ones" />
                  ))}
                </div>
              </div>
              <div className="font-mono text-[13px] font-bold text-left bg-card px-3 py-1 rounded-full border border-line">
                {total}
              </div>
            </div>
          );
        })}
        {/* The leftover that couldn't be shared - its own card, red, so the full picture doesn't
            silently drop it (previously this view had no remainder indicator at all). */}
        {remainder > 0 && (
          <div
            className="flex flex-col items-center gap-2.5 pt-4 px-4 pb-3 rounded-xl min-w-[96px] border-[1.5px] border-dashed bg-s3-leftover-bg border-s3-leftover"
            style={{ animation: "fade-in-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both", animationDelay: `${divisor * 60}ms` }}
          >
            <div className="font-mono text-[13px] tracking-[1.5px] uppercase text-s3-leftover">Remainder</div>
            <div className="flex flex-wrap gap-2 justify-center max-w-[180px] min-h-[20px]">
              {Array.from({ length: remainder }).map((_, i) => (
                <Block key={i} kind="ones" highlight="leftover" />
              ))}
            </div>
            <div className="font-mono text-[13px] font-bold text-s3-leftover bg-card px-3 py-1 rounded-full border border-line">
              {remainder}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
