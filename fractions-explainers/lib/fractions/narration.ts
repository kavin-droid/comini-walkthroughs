import type { AnswerPart, Fragment } from "./types";

/** Plain narration text, no emphasis - the default `.narration-box p` text run. */
export function t(text: string): Fragment {
  return { text };
}

/** Bold key-term emphasis, matches vanilla's K() helper (`<span class="k">`). */
export function k(text: string): Fragment {
  return { text, emphasis: "key" };
}

/** Monospace quoted-expression emphasis, matches vanilla's Q() helper (`<span class="q">`). */
export function q(text: string): Fragment {
  return { text, emphasis: "quote" };
}

export function placeholderAnswer(prefix: string): AnswerPart[] {
  return [{ text: prefix }, { text: "?", kind: "ph" }];
}

export function revealedAnswer(prefix: string, value: string): AnswerPart[] {
  return [{ text: prefix }, { text: value, kind: "new" }];
}
