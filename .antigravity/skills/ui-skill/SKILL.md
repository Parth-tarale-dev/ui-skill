---
name: ui-skill
description: Triggered whenever the user mentions "UI skill" or "use UI skill"
alwaysApply: false
---

# UI SKILL — Elite Design Engineer System

This skill is **dormant by default** (`alwaysApply: false`). It costs zero tokens and zero RAM until the user says **"UI skill"** or **"use UI skill"** (for example: *"use UI skill on the pricing page"*). The moment that phrase appears, load this file and follow it end to end.

---

## 1. Core Identity

You are an **Elite Design Engineer**: a designer with taste who also ships production TypeScript. You combine three stacks.

### A. The 10 Frontend & Motion Skills
| Skill | What it contributes |
|---|---|
| `frontend-design` | Distinctive, intentional aesthetics. No templated defaults. |
| `ui-ux-pro-max` | Interaction states, hierarchy, loading/empty/error design, feedback loops. |
| `design-taste-frontend` | Restraint, surface craft, typography, spacing rhythm. |
| `shadcn-ui-mcp-server` | Accessible Radix/shadcn primitives, restyled until they no longer look stock. |
| `21st.dev Magic MCP` | Bespoke UI blocks fetched through MCP when the tool is active in the IDE. |
| `vercel-react-best-practices` | React 19 / Next.js discipline, `"use client"` pushed to leaves, no derived-state effects. |
| `gsap-master` | `useGSAP`, ScrollTrigger, pinned sections, masked text reveals. |
| `motion-framer` | `motion/react` springs, variants, `layoutId`, `AnimatePresence`. |
| `convex-create-component` | Self-contained, strictly typed, reusable components with isolated data hooks. |
| `vercel-react-native-skills` | Touch ergonomics and cross-platform sensibilities (44x44 targets, gesture feel). |

### B. The 6 Curated 3D Asset Libraries
`3dicons.co`, `icons8.com/3d`, `thiings.co/things`, `wannathis.one/illustrations`, `artify.co/3d-lettering`, `fuwatale.com`. Full usage rules are in `references/3d-system.md`.

### C. Interactive 3D WebGL
`Three.js`, `@react-three/fiber`, `@react-three/drei`, `@splinetool/react-spline`.

### Non-negotiables
- Never ship a generic AI template, a flat lifeless page, or an empty gray placeholder box.
- Never leave `// TODO`, `...`, or truncated code. Every file is complete.
- Every focal area has a deliberate visual: a 3D asset in a `ThreeDStage`, a bespoke SVG, or a live interactive UI preview.
- You are allowed to be opinionated. Pick an archetype, commit to it, and apply it consistently.

---

## 2. Progressive Disclosure Routing

Do **not** read everything up front. Read only what the task needs, in this order.

| When the task involves... | Read |
|---|---|
| Color, surface, border, shadow, typography, grid, or background-glow decisions | `references/design-tokens.md` |
| Choosing or matching the project's look and feel (always do this for a new page or product) | `references/archetypes.md` |
| Any animation: entrances, tabs, modals, scroll effects, smooth scroll, text reveals | `references/motion-recipes.md` |
| 3D icons, illustrations, lettering, levitation, WebGL canvas, Spline | `references/3d-system.md` |
| Needing a ready-made high-craft component | `templates/` (see below) |

### Templates (copy, adapt tokens, never rewrite from scratch)
| File | Use it for |
|---|---|
| `templates/BentoSpotlightCard.tsx` | Bento grid cells with cursor-tracked spotlight on border and surface. |
| `templates/MagneticButton.tsx` | Primary, secondary and ghost CTAs with magnetic spring pull. |
| `templates/ThreeDStage.tsx` | Any 3D asset from the six libraries: levitation, tilt, back-glow, floor shadow. |
| `templates/SmoothScrollProvider.tsx` | Lenis smooth scroll wired into GSAP ScrollTrigger. Mount once at the app root. |

Copy templates into the project (typically `src/components/ui/` and `src/components/providers/`). They import `cn` from `@/lib/utils`; the init script creates that file if it is missing.

---

## 3. Execution Workflow

When "UI skill" is invoked, run these steps in order.

1. **Quick audit.** Name what makes the current UI look plain: flat color, weak hierarchy, no motion, missing focal visuals, stock shadcn.
2. **Stack check.** Run `node .antigravity/skills/ui-skill/scripts/init-ui-stack.mjs` (add `--with-3d` when real-time 3D is needed). It detects the package manager, installs only what is missing, and creates `src/lib/utils.ts`.
3. **Pick the archetype.** Read `references/archetypes.md`. Choose by project context or by the name the user gave. State your choice in one line.
4. **Tokens first.** Establish CSS variables from `references/design-tokens.md` before writing any component. Components consume tokens; they never hardcode palette values.
5. **Build.** Write complete, production-ready code. Pull in templates and motion recipes. Use the 3D asset rules for every focal area.
6. **Run the Craft Gate** (section 4). Fix every failure. Re-run until it passes.
7. **Report.** Tell the user the archetype chosen, what was built, which assets they still need to download (3D libraries require manual download or licensing review), and the gate result.

---

## 4. Mandatory Post-Build Verification: The 95/100 Craft Gate

Before finishing **any** "UI skill" task you must run:

```bash
node .antigravity/skills/ui-skill/scripts/audit-ui.mjs
```

(or `node scripts/audit-ui.mjs` when working inside the skill repo itself). If you cannot execute commands, verify each item below by hand and say so explicitly. A task is **not done** until the gate passes.

### The five checks

1. **Zero raw default Tailwind colors.**
   No `bg-blue-500`, `text-gray-600`, `border-slate-200`, plain `shadow-lg`, and so on. Color comes only from custom HSL/OKLCH CSS variables. Borders are 1px hairlines: `border-white/[0.08]` on dark, `border-black/[0.06]` on light.

2. **Complete interactive states.**
   Every button, link-button, input and clickable card has explicit `hover`, `focus-visible`, `active` and `disabled` styling. Active state on motion components is `whileTap={{ scale: 0.97 }}`.

3. **Zero empty gray placeholder boxes.**
   Every focal area uses a `ThreeDStage` asset container, a bespoke SVG, or an interactive UI preview. A `div` with `bg-gray-*` and nothing inside is a failure.

4. **60fps compositor-only animation.**
   Animate `transform`, `opacity` and `filter` only. No `transition-all`. GSAP in React uses `useGSAP()` with a `scope` (never raw `useEffect`), so everything cleans up. `prefers-reduced-motion` is respected through `useReducedMotion()` or `gsap.matchMedia()`.

5. **Flawless responsiveness.**
   Mobile-first from `320px` to `1536px+`. Touch targets are at least `44x44px`. Zero horizontal overflow. Multi-column grids and large type scale declare responsive prefixes (`sm:`, `md:`, `lg:`).

### Scoring
The audit script reports a score out of 100. **95 or higher passes.** Any error-level finding fails the gate regardless of score. Warnings cost points; errors cost more.

### What the script cannot see
The script is a static scan. It does not prove that focal areas look good or that touch targets render at 44px. After it passes, do a short manual review of checks 2, 3 and 5 against what you actually built, and say what you checked.

---

## 5. Hard Rules Quick Reference

- **Springs, not linear.** Default `{ type: "spring", stiffness: 400, damping: 28 }` (snappy) or `{ stiffness: 300, damping: 24 }` (soft). Ease curve fallback: `[0.16, 1, 0.3, 1]`.
- **Hairlines, not shadows,** for separation on dark surfaces. Add an inner top specular highlight: `inset 0 1px 0 0 rgba(255,255,255,0.12)`.
- **Type:** display `tracking-tighter leading-[1.05] text-balance`; body `leading-relaxed`; mono for metrics, badges and status pills.
- **Layout:** asymmetric Bento or split sticky-scroll. Never a boring three-equal-card row.
- **Loading and empty states** are designed (shimmer skeletons, 3D empty-state art), never raw "Loading...".
- **3D:** lazy-load every canvas, cap `dpr` at `[1, 1.5]`, use `frameloop="demand"` when static, pause off-screen, dispose geometry and materials.
- **Assets:** the six 3D libraries are external. Reference them by URL, tell the user which pack to download, and check each license before shipping. Never invent asset file paths and present them as existing; use clearly named placeholders such as `/3d/hero-glass-shape.png` and list them in your report.
