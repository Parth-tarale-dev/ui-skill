# Motion Recipes: Framer Motion + GSAP + Lenis

Copy-pasteable TypeScript. Every recipe is compositor-only (`transform`, `opacity`, `filter`) and respects `prefers-reduced-motion`.

Install (the init script does this for you):
```bash
node .antigravity/skills/ui-skill/scripts/init-ui-stack.mjs
```
Packages: `motion`, `gsap`, `@gsap/react`, `lenis`.

## Choosing the tool

| Need | Use |
|---|---|
| Hover, tap, mount/unmount, layout changes, tabs, modals, toasts | **Framer Motion** (`motion/react`) |
| Scroll-linked scenes, pinning, scrubbing, horizontal scroll, text reveals, timelines | **GSAP** (`gsap` + `@gsap/react`) |
| Smooth inertial scrolling | **Lenis** via `templates/SmoothScrollProvider.tsx` |
| Camera/model scrubs in 3D | GSAP `ScrollTrigger` driving R3F refs |

Never animate the same property on the same element with two libraries.

## Shared constants

```ts
// src/lib/motion.ts
import type { Transition, Variants } from "motion/react";

export const springSnappy: Transition = { type: "spring", stiffness: 400, damping: 28 };
export const springSoft: Transition = { type: "spring", stiffness: 300, damping: 24 };
export const springTab: Transition = { type: "spring", stiffness: 350, damping: 30 };
export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export const blurUpItem: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springSoft,
  },
};

/** Reduced-motion safe version: fade only, no travel or blur. */
export const fadeOnlyItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};
```

---

## Part 1: Framer Motion (`motion/react`)

### 1.1 Staggered container and child blur-up entrance

`opacity: 0, y: 20, filter: "blur(6px)"` to `opacity: 1, y: 0, filter: "blur(0px)"`, `staggerChildren: 0.07`.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { blurUpItem, fadeOnlyItem, staggerContainer } from "@/lib/motion";

interface FeatureListProps {
  features: ReadonlyArray<{ id: string; title: string; body: string }>;
}

export function FeatureList({ features }: FeatureListProps) {
  const reduce = useReducedMotion();
  const item = reduce ? fadeOnlyItem : blurUpItem;

  return (
    <motion.ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {features.map((f) => (
        <motion.li
          key={f.id}
          variants={item}
          className="rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          <h3 className="text-lg font-medium tracking-tight">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### 1.2 Shared layout tab indicator (`layoutId="active-pill"`)

```tsx
"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface PillTabsProps {
  tabs: ReadonlyArray<Tab>;
  onChange?: (id: string) => void;
}

export function PillTabs({ tabs, onChange }: PillTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const group = useId(); // scopes layoutId so multiple tab groups never collide

  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-card"
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => {
              setActive(tab.id);
              onChange?.(tab.id);
            }}
            className={cn(
              "relative min-h-11 rounded-full px-4 text-sm font-medium outline-none transition-[color,transform]",
              "focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
              "disabled:pointer-events-none disabled:opacity-50",
              selected ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`active-pill-${group}`}
                className="absolute inset-0 rounded-full border border-border-strong bg-surface-raised shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

If you need the literal id, `layoutId="active-pill"` is correct when only one tab group exists on the page.

### 1.3 `AnimatePresence mode="wait"`: modal

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-lg rounded-3xl border border-border bg-surface-raised p-6 shadow-pop"
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-medium tracking-tight">{title}</h2>
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.97 }}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="size-5" strokeWidth={1.75} />
              </motion.button>
            </div>
            <div className="mt-4 text-sm leading-relaxed text-muted">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 1.4 `AnimatePresence mode="wait"`: drawer

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, children }: DrawerProps) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <div key="drawer-root" className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close drawer"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="absolute right-0 top-0 h-dvh w-full max-w-md border-l border-border bg-surface-raised p-6 shadow-pop"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 120 || info.velocity.x > 600) onClose();
            }}
          >
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
```

### 1.5 `AnimatePresence mode="wait"`: toast stack

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";

export interface ToastItem {
  id: string;
  message: string;
  tone?: "default" | "success" | "danger";
}

interface ToasterProps {
  toasts: ReadonlyArray<ToastItem>;
  onDismiss: (id: string) => void;
}

const dot = {
  default: "bg-accent",
  success: "bg-success",
  danger: "bg-danger",
} as const;

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex min-h-11 w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm shadow-pop"
          >
            <span className={`size-2 shrink-0 rounded-full ${dot[t.tone ?? "default"]}`} />
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="min-h-11 min-w-11 rounded-lg text-muted transition-colors hover:text-foreground active:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Dismiss
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

Backdrops are `tabIndex={-1}` on purpose: Escape and the focusable close button are the keyboard paths, so the backdrop is mouse-only and the audit script exempts it.

Toasts use `mode="popLayout"` so siblings reflow while one exits. Modals and drawers use `mode="wait"` so the outgoing view finishes before the incoming one mounts.

### 1.6 Tactile interactive card

```tsx
<motion.button
  type="button"
  whileHover={{ y: -2, scale: 1.01 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 28 }}
  className="min-h-11 rounded-2xl border border-border bg-surface p-5 text-left shadow-card transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
/>
```

### 1.7 Skeleton shimmer (no "Loading..." text)

```css
@keyframes shimmer {
  to { transform: translateX(100%); }
}
.skeleton { position: relative; overflow: hidden; background: var(--surface); border-radius: 0.75rem; }
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
  animation: shimmer 1.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton::after { animation: none; }
}
```

---

## Part 2: GSAP (`gsap` + `@gsap/react`)

### 2.0 Mandatory pattern

Never use raw `useEffect` for GSAP. Always `useGSAP` with a `scope`, so selectors resolve inside the component and everything reverts on unmount.

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Example() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".reveal", {
          opacity: 0,
          y: 32,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
        });
      });

      // Reduced motion: content is simply visible, nothing to do.
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <p className="reveal">One</p>
      <p className="reveal">Two</p>
    </div>
  );
}
```

Rules:
- `gsap.registerPlugin(useGSAP, ScrollTrigger)` at module scope in any file that uses them.
- Use `gsap.matchMedia()` for reduced motion **and** for breakpoint-specific scenes (pin on desktop, stack on mobile).
- Event handlers that create tweens use `contextSafe` from `useGSAP`.
- Use `dependencies` only when a tween truly depends on props or state; add `revertOnUpdate: true` if it must rebuild.

### 2.1 Masked hero headline: split-line reveal

Each line sits in an `overflow-hidden` mask. The inner line starts below the mask (`yPercent: 110`), slightly rotated, then rises.

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface MaskedHeadlineProps {
  lines: ReadonlyArray<string>;
  className?: string;
}

export function MaskedHeadline({ lines, className }: MaskedHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".line-inner", {
          yPercent: 110,
          rotate: 2,
          stagger: 0.04,
          duration: 1.1,
          ease: "power4.out",
          delay: 0.1,
        });
      });
    },
    { scope: ref },
  );

  return (
    <h1
      ref={ref}
      aria-label={lines.join(" ")}
      className={
        className ??
        "font-display text-5xl tracking-tighter leading-[1.05] text-balance sm:text-6xl lg:text-7xl"
      }
    >
      {lines.map((line, i) => (
        <span key={i} aria-hidden className="block overflow-hidden pb-[0.08em]">
          <span className="line-inner block origin-left will-change-transform">{line}</span>
        </span>
      ))}
    </h1>
  );
}
```

Note: the `pb-[0.08em]` stops descenders being clipped by the mask.

### 2.2 Pinned horizontal scroll section

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Panel {
  id: string;
  title: string;
  body: string;
}

export function HorizontalScroll({ panels }: { panels: ReadonlyArray<Panel> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Pin + scrub only on large screens with motion allowed.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        if (!track) return;

        const distance = () => track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });
      // Below 1024px or reduced motion: the track is a normal native horizontal swipe row.
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div
        ref={trackRef}
        className="flex w-max gap-6 px-4 py-16 max-lg:w-full max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto sm:px-6 lg:h-dvh lg:items-center lg:gap-10 lg:px-[10vw] lg:py-0"
      >
        {panels.map((p) => (
          <article
            key={p.id}
            className="w-[82vw] shrink-0 snap-center rounded-3xl border border-border bg-surface p-8 shadow-card sm:w-[60vw] lg:w-[44vw]"
          >
            <h3 className="font-display text-3xl tracking-tighter leading-[1.05] text-balance">{p.title}</h3>
            <p className="mt-4 leading-relaxed text-muted">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

### 2.3 `scrub: 1` parallax depth layers

Layers move at different speeds using `data-speed`. Only `y` (a transform) animates.

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ParallaxDepth({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((layer) => {
          const speed = parseFloat(layer.dataset.speed ?? "0");
          gsap.fromTo(
            layer,
            { y: () => -speed * 120 },
            {
              y: () => speed * 120,
              ease: "none",
              scrollTrigger: {
                trigger: ref.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative isolate overflow-hidden">
      {children}
    </div>
  );
}

// Usage:
// <ParallaxDepth>
//   <div data-speed="0.2"  className="absolute ...">{/* far glow */}</div>
//   <div data-speed="0.6"  className="relative ...">{/* mid: ThreeDStage */}</div>
//   <div data-speed="1.0"  className="absolute ...">{/* near props */}</div>
// </ParallaxDepth>
```

### 2.4 Scroll-scrubbed 3D camera / model (R3F + ScrollTrigger)

Drive a ref, not React state. Re-rendering per scroll tick will tank the frame rate.

```tsx
"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import type { Group } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const modelRef = useRef<Group>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const model = modelRef.current;
        if (!model) return;

        gsap
          .timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=200%",
              pin: true,
              scrub: 1,
            },
          })
          .to(model.rotation, { y: Math.PI * 2, ease: "none" }, 0)
          .to(model.position, { x: 1.2, ease: "none" }, 0)
          .to(model.scale, { x: 1.35, y: 1.35, z: 1.35, ease: "none" }, 0);
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-dvh">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <Environment preset="city" />
        <group ref={modelRef}>
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
            <mesh>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color="#7c6cff" metalness={0.9} roughness={0.15} />
            </mesh>
          </Float>
        </group>
      </Canvas>
    </section>
  );
}
```

---

## Part 3: Lenis Smooth Scroll

Mount `templates/SmoothScrollProvider.tsx` once, high in the tree:

```tsx
// src/app/layout.tsx
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
```

The provider:
- Creates one Lenis instance, `autoRaf: false`.
- Forwards every Lenis scroll event to `ScrollTrigger.update`.
- Drives Lenis from `gsap.ticker` (time is seconds, Lenis wants ms) with `gsap.ticker.lagSmoothing(0)`.
- Skips smooth scroll entirely when the user prefers reduced motion.
- Cleans up the ticker callback and destroys the instance on unmount.

Add to global CSS (Lenis requirements):
```css
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: clip; }
```

To stop scroll while a modal is open: `lenis.stop()` / `lenis.start()` (access via the `useLenis` hook exported by the template).

---

## Motion Checklist

- [ ] Only `transform`, `opacity`, `filter` animate. No `transition-all`.
- [ ] Springs on interactive elements. No linear easing on UI.
- [ ] `whileTap={{ scale: 0.97 }}` on every pressable motion element.
- [ ] GSAP uses `useGSAP` with `{ scope }`. No raw `useEffect` + `gsap.`.
- [ ] `gsap.matchMedia()` or `useReducedMotion()` guards every non-essential animation.
- [ ] Scroll scenes use `invalidateOnRefresh: true` when values depend on layout.
- [ ] No `will-change` left permanently on large surfaces.
- [ ] Mobile (<1024px) gets a simplified or native alternative to pinned scenes.
