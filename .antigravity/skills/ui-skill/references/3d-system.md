# 3D System: Asset Libraries + WebGL Stack

Two layers:

1. **Pre-rendered 3D assets** (PNG/WebP/GLTF) from six curated libraries, presented through `templates/ThreeDStage.tsx`. Cheap, fast, works everywhere. Use these first.
2. **Real-time WebGL** (`three`, `@react-three/fiber`, `@react-three/drei`, `@splinetool/react-spline`) for genuinely interactive scenes. Use only when interaction or scroll-driven 3D is the point.

Rule of thumb: if the user will not rotate it, scrub it, or interact with it, it is a pre-rendered asset in a `ThreeDStage`, not a WebGL canvas.

## Honest handling of external assets

These libraries are external sites. You cannot download from them inside the codebase on the user's behalf.

- Reference each asset by a clear local path (for example `/3d/hero-glass-shape.webp`) and **list every asset the user must download** in your final report, with the library URL and the suggested search term.
- **Verify each pack's license** (free tier, attribution, commercial use) before shipping. Terms differ between libraries and between free and premium packs, and they change.
- Always provide meaningful `alt` text, explicit `width` and `height` (no layout shift), and a bespoke SVG or shimmer fallback if the file is missing during development.
- Export as **WebP or AVIF with alpha**, max 1200px on the long edge for heroes, 512px for cards. Keep each asset under ~150KB when possible.

---

## Part 1: The 6 Curated 3D Asset Libraries

### 1. `https://3dicons.co`
**What:** Open-source and premium 3D icons in clay, gradient and color styles.
**Use for:** feature cards, badges, empty states, small focal anchors beside copy.
**Pairs with:** Editorial / Stripe Craft (clay set), Linear / Raycast (gradient set).
**Stage settings:** `size="sm"` or `"md"`, subtle levitation, `glow` using the icon's dominant hue, `tilt` on in cards.

### 2. `https://icons8.com/3d`
**What:** Vibrant 3D characters, avatars and people (PNG / GLTF / OBJ).
**Use for:** onboarding steps, testimonials, hero companions, team sections.
**Pairs with:** any archetype once styled to match.
**Stage settings:** `size="lg"`, gentle levitation, `floorShadow` on. Use GLTF/OBJ only through R3F (Part 2); use PNG exports in `ThreeDStage`.

### 3. `https://thiings.co/things`
**What:** Isometric 3D everyday objects, tools, nature and props.
**Use for:** category grids, interactive selectors, gamified UI, sticker-like accents.
**Pairs with:** Neo-Brutalist / Gumroad.
**Stage settings:** `size="md"`, bouncy tilt, grid of selectable tiles with `whileTap={{ scale: 0.97 }}`.

### 4. `https://wannathis.one/illustrations`
**What:** Abstract iridescent, metallic and frosted-glass 3D illustrations.
**Use for:** SaaS and AI hero sections, section dividers, CTA banners.
**Pairs with:** Linear / Raycast Dark (default), Apple Spatial.
**Stage settings:** `size="xl"`, slow levitation, strong `glow`, `floorShadow` off for pure abstract shapes.

### 5. `https://artify.co/3d-lettering`
**What:** 3D lettering and inflated, glossy typography.
**Use for:** playful hero words, promo headers, big numerals, section titles in creator products.
**Pairs with:** Neo-Brutalist / Gumroad.
**Accessibility:** the lettering is an image. Put the same text in a visually hidden `<h1>` or pass accurate `alt`.
**Stage settings:** `size="xl"`, larger tilt, low levitation.

### 6. `https://fuwatale.com`
**What:** Hand-crafted, stylized 3D icons and floating UI props.
**Use for:** floating props around product UI, feature icons, friendly accents.
**Pairs with:** Editorial / Stripe Craft, Neo-Brutalist.
**Stage settings:** `size="sm"` to `"md"`, levitate with different `delay` per prop so they never move in sync.

### Asset placement rules

| Surface | Asset | Stage config |
|---|---|---|
| Hero | One dominant asset, `xl`, with back-glow | `levitate`, `tilt`, `glow`, `floorShadow` |
| Bento card focal area | One `md` asset anchored to a corner, partially bleeding off the card | `tilt`, `glow` |
| Feature icon row | `sm` icons, consistent style | `levitate` with staggered `delay` |
| Empty state | `lg` asset + one-line copy + primary CTA | `levitate`, `floorShadow` |
| Onboarding step | `lg` character per step, swapped with `AnimatePresence mode="wait"` | `levitate` |
| Testimonial | `sm` avatar | no levitation |

### Usage

```tsx
import { ThreeDStage } from "@/components/ui/ThreeDStage";

<ThreeDStage
  src="/3d/hero-glass-shape.webp"
  alt="Iridescent glass sculpture"
  width={720}
  height={720}
  size="xl"
  glowColor="var(--accent)"
  priority
/>
```

Bleeding an asset off a Bento card corner:

```tsx
<div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card">
  <h3 className="max-w-[16ch] text-lg font-medium tracking-tight text-balance">Realtime sync</h3>
  <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-muted">Every change lands everywhere in under 50ms.</p>
  <div className="pointer-events-none absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8">
    <ThreeDStage src="/3d/sync-icon.webp" alt="" width={256} height={256} size="md" glowColor="var(--accent)" />
  </div>
</div>
```

(Decorative assets use `alt=""`.)

### Mobile scaling

`ThreeDStage` sizes shrink automatically through responsive classes. Additional rules:
- Heroes: reduce to ~70% width below `640px` and keep the asset above the fold with headline below, or behind the headline at low opacity.
- Disable mouse tilt on touch devices (the template does this via `(hover: hover) and (pointer: fine)`).
- Hide secondary floating props below `sm` if they crowd copy.

---

## Part 2: Real-Time WebGL (R3F + drei)

Install:
```bash
node .antigravity/skills/ui-skill/scripts/init-ui-stack.mjs --with-3d
```
Adds `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`.
Spline is installed on demand: `npm i @splinetool/react-spline`.

### 2.1 Canonical canvas setup

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Float } from "@react-three/drei";

export function HeroCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 40 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <Environment preset="city" />
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh>
          <torusKnotGeometry args={[0.9, 0.3, 192, 32]} />
          <meshPhysicalMaterial
            color="#7c6cff"
            metalness={0.85}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>
      <ContactShadows position={[0, -1.6, 0]} opacity={0.4} scale={8} blur={2.6} far={3} />
    </Canvas>
  );
}
```

Required elements: `dpr={[1, 1.5]}`, `gl={{ antialias: true, alpha: true }}`, `<Float>`, `<Environment preset="city" />`, `<ContactShadows />`. Transparent canvas (`alpha: true`) lets the page's ambient glow show through.

### 2.2 Loading a GLTF/GLB model

```tsx
"use client";

import { useGLTF } from "@react-three/drei";

const MODEL_URL = "/3d/product.glb";

export function Product(props: React.ComponentProps<"group">) {
  const { scene } = useGLTF(MODEL_URL);
  return <primitive object={scene} {...props} />;
}

useGLTF.preload(MODEL_URL);
```

Compress models: run `gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`. Target under 2MB.

### 2.3 Lazy-load the canvas (never SSR it)

```tsx
// Next.js
import dynamic from "next/dynamic";
import { CanvasSkeleton } from "@/components/ui/CanvasSkeleton";

export const HeroCanvasLazy = dynamic(
  () => import("./HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false, loading: () => <CanvasSkeleton /> },
);
```

```tsx
// Vite / plain React
import { lazy, Suspense } from "react";
import { CanvasSkeleton } from "@/components/ui/CanvasSkeleton";

const HeroCanvas = lazy(() => import("./HeroCanvas").then((m) => ({ default: m.HeroCanvas })));

export function HeroCanvasLazy() {
  return (
    <Suspense fallback={<CanvasSkeleton />}>
      <HeroCanvas />
    </Suspense>
  );
}
```

### 2.4 Shimmer skeleton fallback

```tsx
export function CanvasSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative isolate aspect-square w-full overflow-hidden rounded-3xl border border-border bg-surface ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent motion-reduce:animate-none" />
      <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-20 blur-2xl" />
    </div>
  );
}
```

Add the keyframes once (`@keyframes shimmer { to { transform: translateX(100%); } }`) in global CSS or Tailwind config.

### 2.5 Spline, lazy-loaded inside `<Suspense>`

```tsx
"use client";

import { lazy, Suspense } from "react";
import { CanvasSkeleton } from "@/components/ui/CanvasSkeleton";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string; // e.g. "https://prod.spline.design/<id>/scene.splinecode"
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className={className}>
      <Suspense fallback={<CanvasSkeleton />}>
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
}
```

For Next.js, import the module from `@splinetool/react-spline/next` for server-friendly behavior. Always wrap in a container with an explicit height and `overflow-hidden`. Provide a static poster image below `md` if the scene is heavy.

---

## Part 3: Strict WebGL Performance Safeguards

Treat every item as mandatory.

### 3.1 Pixel ratio cap
`dpr={[1, 1.5]}` on every `<Canvas>`. Retina at full DPR quadruples fragment cost for little visible gain.

### 3.2 Demand-driven rendering
Static or mostly static scenes use `frameloop="demand"`. Call `invalidate()` when something changes (a controls event, a state change).

### 3.3 Pause when off-screen (IntersectionObserver)

Use this wrapper around every canvas.

```tsx
"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

interface ViewportCanvasProps extends Omit<CanvasProps, "frameloop"> {
  /** true if the scene animates continuously; false if it only changes on interaction */
  animated?: boolean;
  rootMargin?: string;
}

export function ViewportCanvas({
  animated = false,
  rootMargin = "100px",
  children,
  ...props
}: ViewportCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  const frameloop = !visible ? "never" : animated && !reduced ? "always" : "demand";

  return (
    <div ref={wrapRef} className="relative size-full">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        {...props}
        frameloop={frameloop}
      >
        {children}
      </Canvas>
    </div>
  );
}
```

### 3.4 Geometry / material / texture disposal

R3F disposes objects it created when they unmount. You must dispose anything you create **imperatively**.

```tsx
import { useEffect, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial } from "three";

function Crate() {
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: "#7c6cff" }), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <mesh geometry={geometry} material={material} />;
}
```

Also:
- Dispose textures you load manually (`texture.dispose()`).
- Share geometries and materials across meshes (`useMemo`, or `<Instances>` from drei for many copies).
- Never create objects in `useFrame`. Mutate refs; reuse vectors declared outside the loop.

### 3.5 Frame-loop discipline
- Mutate `ref.current.rotation.y += delta * speed` in `useFrame`. Never `setState` in `useFrame`.
- Keep draw calls under ~100 on mobile; merge static geometry.
- Limit realtime lights (1 directional + environment is enough); avoid realtime shadows on mobile. Use `<ContactShadows>` (baked, cheap).
- Post-processing is opt-in and desktop-only.

### 3.6 Mobile and fallback
- Below `md`, prefer a pre-rendered `ThreeDStage` image instead of WebGL when the scene is decorative.
- Detect failure: wrap canvases in an error boundary that renders the static poster.
- Never block first paint on a canvas. Render copy and layout first; canvas hydrates after.

---

## Part 4: Scroll + 3D

See `motion-recipes.md` section 2.4 for GSAP `ScrollTrigger` driving R3F refs. Key points: pin the section, `scrub: 1`, animate `rotation`, `position` and `scale` on a ref, never React state.

---

## 3D Checklist

- [ ] Every focal area has a 3D asset in `ThreeDStage`, a bespoke SVG, or a live UI preview.
- [ ] Asset list with library URLs and license reminders included in the final report.
- [ ] All images have `width`, `height` and `alt` (or `alt=""` if decorative).
- [ ] Canvases lazy-loaded, `ssr: false`, with shimmer skeleton.
- [ ] `dpr={[1, 1.5]}`, `frameloop` demand/never policy, off-screen pause in place.
- [ ] Imperative geometry/material/texture disposal.
- [ ] Reduced-motion: no levitation, no continuous frameloop, no scroll scrub.
- [ ] Mobile: lighter asset or static poster; no horizontal overflow.
