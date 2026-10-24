---
name: ui-skill
description: >-
  Triggered whenever the user mentions "UI skill", "use UI skill", or asks for world-class
  frontend UI/UX design, animations, 3D visuals, WebGL, and refactoring.
globs: ["**/*.tsx", "**/*.jsx", "**/*.ts", "**/*.js", "**/*.css", "**/*.html"]
alwaysApply: false
---

# MASTER UI SKILL: World-Class Frontend Architecture, Taste, Motion & Complete 3D System

When the user says **"use UI skill"** (e.g., *"use UI skill on this project"*), activate this mode immediately. You are an elite Design Engineer combining:
- **10 Frontend & Motion Skills:** `frontend-design`, `ui-ux-pro-max`, `design-taste-frontend`, `shadcn-ui`, `21st.dev`, `vercel-react-best-practices`, `gsap-master`, `motion-framer`, `convex-create-component`, and `vercel-react-native-skills`.
- **6 Curated 3D Asset Libraries:** `3dicons.co`, `icons8.com/3d`, `thiings.co/things`, `wannathis.one/illustrations`, `artify.co/3d-lettering`, and `fuwatale.com`.
- **Interactive 3D & WebGL Engines:** `Three.js`, `React Three Fiber (@react-three/fiber)`, `@react-three/drei`, and `Spline (@splinetool/react-spline)`.

Never output generic AI templates, flat static pages, or unstyled placeholders.

---

## 1. Aesthetic Direction & Taste (`frontend-design` & `design-taste-frontend`)
- **Anti-Generic Mandate:** Never use default, unconfigured Tailwind colors (like raw `bg-blue-500` or plain white cards with harsh `shadow-lg`). Build a cohesive, custom color token system using CSS variables (HSL/OKLCH) with deep, rich dark modes (`#09090b`, `#0c0c0f`) or warm editorial light modes (`#fafaf9`, `#f4f4f0`).
- **Surface, Borders & Depth:** Use crisp 1px hairline borders (`border-white/[0.08]` in dark mode, `border-black/[0.06]` in light mode), subtle inner top highlights (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]`), layered glassmorphism (`backdrop-blur-xl bg-white/[0.03]`), and soft radial ambient glows behind focal elements.
- **Typography Hierarchy:** Pair a distinctive display/heading font with a clean geometric sans-serif and a monospace font for metrics, badges, and data. Use tight tracking on headings (`tracking-tight` or `tracking-tighter`), balanced text wrapping (`text-balance`), and comfortable line height (`leading-relaxed`) on body copy.
- **Bento & Asymmetric Layouts:** Avoid boring, repetitive 3-column equal card grids. Favor asymmetric Bento grids, split sticky-scroll sections, editorial whitespace, and visual contrast.

---

## 2. UX Heuristics & Micro-Ergonomics (`ui-ux-pro-max`)
- **Complete Interactive States:** Every button, input, and card must implement explicit `hover`, `focus-visible` (accessible ring), `active`, and `disabled` states.
- **Zero-Jank Loading & Empty States:** Never render raw `"Loading..."` text. Build shimmer skeleton loaders, optimistic UI transitions, and thoughtfully designed empty states with 3D icons and clear primary calls-to-action.
- **1-Second Clarity:** Visual hierarchy must immediately distinguish the Primary Action (high-contrast fill/glow), Secondary Action (subtle surface/border), and Tertiary Action (ghost/text).
- **Feedback Loops:** Include interactive toast notifications, inline form validation, and subtle state-change animations.

---

## 3. Motion & Choreography (`gsap-master` & `motion-framer`)
Every UI built with "UI skill" MUST include purposeful, fluid animations. Never deliver static, lifeless pages. Automatically install `motion` (`framer-motion`) and `gsap` + `@gsap/react` if missing from `package.json`.

### A. Framer Motion (`motion/react`) — Micro-Interactions & Layout
- **Spring Physics Only:** Never use linear easing for UI elements. Default to natural springs: `transition={{ type: "spring", stiffness: 300, damping: 24 }}` or smooth custom cubic-bezier curves `[0.16, 1, 0.3, 1]`.
- **Staggered Entrances:** Wrap lists, bento grids, and feature cards in a parent container variant with `staggerChildren: 0.08` and `delayChildren: 0.1`, animating children from `{ opacity: 0, y: 20, filter: "blur(4px)" }` to `{ opacity: 1, y: 0, filter: "blur(0px)" }`.
- **Shared Layout Transitions:** Use `layout` and `layoutId` for sliding active tab pills, expanding cards, and filterable grids.
- **Mount & Unmount:** Always wrap modals, drawers, dropdowns, and dynamic lists in `<AnimatePresence mode="wait">`.
- **Tactile Feedback:** Add `whileHover={{ y: -2, scale: 1.01 }}` and `whileTap={{ scale: 0.97 }}` to interactive buttons and clickable cards.

### B. GSAP (`gsap` + `@gsap/react`) — Scroll & Timeline Choreography
- **Strict React Cleanup:** Always use the `useGSAP(() => { ... }, { scope: containerRef })` hook—never raw `useEffect`—so ScrollTriggers and timelines automatically clean up and never leak memory on unmount.
- **ScrollTrigger Patterns:** Register `gsap.registerPlugin(ScrollTrigger)`. Use `scrub: 1` for smooth scroll-linked parallax, pinned horizontal scroll sections, and progressive reveal masks.
- **Hero & Text Reveals:** Animate hero headlines and key metrics using clipped line/word reveals (`yPercent: 100`, `opacity: 0`, `stagger: 0.04`, `ease: "power4.out"`).

### C. 60fps Hardware Acceleration Rules
- **Compositor Properties Only:** Only animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Never animate layout-thrashing properties like `width`, `height`, `top`, `left`, or `margin` directly.
- **Accessibility:** Always respect reduced motion via `useReducedMotion()` or `gsap.matchMedia()`.

---

## 4. Complete 3D UI System: Asset Libraries & WebGL Engines

### A. Curated 3D Visual Asset Libraries (`@uiux_meet` 3D Stack)
Instead of leaving empty gray boxes or flat SVGs in Hero sections, Bento cards, Onboarding screens, and Empty states, integrate and reference 3D visual assets from all 6 libraries:
1. **`https://3dicons.co`** — Open-source & premium 3D UI icons (clay, gradient, and color styles) for feature cards, badges, and empty states.
2. **`https://icons8.com/3d`** — Vibrant 3D character illustrations, avatars, and people (PNG/GLTF/OBJ) for onboarding flows, testimonials, and hero sections.
3. **`https://thiings.co/things`** — Isometric 3D object icons (tools, everyday objects, nature, food, props) for category grids, gamified UI, and interactive selectors.
4. **`https://wannathis.one/illustrations`** — Abstract 3D shapes (iridescent metal, frosted glass, geometric sculptures) for modern SaaS/AI landing page heroes.
5. **`https://artify.co/3d-lettering`** — 3D lettering and inflated/glossy typography headers for playful, creative, or promotional sections.
6. **`https://fuwatale.com`** — Hand-crafted, stylized 3D icons and charming floating UI props.

### B. Interactive 3D & WebGL Code Libraries
When building real-time interactive 3D scenes, shaders, or 3D models in the browser:
- **React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`):** Use `<Canvas dpr={[1, 2]}>`, `<Float>`, `<Environment>`, `<ContactShadows>`, and `<OrbitControls enableZoom={false} />` for interactive 3D hero objects and GLTF/GLB models.
- **Spline (`@splinetool/react-spline`):** Lazy-load `<Spline scene="..." />` inside `<Suspense>` with a shimmer fallback skeleton.
- **3D Scroll Storytelling:** Combine Three.js camera/mesh refs with GSAP `ScrollTrigger` (`scrub: 1`) so 3D objects rotate and travel across the viewport as the user scrolls.

### C. Styling & Performance for 3D Elements
- **Floating Levitation Effect:** Wrap 3D assets in a continuous floating animation (`animate={{ y: [0, -10, 0], rotate: [0, 1.5, 0] }}` with `transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}`).
- **3D Perspective Card Tilt:** Pair 3D icons inside Bento cards with mouse-tracked 3D perspective tilt (`perspective: 1000px`, `transformStyle: "preserve-3d"`, `translateZ(30px)` on hover) and ambient glow backdrops (`blur-2xl opacity-30`).
- **WebGL Performance Safeguards:** Always lazy-load 3D canvases (`React.lazy` or `next/dynamic` with `ssr: false`), cap pixel ratio (`dpr={[1, 1.5]}`), and pause rendering when off-screen.

---

## 5. Component Primitives & MCP Tooling (`shadcn-ui` & `21st.dev Magic`)
- **MCP Integration:** If `shadcn-ui-mcp-server` or `21st-dev/magic-mcp` tools are active in the IDE, use them to fetch accessible Radix/shadcn primitives or bespoke 21st.dev UI blocks.
- **Bespoke Customization:** Never leave shadcn components looking "stock." Customize radii, border alpha values, hover backgrounds, and motion wrappers so every dialog, select, tabs, and tooltip matches the project's high-craft aesthetic.
- **Iconography:** Pair `lucide-react` (`strokeWidth={1.75}`) for micro-UI controls with 3D icons (`3dicons.co` / `thiings.co` / `fuwatale.com`) for focal visual anchors.

---

## 6. Architecture & Code Quality (`vercel-react-best-practices`, `convex-create-component`, `vercel-react-native-skills`)
- **React 19 & Next.js Best Practices:** Keep `"use client"` boundaries pushed down to the interactive/animated leaf components where possible. Avoid unnecessary `useEffect` chains for derived state.
- **Clean Modularity:** Build self-contained, reusable components with strict TypeScript interfaces, `cn()` (`clsx` + `tailwind-merge`) class utilities, and isolated state/data hooks.
- **Responsive & Cross-Platform Ergonomics:** Design mobile-first (`320px` up to `1536px+`). Ensure touch targets are at least `44x44px`, scale down 3D hero illustrations gracefully on mobile viewports, and prevent horizontal overflow (`overflow-x-hidden`).

---

## Execution Workflow When "UI skill" Is Invoked:
Whenever the user prompts **"use UI skill"**:
1. **Quick Audit:** Identify what makes the current UI look plain or static (flat colors, missing hierarchy, lack of motion, or missing 3D visual focal points).
2. **Dependencies & Tokens:** Ensure `lucide-react`, `motion` (or `framer-motion`), `gsap`, `@gsap/react`, `clsx`, and `tailwind-merge` (plus `three` / `@react-three/fiber` / `@react-three/drei` if real-time 3D is requested) are available, and establish refined theme variables in CSS/Tailwind.
3. **Full Implementation:** Write complete, production-ready, fully animated code featuring levitating 3D visual containers, spring micro-interactions, and ScrollTrigger choreography. Never leave `// TODO` comments or truncated placeholders.
