import type { NarrationFragment } from "./types";

/** Same K()/Q()/T() fragment-emphasis convention as lib/subtraction/narration.ts, so NarrationBox
 * styling stays visually consistent across every stage in this app. Narration here is written for
 * the ADULT driving the session (GUIDELINES.md's audience note: educators/parents drive it, kids
 * watch) - the child's understanding has to come from the animation and annotations, never from
 * reading this text, which is exactly why the "hide text" toggle (see PlaybackContext) works
 * identically well on this stage. */
export function K(text: string): NarrationFragment {
  return { text, emphasis: "key" };
}
export function Q(text: string): NarrationFragment {
  return { text, emphasis: "quote" };
}
export function T(text: string): NarrationFragment {
  return { text };
}
