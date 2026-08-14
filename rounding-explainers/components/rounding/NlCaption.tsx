"use client";

import type { NarrationFragment } from "@/lib/rounding/narration";

/** Ported from `.nl-caption` - a small italic pill shown above the number line stage in the
 * line/hop/done views (the closer view never renders one, matching vanilla's `renderCloser`
 * which never builds a `.nl-caption`).
 *
 * NOTE: the vanilla CSS defines a `.nl-caption strong` rule, but the vanilla JS never actually
 * emits a `<strong>` inside a caption (captions use the `Q()`/K() helpers, which emit
 * `<span class="q">`/`<span class="k">` - and there is no `.nl-caption .q`/`.nl-caption .k` CSS
 * rule anywhere, only `.narration-box .q` and `.mcq-prompt .q`). So in the real vanilla app,
 * every caption renders as plain, unstyled text with zero color/weight emphasis, regardless of
 * which fragments carry `emphasis`. Ported faithfully (not "fixed"): fragments are joined as
 * plain text here too. */
export function NlCaption({ fragments }: { fragments: NarrationFragment[] }) {
  return (
    <div className="font-serif text-[15px] italic text-ink text-center px-3.5 py-2 bg-above-bg rounded-xl border border-above/20 max-w-[340px]">
      {fragments.map((f) => f.text).join("")}
    </div>
  );
}
