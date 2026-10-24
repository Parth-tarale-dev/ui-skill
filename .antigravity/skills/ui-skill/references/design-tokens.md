# Design Tokens: Taste, Surfaces & Typography

Read this before writing any component. Components **consume** tokens; they never hardcode palette values.

Principles:
1. Color lives in CSS variables, written as **OKLCH** (with the hex noted for reference).
2. Separation comes from **1px hairline borders and surface steps**, not heavy drop shadows.
3. Depth comes from an **inner top specular highlight** plus soft ambient glow behind focal elements.
4. One accent color. Used sparingly, with intent.

---

## 1. CSS Variable System

Paste into `src/app/globals.css` (or your global stylesheet). Dark is the default; light activates via `.light` or `[data-theme="light"]`, or by system preference when no theme is set.

```css
@layer base {
  :root,
  .dark,
  [data-theme="dark"] {
    color-scheme: dark;

    /* Surfaces: deep obsidian */
    --background: oklch(0.135 0.005 286);        /* #08080a */
    --surface: oklch(0.170 0.006 286);           /* #0f0f12 elevated card */
    --surface-raised: oklch(0.202 0.010 285);    /* #16161b popovers, menus */

    /* Text */
    --foreground: oklch(0.947 0.004 286);        /* #ededf0 */
    --foreground-muted: oklch(0.712 0.013 286);  /* #a1a1aa */
    --foreground-subtle: oklch(0.532 0.017 286); /* #6b6b76 */

    /* Hairlines */
    --border: rgba(255, 255, 255, 0.08);
    --border-strong: rgba(255, 255, 255, 0.14);
    --highlight: rgba(255, 255, 255, 0.12);      /* inner top specular */

    /* Accent: electric violet */
    --accent: oklch(0.624 0.210 283);            /* #7c6cff */
    --accent-foreground: oklch(0.985 0 0);
    --accent-glow: oklch(0.624 0.210 283 / 0.35);

    /* Status */
    --success: oklch(0.78 0.17 155);
    --warning: oklch(0.82 0.15 80);
    --danger: oklch(0.68 0.21 25);

    /* Ring */
    --ring: oklch(0.624 0.210 283 / 0.6);

    /* Composite shadows */
    --shadow-card:
      inset 0 1px 0 0 var(--highlight),
      0 1px 2px rgba(0, 0, 0, 0.4),
      0 12px 32px -12px rgba(0, 0, 0, 0.6);
    --shadow-pop:
      inset 0 1px 0 0 var(--highlight),
      0 2px 4px rgba(0, 0, 0, 0.35),
      0 24px 60px -16px rgba(0, 0, 0, 0.75);
  }

  .light,
  [data-theme="light"] {
    color-scheme: light;

    /* Surfaces: warm alabaster */
    --background: oklch(0.985 0.001 106);        /* #fafaf9 */
    --surface: oklch(1 0 0);                     /* #ffffff */
    --surface-raised: oklch(1 0 0);

    --foreground: oklch(0.210 0.006 286);        /* #18181b */
    --foreground-muted: oklch(0.442 0.015 286);  /* #52525b */
    --foreground-subtle: oklch(0.552 0.014 286); /* #71717a */

    --border: rgba(0, 0, 0, 0.06);
    --border-strong: rgba(0, 0, 0, 0.12);
    --highlight: rgba(255, 255, 255, 0.9);

    --accent: oklch(0.550 0.253 278);            /* #5b4bff */
    --accent-foreground: oklch(0.985 0 0);
    --accent-glow: oklch(0.550 0.253 278 / 0.25);

    --success: oklch(0.62 0.16 155);
    --warning: oklch(0.7 0.15 75);
    --danger: oklch(0.58 0.22 25);

    --ring: oklch(0.550 0.253 278 / 0.5);

    --shadow-card:
      inset 0 1px 0 0 var(--highlight),
      0 1px 2px rgba(24, 24, 27, 0.05),
      0 8px 24px -8px rgba(24, 24, 27, 0.08);
    --shadow-pop:
      inset 0 1px 0 0 var(--highlight),
      0 2px 4px rgba(24, 24, 27, 0.06),
      0 20px 48px -12px rgba(24, 24, 27, 0.16);
  }

  * { border-color: var(--border); }
  html { background: var(--background); color: var(--foreground); }
  body { overflow-x: hidden; }
}
```

### Tailwind v4 mapping (`@theme inline`)

```css
@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-foreground: var(--foreground);
  --color-muted: var(--foreground-muted);
  --color-subtle: var(--foreground-subtle);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-ring: var(--ring);
  --shadow-card: var(--shadow-card);
  --shadow-pop: var(--shadow-pop);
  --font-display: var(--font-display), ui-serif, Georgia, serif;
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, "JetBrains Mono", monospace;
}
```

### Tailwind v3 mapping (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        foreground: "var(--foreground)",
        muted: "var(--foreground-muted)",
        subtle: "var(--foreground-subtle)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        ring: "var(--ring)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
};

export default config;
```

---

## 2. Surface Recipes

Use these exact class strings as starting points.

**Dark card (default):**
```tsx
className="rounded-2xl border border-white/[0.08] bg-surface shadow-card"
```

**Light card:**
```tsx
className="rounded-2xl border border-black/[0.06] bg-surface shadow-card"
```

**Theme-aware card (preferred):**
```tsx
className="rounded-2xl border border-border bg-surface shadow-card"
```

**Spec for the dark specular highlight** (when you need it inline):
```tsx
className="shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
```

**Glass panel (Apple Spatial archetype):**
```tsx
className="rounded-3xl border border-white/[0.10] bg-white/[0.04] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]"
```

**Focus ring (every interactive element):**
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

**Disabled (every interactive element):**
```tsx
className="disabled:pointer-events-none disabled:opacity-50"
```

---

## 3. Typography Scale

Load three families through `next/font` (or `@fontsource`): a display face, a body sans, and a mono.

| Role | Classes | Notes |
|---|---|---|
| Display (hero) | `font-display text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.05] text-balance` | One per page. Tight and confident. |
| Heading 1 | `font-display text-4xl sm:text-5xl tracking-tighter leading-[1.05] text-balance` | |
| Heading 2 | `font-display text-2xl sm:text-3xl tracking-tight leading-[1.15] text-balance` | |
| Heading 3 | `font-sans text-lg font-medium tracking-tight` | |
| Body | `font-sans text-base leading-relaxed text-muted` | Keep line length at 60-72ch (`max-w-prose`). |
| Small | `font-sans text-sm leading-relaxed text-muted` | |
| Mono metric | `font-mono text-3xl tabular-nums tracking-tight` | Numbers align; use `tabular-nums`. |
| Mono badge / pill | `font-mono text-[11px] uppercase tracking-[0.08em]` | Status pills, version tags, kbd. |

Recommended pairings (match the archetype):
- Linear / Raycast Dark: **Geist** (sans + display) with **Geist Mono**.
- Apple Spatial / Vision: **Inter Display** or **SF-like** sans with **Geist Mono**.
- Neo-Brutalist / Gumroad: **Space Grotesk** or **Bricolage Grotesque** with **JetBrains Mono**.
- Editorial / Stripe Craft: **Fraunces** or **Instrument Serif** display with **Inter** and **JetBrains Mono**.

### `next/font` setup

```tsx
import { Geist, Geist_Mono } from "next/font/google";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} data-theme="dark">
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
```

### Status pill

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
  <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
  Operational
</span>
```

---

## 4. Bento & Asymmetric Grids

Never ship three equal cards in a row. Use one of these.

### 4a. Asymmetric Bento (desktop 6 columns, collapses cleanly)

```tsx
<section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-6 lg:grid-rows-[repeat(3,minmax(0,1fr))] lg:gap-5">
  <div className="lg:col-span-4 lg:row-span-2">{/* hero feature, 3D stage */}</div>
  <div className="lg:col-span-2">{/* metric */}</div>
  <div className="lg:col-span-2">{/* integration */}</div>
  <div className="sm:col-span-2 lg:col-span-3">{/* wide */}</div>
  <div className="sm:col-span-2 lg:col-span-3">{/* wide */}</div>
</section>
```

Mobile: single column, natural order. `sm`: two columns, wide cards span both. `lg`: the six-column composition above.

### 4b. Split sticky-scroll storytelling

Left column sticks while right column's steps scroll past. Collapses to stacked on mobile.

```tsx
<section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20">
  <div className="lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)] lg:self-start">
    {/* sticky visual: ThreeDStage or live UI preview */}
  </div>
  <div className="flex flex-col gap-24 lg:gap-[40vh] lg:py-[20vh]">
    <article>{/* step 1 */}</article>
    <article>{/* step 2 */}</article>
    <article>{/* step 3 */}</article>
  </div>
</section>
```

### 4c. Editorial offset (Stripe Craft)

```tsx
<div className="grid grid-cols-1 gap-12 md:grid-cols-12">
  <header className="md:col-span-5 md:col-start-1">{/* heading */}</header>
  <div className="md:col-span-6 md:col-start-7">{/* content */}</div>
</div>
```

---

## 5. Ambient Background Glows

Soft radial light behind focal elements. Always `pointer-events-none`, always behind content, always compositor-cheap (static blur, never animated blur radius).

**Section-level glow:**
```tsx
<div className="relative isolate overflow-hidden">
  <div
    aria-hidden
    className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent blur-3xl opacity-20"
  />
  {/* content */}
</div>
```

**Card corner glow (for hover spotlight see `templates/BentoSpotlightCard.tsx`):**
```tsx
<div
  aria-hidden
  className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent blur-3xl opacity-20"
/>
```

**Hero radial wash (no blur element needed):**
```css
.hero-wash {
  background:
    radial-gradient(60% 50% at 50% 0%, var(--accent-glow), transparent 70%),
    var(--background);
}
```

**Subtle grain** (kills banding on large gradients, optional):
```css
.grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
```

---

## 6. Spacing & Radius Rhythm

- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`. Section vertical padding: `py-20 sm:py-28 lg:py-36`.
- Radius: cards `rounded-2xl` (16), large panels `rounded-3xl` (24), buttons and inputs `rounded-xl` (12), pills `rounded-full`. Nested radius rule: inner radius = outer radius minus padding.
- Container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.
- Touch targets: interactive elements are at least `min-h-11 min-w-11` (44px).

---

## 7. Banned Patterns (the audit script enforces these)

| Banned | Use instead |
|---|---|
| `bg-blue-500`, `text-gray-600`, `border-slate-200` (any default palette color + number) | Token classes: `bg-accent`, `text-muted`, `border-border` |
| `shadow-lg`, `shadow-xl`, `shadow-md` | `shadow-card`, `shadow-pop`, or an explicit composite shadow |
| `transition-all` | `transition-[transform,opacity]` or `transition-colors` |
| `bg-gray-*` empty boxes as image stand-ins | `ThreeDStage`, bespoke SVG, or live UI preview |
| Raw `Loading...` text | Shimmer skeleton |
| `border` with no color token on dark surfaces | `border border-white/[0.08]` or `border-border` |
