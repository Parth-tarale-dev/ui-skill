"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

/** Access the Lenis instance, e.g. `lenis?.stop()` while a modal is open. Returns null before mount or when reduced motion is on. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export interface SmoothScrollProviderProps {
  children: ReactNode;
  /** Interpolation factor. Lower is smoother and slower. */
  lerp?: number;
  /** Multiplier for wheel input. */
  wheelMultiplier?: number;
}

/**
 * Mount once, near the root of the app.
 *
 * Wiring (the canonical Lenis + GSAP setup):
 *   1. Lenis does not run its own requestAnimationFrame loop (autoRaf: false).
 *   2. gsap.ticker drives lenis.raf, so GSAP and Lenis share one clock.
 *   3. Every Lenis scroll event calls ScrollTrigger.update so pins and scrubs stay in sync.
 *   4. gsap.ticker.lagSmoothing(0) stops GSAP from compensating for lag, which causes scroll jumps with Lenis.
 *
 * Smooth scrolling is skipped entirely when the user prefers reduced motion.
 */
export function SmoothScrollProvider({ children, lerp = 0.1, wheelMultiplier = 1 }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const instance = new Lenis({
      autoRaf: false,
      lerp,
      wheelMultiplier,
      smoothWheel: true,
      anchors: true,
    });

    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    // gsap.ticker passes time in seconds; Lenis expects milliseconds.
    const tick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.off("scroll", onScroll);
      instance.destroy();
      setLenis(null);
      ScrollTrigger.refresh();
    };
  }, [lerp, wheelMultiplier]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export default SmoothScrollProvider;
