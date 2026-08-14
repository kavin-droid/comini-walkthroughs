export interface NarrationFragment {
  text: string;
  emphasis?: "key" | "quote" | "yes" | "no";
}

export function K(text: string): NarrationFragment {
  return { text, emphasis: "key" };
}
export function Q(text: string | number): NarrationFragment {
  return { text: String(text), emphasis: "quote" };
}
export function T(text: string): NarrationFragment {
  return { text };
}
export function YES(text: string): NarrationFragment {
  return { text, emphasis: "yes" };
}
export function NO(text: string): NarrationFragment {
  return { text, emphasis: "no" };
}

/** Flattens a NarrationFragment[] back into plain text - used for text-to-speech, which reads the
 * words themselves, not the visual emphasis styling. */
export function fragmentsToText(fragments: NarrationFragment[]): string {
  return fragments.map((f) => f.text).join("");
}
