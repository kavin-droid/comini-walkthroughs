"use client";

import { plural } from "@/lib/place-value/narration";
import { Callout, type CalloutPiece } from "./Callout";

/** Ported from the vanilla stage2 app's buildDecomposeHtml(tens, ones, total): "N = x tens + y
 * ones", staggered 180ms per piece - the ones piece always uses the same "+ N ones" numeral
 * pattern, including when ones is 0, rather than switching to a prose sentence for that case. */
export function DecomposeCallout2({
  tens,
  ones,
  total,
}: {
  tens: number;
  ones: number;
  total: number;
}) {
  const step = 180;
  let delay = 0;
  const pieces: CalloutPiece[] = [{ key: "lead", text: `${total} =`, delayMs: 0, instant: true }];

  pieces.push({ key: "tens", text: `${tens} ${plural(tens, "ten")}`, delayMs: delay, strong: true });
  delay += step;

  pieces.push({ key: "op", text: "+", delayMs: delay, muted: true });
  delay += step;
  pieces.push({ key: "ones", text: `${ones} ${plural(ones, "one")}`, delayMs: delay, strong: true });

  return <Callout pieces={pieces} />;
}
