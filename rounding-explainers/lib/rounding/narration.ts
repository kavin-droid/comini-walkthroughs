export interface NarrationFragment {
  text: string;
  emphasis?: "key" | "quote";
}

/** Ported from the vanilla apps' K()/Q() helpers, which returned raw
 * `'<span class="k">...'` / `'<span class="q">...'` HTML strings. A structured-fragment array
 * is the React-native equivalent (see skip-counting-explainers/lib/skip-counting/narration.ts,
 * the established pattern for this in this app family) - the renderer maps `emphasis` to the
 * same "k"/"q" visual treatment without ever touching dangerouslySetInnerHTML. */
export function K(text: string | number): NarrationFragment {
  return { text: String(text), emphasis: "key" };
}
export function Q(text: string | number): NarrationFragment {
  return { text: String(text), emphasis: "quote" };
}
export function T(text: string): NarrationFragment {
  return { text };
}

export function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}
