import { useEffect, useLayoutEffect } from "react";

/* The opening sequence (loader, then the storm and the pen trace) runs about
   eight seconds. It earns that once. On every later arrival in the same tab,
   returning from /samples or /work, the viewer has already watched it and is
   only waiting, so the flag below lets the hero open already settled.

   sessionStorage rather than localStorage: a new tab or a new day is a new
   first impression, which is the one worth spending the eight seconds on. */

const KEY = "mk-intro-seen";

export function hasSeenIntro(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    // Private mode, or storage blocked. The intro simply plays again.
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* no-op: see above */
  }
}

/* Reads storage before the browser paints, so a returning viewer never sees
   a frame of the loader. Falls back to useEffect during server rendering. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
