export interface RenderFragment {
  text: string;
  emphasis?: "key" | "quote";
}

/** Shared fragment-to-JSX renderer for the {text, emphasis?} shape both lib/stage1/narration.ts
 * and lib/addition/narration.ts produce (structurally identical, kept as separate modules per
 * app) - used by both NarrationBox and PredictPrompt in each app so the "key"/"quote" styling
 * treatment can't drift between the two places it's rendered. */
export function NarrationFragments({ fragments }: { fragments: RenderFragment[] }) {
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
