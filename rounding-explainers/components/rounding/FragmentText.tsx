import type { NarrationFragment } from "@/lib/rounding/narration";

/** Shared renderer for a `NarrationFragment[]` - the "k"/"q" emphasis mapping used by both
 * NarrationBox and McqInstructionBanner, factored out so the two never drift apart. */
export function FragmentText({ fragments }: { fragments: NarrationFragment[] }) {
  return (
    <>
      {fragments.map((f, i) =>
        f.emphasis === "key" ? (
          <span key={i} className="font-semibold text-ink">
            {f.text}
          </span>
        ) : f.emphasis === "quote" ? (
          <span
            key={i}
            className="font-mono text-[0.88em] bg-card text-accent px-1.5 py-0.5 rounded border border-line"
          >
            {f.text}
          </span>
        ) : (
          <span key={i}>{f.text}</span>
        ),
      )}
    </>
  );
}

/** Plain-text flattening for the speech-synthesis "read aloud" button - the emphasis styling
 * carries no meaning once spoken, just the words themselves. */
export function fragmentsToPlainText(fragments: NarrationFragment[]): string {
  return fragments.map((f) => f.text).join("");
}
