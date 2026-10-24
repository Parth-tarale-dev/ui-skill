# Design Tokens & Aesthetic Craft

## 1. Color Palettes (OKLCH & HSL)

### Elite Dark Mode Base
```css
:root {
  --background: 240 10% 3.9%;      /* #09090b - Deep zinc/black */
  --surface: 240 5.9% 10%;         /* #18181b - Elevated card */
  --surface-raised: 240 5.2% 16%;  /* #27272a - Popover / Dropdown */
  --border-subtle: 0 0% 100% / 0.08; /* Hairline border */
  --highlight-inner: 0 0% 100% / 0.12; /* Top-edge specular highlight */
}
```

### Editorial Warm Light Mode Base
```css
:root {
  --background: 60 4.8% 95.9%;     /* #fafaf9 - Warm stone */
  --surface: 0 0% 100%;            /* Pure white surface */
  --surface-raised: 60 9.1% 97.8%; /* #fbfbfa */
  --border-subtle: 0 0% 0% / 0.06;
}
```

---

## 2. Surface & Depth Styling Recipes

### Premium Glassmorphism Card
```tsx
<div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all hover:border-white/[0.16] hover:bg-white/[0.05]">
  {/* Ambient Radial Glow */}
  <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
  
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```

### 1-Second Visual Action Hierarchy
- **Primary CTA**: High-contrast solid fill with top inner highlight and glow on hover:
  `bg-white text-zinc-950 shadow-[0_0_24px_-4px_rgba(255,255,255,0.4),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:scale-[1.02] active:scale-[0.98]`
- **Secondary CTA**: Translucent surface with hairline border:
  `bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.1]`
- **Tertiary CTA**: Ghost button with text hover transition:
  `text-zinc-400 hover:text-white transition-colors`
