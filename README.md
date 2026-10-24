# 🎨 Master UI Skill (`ui-skill`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Antigravity Compatible](https://img.shields.io/badge/Antigravity-Ready-6366f1.svg)](https://github.com/Parth-tarale-dev)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer-ff0055.svg)](https://motion.dev)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-0ae448.svg)](https://gsap.com)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black.svg)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com)

> **World-Class Frontend Architecture, Taste, Micro-Interactions, Motion & Complete 3D Visual System for AI Coding Assistants.**

Turn ordinary, flat, generic AI-generated interfaces into state-of-the-art, high-craft web applications with fluid physics, 3D levitation, bespoke design tokens, and scroll-linked choreography.

---

## ✨ Features & Capabilities

### 1. 💎 Aesthetic Direction & Design Taste
* **Anti-Generic Mandate**: Replaces default, harsh Tailwind colors with curated HSL/OKLCH token systems (deep zinc/black `#09090b` dark modes, warm editorial `#fafaf9` light modes).
* **Depth & Surfaces**: Layered glassmorphism (`backdrop-blur-xl`), crisp 1px hairline borders (`border-white/[0.08]`), specular top highlights, and radial ambient backlight glows.
* **Typographic Hierarchy**: High-contrast pairing with tight headline tracking (`tracking-tight`), `text-balance`, and comfortable line-height for readability.
* **Bento Grids & Layouts**: Asymmetric Bento grids and split sticky-scroll sections over repetitive equal-column layouts.

### 2. ⚡ Complete Motion & Physics Engine
* **Natural Spring Dynamics**: Fluid spring transitions (`stiffness: 300, damping: 24`) — no robotic linear easing.
* **Staggered Orchestration**: Automatic entrance staggering for lists, grids, and cards with progressive blur-to-focus reveals.
* **Shared Layout Transitions**: Dynamic sliding pill tabs, expandable cards, and morphing layout states using `layoutId`.
* **GSAP Timeline & ScrollTrigger**: Clean `useGSAP` integration with automatic cleanup, pinned parallax heroes, and scrubbed scroll storytelling.
* **60fps Compositor-Only Rules**: Strictly animating `transform` and `opacity` to eliminate layout thrashing.

### 3. 🪐 Complete 3D UI & WebGL System
* **Curated 3D Asset Integration**: Pre-indexed references to open-source and free 3D visual libraries:
  * [`3dicons.co`](https://3dicons.co) — Open-source 3D UI icons (clay, gradient, metallic).
  * [`icons8.com/3d`](https://icons8.com/3d) — Avatars, character illustrations, and onboarding flows.
  * [`thiings.co/things`](https://thiings.co/things) — Isometric everyday objects and category badges.
  * [`wannathis.one/illustrations`](https://wannathis.one/illustrations) — Abstract 3D glass and metallic shapes for hero sections.
  * [`artify.co/3d-lettering`](https://artify.co/3d-lettering) — 3D inflated and glossy typographic headers.
  * [`fuwatale.com`](https://fuwatale.com) — Hand-crafted floating props and friendly icons.
* **Interactive 3D Engines**: Ready-to-use boilerplates for **React Three Fiber** (`@react-three/fiber`, `@react-three/drei`), **Three.js**, and lazy-loaded **Spline** (`@splinetool/react-spline`).
* **Micro-3D Effects**: Interactive mouse-tracking perspective card tilt (`transformStyle: "preserve-3d"`) and ambient levitation loops.

### 4. 🛠️ Micro-Ergonomics & Architecture
* **State Completeness**: Accessible `focus-visible` rings, active spring presses (`scale: 0.97`), hover micro-lifts, and disabled states.
* **Zero-Jank Fallbacks**: Shimmer skeleton loaders and designed empty states instead of raw `"Loading..."` text.
* **React 19 & Next.js Best Practices**: Server-component friendly; push `"use client"` down to animated leaf nodes.

---

## 📂 Repository Structure

```
ui-skill/
├── SKILL.md                     # Core skill definition and activation rules
├── references/
│   ├── 3d-system.md             # 3D asset links, levitation & WebGL boilerplates
│   ├── design-tokens.md         # OKLCH/HSL palettes, surface recipes & action hierarchy
│   └── motion-recipes.md        # Spring physics, staggered variants & GSAP patterns
├── .gitignore
├── LICENSE                      # MIT License
└── README.md
```

---

## 🚀 Installation & Setup

### Option 1: Google Antigravity / Gemini CLI

#### Global Installation (Available across all your projects):
```bash
# Clone directly into your global skills directory:
git clone https://github.com/Parth-tarale-dev/ui-skill.git ~/.gemini/config/skills/ui-skill
```

#### Workspace Installation (For a specific project):
```bash
# In your project root:
mkdir -p .agents/skills
git clone https://github.com/Parth-tarale-dev/ui-skill.git .agents/skills/ui-skill
```

---

### Option 2: Claude Code

Add the skill directory to your Claude skills configuration:
```bash
git clone https://github.com/Parth-tarale-dev/ui-skill.git ~/.claude/skills/ui-skill
```
Or reference `SKILL.md` directly inside your `CLAUDE.md`.

---

### Option 3: Cursor / Windsurf

Copy `SKILL.md` or symlink the folder into your project `.cursorrules` or `.windsurfrules`:
```bash
cat SKILL.md >> .cursorrules
```

---

## 💡 How to Trigger

Whenever you are interacting with your AI agent, prompt:

```text
"use UI skill on this page"
```
or
```text
"Redesign this dashboard using UI skill"
```

The AI agent will immediately:
1. Audit the interface for generic styles, missing contrast, and lifeless layouts.
2. Configure recommended dependencies (`motion`, `gsap`, `@gsap/react`, `lucide-react`, `clsx`, `tailwind-merge`).
3. Apply cohesive HSL/OKLCH design tokens, 1px specular borders, and layered glassmorphism.
4. Inject fluid spring micro-interactions, floating 3D anchors, and buttery entrance animations.

---

## 📦 Recommended Dependencies

When building a project with `ui-skill`, install:

```bash
# Core animation & styling
npm install motion gsap @gsap/react lucide-react clsx tailwind-merge

# Optional: Interactive 3D / WebGL
npm install three @react-three/fiber @react-three/drei @splinetool/react-spline
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and distribute in personal or commercial projects.
