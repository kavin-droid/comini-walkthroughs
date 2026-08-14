"use client";

import { plural } from "@/lib/place-value/narration";
import { Callout, type CalloutPiece } from "./Callout";

/** Ported 1:1 from the vanilla stage3 app's buildDecomposeHtml(hundreds, tens, ones, total):
 * "N = a hundreds + b tens + c ones", staggered 160ms per piece - unlike stage 2, always shows
 * all three terms (no zero-ones special case). */
export function DecomposeCallout3({
  hundreds,
  tens,
  ones,
  total,
}: {
  hundreds: number;
  tens: number;
  ones: number;
  total: number;
}) {
  const step = 160;
  let delay = 0;
  const pieces: CalloutPiece[] = [{ key: "lead", text: `${total} =`, delayMs: 0, instant: true }];

  pieces.push({
    key: "hundreds",
    text: `${hundreds} ${plural(hundreds, "hundred")}`,
    delayMs: delay,
    strong: true,
  });
  delay += step;
  pieces.push({ key: "op1", text: "+", delayMs: delay, muted: true });
  delay += step;
  pieces.push({ key: "tens", text: `${tens} ${plural(tens, "ten")}`, delayMs: delay, strong: true });
  delay += step;
  pieces.push({ key: "op2", text: "+", delayMs: delay, muted: true });
  delay += step;
  pieces.push({ key: "ones", text: `${ones} ${plural(ones, "one")}`, delayMs: delay, strong: true });

  return <Callout pieces={pieces} />;
}
