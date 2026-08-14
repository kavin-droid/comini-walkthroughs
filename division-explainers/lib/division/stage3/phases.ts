import type { Stage3Phase } from "./types";

/** Full ordered phase list, used only for the mobile progress bar's segment count/position -
 * some phases (share-tens, unpack-intro, unpack) are skipped at runtime when there's nothing to
 * place/unpack, which just shows as a slightly-early jump in the bar - harmless. */
export const STAGE3_PHASES: Stage3Phase[] = [
  "numerals",
  "intro",
  "reveal-friends",
  "focus-tens",
  "predict-tens",
  "count-tens",
  "share-tens",
  "count-leftover",
  "unpack-intro",
  "unpack",
  "focus-ones",
  "predict-ones",
  "count-ones",
  "share-ones",
  "remainder",
  "recap",
  "notation",
  "done",
];
