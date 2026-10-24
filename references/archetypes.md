# Archetypes: 4 Switchable Aesthetic Personas

Pick **one** archetype per project and apply it everywhere. Mixing archetypes in a single product reads as indecision.

## How to choose

1. If the user names an archetype ("make it Neo-Brutalist"), use it.
2. Otherwise match project context:

| Project looks like... | Archetype |
|---|---|
| SaaS, developer tool, dashboard, AI product, internal tool | **Linear / Raycast Dark** (default) |
| Hardware, device, product launch, spatial/AR, premium consumer showcase | **Apple Spatial / Vision** |
| Creator tools, indie apps, marketplaces, playful consumer products, newsletters | **Neo-Brutalist / Gumroad** |
| Fintech, banking, luxury, editorial, agency, publishing, B2B with gravitas | **Editorial / Stripe Craft** |

3. If the context is ambiguous, use Linear / Raycast Dark and say so.
4. State the choice in one line before building: *"Archetype: Editorial / Stripe Craft (fintech dashboard)."*

Each archetype below overrides the default tokens in `design-tokens.md` only where it says so.

---

## 1. Linear / Raycast Dark (Default SaaS / DevTool)

**Feel:** precise, fast, quiet confidence. Dark, dense, keyboard-first.

| Aspect | Spec |
|---|---|
| Canvas | Obsidian `#08080a`, cards `#0f0f12` |
| Borders | `1px` `border-white/[0.08]`, strengthening to `white/[0.14]` on hover |
| Highlight | Inner top specular `inset 0 1px 0 0 rgba(255,255,255,0.12)` |
| Signature element | **Radial cursor spotlight cards** (`templates/BentoSpotlightCard.tsx`) |
| Motion | Snappy springs: `{ type: "spring", stiffness: 400, damping: 28 }`. Short travel (8-20px). Blur-up entrances. |
| Type | Geist / Inter. Display `tracking-tighter`. Geist Mono for metrics, shortcuts, status pills. |
| Accent | One electric hue (violet `#7c6cff`). Used for primary CTA, focus ring, active states. |
| 3D assets | Abstract metallic / glass shapes from **`wannathis.one/illustrations`**, shown inside `ThreeDStage` with accent back-glow. |
| Layout | Asymmetric Bento, sticky split storytelling, command-palette motifs, product UI previews as hero visual. |
| Details | `kbd` chips, mono version badges, subtle grid or dot background at 3-4% opacity, ambient glow under hero. |

**Primary button:**
```tsx
className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_24px_-8px_var(--accent-glow)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
```

**Do:** product screenshots or live UI mocks as the hero. Hairlines everywhere.
**Don't:** gradients on every surface, rounded-full everything, more than one accent hue.

---

## 2. Apple Spatial / Vision (Product & Hardware Showcase)

**Feel:** weightless, translucent, cinematic. The product floats in space and the scroll is the camera.

| Aspect | Spec |
|---|---|
| Canvas | Deep near-black with a colored radial wash behind the product (`--accent-glow`) |
| Surfaces | Deep translucent glass: `backdrop-blur-2xl bg-white/[0.04]` |
| Borders | **Specular borders**: `1px border-white/[0.10]` plus top-edge highlight `inset 0 1px 0 0 rgba(255,255,255,0.18)`; optionally a conic-gradient border for hero cards |
| Signature element | **Z-axis `preserve-3d` hover tilts**: panels tilt toward the cursor, inner content sits at `translateZ(35px)` |
| Motion | GSAP `ScrollTrigger` **camera and model scrubs** (`scrub: 1`): the model rotates and travels as the user scrolls; pinned scenes with text swapping over the product |
| 3D | Interactive **Three.js / R3F** stage (`<Canvas dpr={[1, 1.5]}>`, `<Float>`, `<Environment preset="city" />`, `<ContactShadows />`) or a **Spline** scene. Use `ThreeDStage` for secondary imagery. |
| Type | Large, light-to-medium weight sans with generous tracking-tighter; spec labels in Geist Mono |
| Layout | Full-bleed scenes, 100dvh pinned sections, oversized product imagery, minimal copy |
| Details | Light leaks, soft floor reflection, spec tables in glass cards, smooth scroll via `SmoothScrollProvider` |

**Glass card:**
```tsx
className="rounded-3xl border border-white/[0.10] bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]"
```

**Do:** let the product dominate, scrub the camera, keep copy to a few words per scene.
**Don't:** stack more than two blurred layers (GPU cost), animate `backdrop-filter`, ship 3D without a static poster fallback on mobile.

---

## 3. Neo-Brutalist / Gumroad (Creator & Playful Apps)

**Feel:** loud, tactile, friendly. Physical objects on a warm desk.

| Aspect | Spec |
|---|---|
| Canvas | Warm cream `#f4f4f0` |
| Accents | High-contrast **acid** colors: acid lime `#d4ff3a`, hot pink, electric yellow. Pick two, not five. |
| Borders | Crisp **`2px solid #000`** on every card, button, input, badge |
| Shadows | **Hard offset, zero blur:** `shadow-[4px_4px_0px_0px_#000]` |
| Signature element | **Mechanical button press** |
| Motion | Short, bouncy springs `{ stiffness: 500, damping: 22 }`; wiggle on hover; sticker-like entrances with slight rotation |
| 3D assets | Isometric props from **`thiings.co/things`** as stickers; inflated glossy headers from **`artify.co/3d-lettering`** |
| Type | Space Grotesk / Bricolage Grotesque, heavy weights, JetBrains Mono for tags |
| Layout | Chunky grids, rotated stickers (`-rotate-2`), marquee strips, oversized buttons, visible structure |

**Mechanical press button (exact classes):**
```tsx
className="rounded-xl border-2 border-black bg-[#d4ff3a] px-5 py-2.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f0] disabled:pointer-events-none disabled:opacity-50"
```

**Card:**
```tsx
className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]"
```

This archetype is **light only**. Override the dark tokens: set `--background: #f4f4f0`, `--surface: #ffffff`, `--foreground: #000000`, `--border: #000000`.

**Do:** commit to the black outline everywhere; make hover and press feel physical.
**Don't:** use blur shadows, gradients, glassmorphism, or thin hairlines. Anything soft breaks the effect. (The hairline rule from `design-tokens.md` is replaced here by the 2px black outline.)

---

## 4. Editorial / Stripe Craft (Fintech & Luxury Web)

**Feel:** calm authority. Magazine-grade typography, immaculate spacing, restrained color.

| Aspect | Spec |
|---|---|
| Canvas | Crisp alabaster `#fafafa`; surfaces `#ffffff` |
| Dividers | **Hairline slate** `border-black/[0.06]`; use rules and whitespace more than boxes |
| Shadows | **Multi-layered ambient shadows**, never one heavy shadow |
| Type | **Serif + geometric sans pairing**: Fraunces / Instrument Serif for display, Inter or Geist for body, mono for figures |
| Motion | **Staggered masked headline reveals** (line-by-line `yPercent` slide inside `overflow-hidden`), slow gentle springs `{ stiffness: 200, damping: 26 }`, restrained parallax |
| 3D assets | Clay / stylized 3D icons from **`3dicons.co`** and **`fuwatale.com`** as feature icons, set small and precise |
| Accent | A single deep indigo or forest hue, used for links and one CTA per view |
| Layout | Editorial offset 12-column grids, wide margins, pull quotes, data tables with mono tabular figures, gradient mesh used sparingly in hero only |

**Multi-layered ambient shadow:**
```tsx
className="shadow-[0_1px_1px_rgba(24,24,27,0.04),0_2px_4px_rgba(24,24,27,0.04),0_8px_16px_rgba(24,24,27,0.05),0_24px_48px_-8px_rgba(24,24,27,0.08)]"
```

**Masked headline reveal** wiring lives in `motion-recipes.md` (GSAP, `yPercent: 110, rotate: 2, stagger: 0.04, ease: "power4.out"`).

Override tokens: light is the primary mode; ship dark only if asked.

**Do:** let typography carry the page. Use mono tabular figures for every number.
**Don't:** use saturated gradients on surfaces, bouncy springs, or emoji.

---

## Archetype Quick Matrix

| | Linear / Raycast | Apple Spatial | Neo-Brutalist | Editorial / Stripe |
|---|---|---|---|---|
| Mode | Dark | Dark | Light | Light |
| Border | 1px white/8% | 1px white/10% glass | 2px black | 1px black/6% |
| Shadow | Specular + soft | Specular + glow | Hard offset 4px | Layered ambient |
| Spring | 400 / 28 | 300 / 30 | 500 / 22 | 200 / 26 |
| Hero visual | Product UI + metallic 3D | R3F / Spline scene | Sticker props + 3D lettering | Serif type + clay icons |
| 3D source | wannathis.one | Three.js / Spline | thiings.co + artify.co | 3dicons.co + fuwatale.com |
| Signature | Cursor spotlight | Tilt + scroll scrub | Mechanical press | Masked headline reveal |

`icons8.com/3d` characters fit any archetype for onboarding and testimonials; style them to match (clay for Editorial, glossy for Neo-Brutalist).
