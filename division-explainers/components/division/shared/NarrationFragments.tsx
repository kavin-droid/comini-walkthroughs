import type { NarrationFragment } from "@/lib/division/types";
import { cn } from "@/lib/utils";

/** Renders a NarrationFragment[] as styled inline spans - factored out of NarrationBox so the same
 * key/quote/yes/no emphasis styling can be reused somewhere that ISN'T the hideable narration
 * panel, e.g. an MCQ's own prompt line, which should stay legible even with hideText on since the
 * question itself (not just the flavor narration) is essential, not decorative. */
export function NarrationFragments({ fragments }: { fragments: NarrationFragment[] }) {
  return (
    <>
      {fragments.map((f, i) =>
        f.emphasis === "key" ? (
          <span key={i} className="font-semibold text-ink">
            {f.text}
          </span>
        ) : f.emphasis === "quote" ? (
          <span key={i} className="font-mono text-[0.88em] bg-card text-accent px-1.5 py-0.5 rounded border border-line">
            {f.text}
          </span>
        ) : f.emphasis === "yes" || f.emphasis === "no" ? (
          <span key={i} className={cn("font-semibold", f.emphasis === "yes" ? "text-left" : "text-used")}>
            {f.text}
          </span>
        ) : (
          <span key={i}>{f.text}</span>
        ),
      )}
    </>
  );
}
