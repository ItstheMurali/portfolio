"use client";

import { useEffect } from "react";

/*
  Lenis + GSAP ScrollTrigger integration — the exact pattern:
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
*/

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    (async () => {
      const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const gsap = gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: !reduced,
        syncTouch: false,
        touchMultiplier: 1.5,
      });

      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // expose for anchor navigation (Nav links scroll through Lenis)
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;

      // Landing on a #bookmark: glide to it once the page has settled,
      // so Lenis never swallows the browser's native anchor jump.
      if (window.location.hash) {
        const hash = window.location.hash;
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
        }, 150);
      }

      // Same-page bookmark links glide through Lenis instead of jumping.
      const onAnchorClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest?.(
          'a[href^="#"]'
        ) as HTMLAnchorElement | null;
        if (!a) return;
        const el = document.querySelector(a.getAttribute("href")!);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.3 });
      };
      document.addEventListener("click", onAnchorClick);

      cleanup = () => {
        document.removeEventListener("click", onAnchorClick);
        delete (window as unknown as { __lenis?: unknown }).__lenis;
        gsap.ticker.remove(tick);
        lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => cleanup?.();
  }, []);

  return <>{children}</>;
}
