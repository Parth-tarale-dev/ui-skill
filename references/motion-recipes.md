# Motion & Choreography Recipes

## 1. Framer Motion (`motion/react`)

### Default Physics Configs
```tsx
// Smooth Spring (Default for all UI components)
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
  mass: 0.8,
};

// Snappy Spring (Buttons, Toggles, Micro-actions)
export const snappySpring = {
  type: "spring",
  stiffness: 400,
  damping: 18,
};

// Cinematic Bezier (Page transitions & Hero entrances)
export const easeOutExpo = [0.16, 1, 0.3, 1];
```

### Staggered Bento / Card Entrance
```tsx
import * as motion from "motion/react-client";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};
```

### Sliding Pill Tab Indicator (`layoutId`)
```tsx
<div className="relative flex rounded-full p-1 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActive(tab.id)}
      className="relative px-4 py-1.5 text-sm font-medium transition-colors"
    >
      {active === tab.id && (
        <motion.div
          layoutId="active-pill"
          className="absolute inset-0 rounded-full bg-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      )}
      <span className="relative z-10 text-white">{tab.label}</span>
    </button>
  ))}
</div>
```

---

## 2. GSAP (`gsap` + `@gsap/react`)

### Clean `useGSAP` Setup with ScrollTrigger
```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function PinnedHeroSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Automatic cleanup when component unmounts!
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1,
        },
      });

      tl.from(".hero-card", {
        scale: 0.85,
        opacity: 0,
        y: 60,
        stagger: 0.15,
        ease: "power3.out",
      });
    },
    { scope: container }
  );

  return (
    <section ref={container} className="min-h-screen">
      <div className="hero-card">Card 1</div>
      <div className="hero-card">Card 2</div>
    </section>
  );
}
```
