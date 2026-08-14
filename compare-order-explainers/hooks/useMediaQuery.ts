"use client";

import { useEffect, useState } from "react";

/** SSR-safe matchMedia hook. Returns false until mounted (matches the static-export prerender),
 * then syncs to the real value and stays live across the breakpoint via a change listener -
 * the React-idiomatic replacement for the vanilla app's `desktopMQ.addEventListener('change', ...)`
 * pattern, with no risk of the matchMedia-vs-resize timing bugs that pattern needed workarounds for. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export const DESKTOP_QUERY = "(min-width: 900px)";
export const NARROW_QUERY = "(max-width: 380px)";
