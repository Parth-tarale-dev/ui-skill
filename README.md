# 🎨 UI Skill (`ui-skill`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Antigravity Compatible](https://img.shields.io/badge/Antigravity-Ready-6366f1.svg)](https://github.com/Parth-tarale-dev)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer-ff0055.svg)](https://motion.dev)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-0ae448.svg)](https://gsap.com)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black.svg)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com)

> An executable skill system that turns an AI coding agent into an elite Design Engineer: taste, motion, 3D, and a **95/100 static quality gate** it must pass before it can call a UI done.

It stays **dormant** (`alwaysApply: false`, zero background token cost) until you say **"use UI skill"**.

---

## Quick start

```powershell
# 1. Install into a project (Windows / PowerShell)
.\install.ps1 -Target "D:\projects\my-app"

# 2. In that project, install the UI + motion dependencies
node .antigravity/skills/ui-skill/scripts/init-ui-stack.mjs            # core
node .antigravity/skills/ui-skill/scripts/init-ui-stack.mjs --with-3d  # + three, R3F, drei

# 3. Tell your agent:
#    "use UI skill on the pricing page"
```

If script execution is blocked: `powershell -ExecutionPolicy Bypass -File .\install.ps1`.

On macOS / Linux, copy `SKILL.md`, `references/`, `templates/` and `scripts/` into `.antigravity/skills/ui-skill/` by hand, and place the trigger rule from `install.ps1` at `.antigravity/rules/ui-skill.md`.

---

## What's inside

```
ui-skill/
├── SKILL.md                         # Master router, trigger, workflow, 95/100 Craft Gate
├── references/
│   ├── design-tokens.md             # OKLCH tokens, surfaces, type scale, bento grids, glows
│   ├── archetypes.md                # 4 switchable aesthetic personas
│   ├── motion-recipes.md            # Framer Motion + GSAP useGSAP + Lenis recipes
│   └── 3d-system.md                 # 6 asset libraries + R3F / Spline / WebGL safeguards
├── templates/
│   ├── BentoSpotlightCard.tsx       # Cursor spotlight on border + surface
│   ├── MagneticButton.tsx           # Magnetic spring pull, 3 variants
│   ├── ThreeDStage.tsx              # Levitation, tilt, back-glow, floor shadow for 3D assets
│   └── SmoothScrollProvider.tsx     # Lenis wired into GSAP ScrollTrigger
├── scripts/
│   ├── init-ui-stack.mjs            # Detects package manager, installs missing deps, creates cn()
│   └── audit-ui.mjs                 # Static Craft Gate scanner
├── install.ps1                      # One-click installer for any project
└── .antigravity/                    # Synced copy: skills/ui-skill/ and rules/ui-skill.md
```

### The four archetypes
| Archetype | For |
|---|---|
| **Linear / Raycast Dark** (default) | SaaS, dev tools, dashboards |
| **Apple Spatial / Vision** | Product and hardware showcases |
| **Neo-Brutalist / Gumroad** | Creator tools, playful apps |
| **Editorial / Stripe Craft** | Fintech, luxury, editorial |

### The 3D asset libraries
[`3dicons.co`](https://3dicons.co) · [`icons8.com/3d`](https://icons8.com/3d) · [`thiings.co/things`](https://thiings.co/things) · [`wannathis.one/illustrations`](https://wannathis.one/illustrations) · [`artify.co/3d-lettering`](https://artify.co/3d-lettering) · [`fuwatale.com`](https://fuwatale.com)

These are external sites. Download the packs you need, **check each license**, and drop exports (WebP/PNG with alpha) into your project, e.g. `public/3d/`. The skill references assets by path and lists what you still need to download.

---

## The 95/100 Craft Gate

```bash
node .antigravity/skills/ui-skill/scripts/audit-ui.mjs            # scans ./src
node .antigravity/skills/ui-skill/scripts/audit-ui.mjs --src app  # another folder
node .antigravity/skills/ui-skill/scripts/audit-ui.mjs --json     # machine-readable
```

Score starts at 100; errors cost 5, warnings cost 2. **Pass = score ≥ 95 and zero errors.** Exit code is `1` on failure, so it works in CI.

| Gate check | Examples caught |
|---|---|
| 1. Tokens, not defaults | `bg-blue-500`, `text-gray-600`, `shadow-lg` |
| 2. Complete states | buttons / inputs missing `hover:`, `focus-visible:`, `active:`, `disabled:` |
| 3. No placeholder boxes | empty `bg-gray-*` divs, `via.placeholder.com`, `TODO` left in code |
| 4. 60fps motion | `transition-all`, GSAP inside `useEffect`, `useGSAP` without `scope`, animating `width`/`top`, no reduced-motion handling |
| 5. Responsive | 3+ column grids and `text-7xl` with no breakpoints, fixed widths ≥ 360px, touch targets under 44px, `w-screen` |

Suppress a deliberate exception with `// ui-audit-ignore-next-line` (or `ui-audit-ignore` on the same line, or `// ui-audit-disable-file`).

It is a **static** scan: it cannot see whether a focal area looks good or whether a layout holds at 320px. Review those by hand.

---

## Requirements

- Node 18+
- React 18 or 19, Tailwind CSS (v3 or v4), TypeScript
- Templates import `cn` from `@/lib/utils` (created for you by `init-ui-stack.mjs`) and need an `@/*` path alias

## License

MIT
