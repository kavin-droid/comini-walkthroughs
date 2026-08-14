"use client";

import { Callout, type CalloutPiece } from "./Callout";

/** Ported 1:1 from the vanilla apps' buildExpandedHtml(): each part, "+", and the total fade in
 * 180ms (stage 2) / 160ms (stage 3) apart. Shared by both stages since the pattern is identical -
 * only the number of parts (2 vs 3) and the stagger step differ. */
export function ExpandedCallout({
  parts,
  total,
  stepMs,
}: {
  parts: number[];
  total: number;
  stepMs: number;
}) {
  let delay = 0;
  const pieces: CalloutPiece[] = [];

  parts.forEach((part, i) => {
    if (i > 0) {
      pieces.push({ key: `op-${i}`, text: "+", delayMs: delay, muted: true });
      delay += stepMs;
    }
    pieces.push({ key: `part-${i}`, text: String(part), delayMs: delay, strong: true });
    delay += stepMs;
  });

  pieces.push({ key: "eq", text: "=", delayMs: delay, muted: true });
  delay += stepMs;
  pieces.push({ key: "total", text: String(total), delayMs: delay, strong: true });

  return <Callout pieces={pieces} numeric />;
}
