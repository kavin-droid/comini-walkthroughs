import type { Fragment } from "./types";

export function plain(text: string): Fragment {
  return { text };
}

export function K(text: string): Fragment {
  return { text, emphasis: "key" };
}

export function Q(value: number | string): Fragment {
  return { text: String(value), emphasis: "quote" };
}

/** Flattens a mix of raw strings, single fragments, and fragment arrays into one Fragment[] -
 * lets step-generation code read close to the vanilla's original string-concatenation shape
 * instead of manual array pushes at every '+'. */
export function build(...parts: (string | Fragment | Fragment[])[]): Fragment[] {
  const out: Fragment[] = [];
  for (const p of parts) {
    if (typeof p === "string") out.push(plain(p));
    else if (Array.isArray(p)) out.push(...p);
    else out.push(p);
  }
  return out;
}

/** Ported from the vanilla apps' joinAnd(): joins with a separator, no special last-item case. */
export function joinFrag(parts: Fragment[][], sep: string): Fragment[] {
  const out: Fragment[] = [];
  parts.forEach((p, i) => {
    if (i > 0) out.push(plain(sep));
    out.push(...p);
  });
  return out;
}

/** Ported from the vanilla apps' joinAnd(): "a", "a and b", "a, b and c". */
export function joinAndFrag(parts: Fragment[][]): Fragment[] {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return build(parts[0], " and ", parts[1]);
  const head = parts.slice(0, -1);
  const out: Fragment[] = [];
  head.forEach((p, i) => {
    out.push(...p);
    if (i < head.length - 1) out.push(plain(", "));
  });
  out.push(plain(" and "));
  out.push(...parts[parts.length - 1]);
  return out;
}
