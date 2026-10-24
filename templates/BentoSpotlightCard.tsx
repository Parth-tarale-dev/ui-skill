"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "motion/react";
import { useCallback, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BentoSpotlightCardProps
  extends Omit<HTMLMotionProps<"div">, "children" | "onPointerMove" | "onPointerLeave" | "onPointerEnter"> {
  children: ReactNode;
  /** Spotlight radius in px. */
  radius?: number;
  /** Any CSS color. Defaults to the theme accent. */
  glowColor?: string;
  /** Renders the card as a focusable, pressable surface. */
  interactive?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
}

/**
 * Bento card with a cursor-tracked radial spotlight on both the 1px border and the card surface.
 * - Pointer position drives MotionValues (no React re-renders while moving).
 * - Inner top specular highlight + hairline border.
 * - Spring hover elevation, spring press.
 * - Spotlight is off on touch devices and with reduced motion (static ambient glow instead).
 */
export function BentoSpotlightCard({
  children,
  className,
  radius = 360,
  glowColor = "var(--accent)",
  interactive = false,
  disabled = false,
  onActivate,
  ...rest
}: BentoSpotlightCardProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(-radius);
  const mouseY = useMotionValue(-radius);

  // Smooth the spotlight so it trails the cursor slightly instead of snapping.
  const x = useSpring(mouseX, { stiffness: 400, damping: 28, mass: 0.6 });
  const y = useSpring(mouseY, { stiffness: 400, damping: 28, mass: 0.6 });

  // Surface glow (soft, wide) and border glow (tight, bright).
  const surfaceGlow = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, color-mix(in oklab, ${glowColor} 14%, transparent), transparent 70%)`;
  const borderGlow = useMotionTemplate`radial-gradient(${radius * 0.6}px circle at ${x}px ${y}px, color-mix(in oklab, ${glowColor} 70%, transparent), transparent 70%)`;

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled || reduce || event.pointerType === "touch") return;
      const rect = event.currentTarget.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    },
    [disabled, reduce, mouseX, mouseY],
  );

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled || event.pointerType === "touch") return;
      setHovered(true);
    },
    [disabled],
  );

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    mouseX.set(-radius);
    mouseY.set(-radius);
  }, [mouseX, mouseY, radius]);

  const showSpotlight = hovered && !reduce && !disabled;

  const interactiveProps = interactive
    ? {
        role: "button" as const,
        tabIndex: disabled ? -1 : 0,
        "aria-disabled": disabled || undefined,
        onClick: () => {
          if (!disabled) onActivate?.();
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onActivate?.();
          }
        },
      }
    : {};

  return (
    <motion.div
      {...interactiveProps}
      {...rest}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      whileHover={disabled || reduce ? undefined : { y: -3, scale: 1.005 }}
      whileTap={interactive && !disabled ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl p-px",
        "bg-border shadow-card",
        "transition-[box-shadow] duration-300 hover:shadow-pop",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        interactive && !disabled && "cursor-pointer",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {/* 1px border spotlight: sits behind the surface, revealed only by the 1px padding. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: showSpotlight ? borderGlow : undefined }}
      />

      {/* Card surface */}
      <div
        className={cn(
          "relative z-10 flex h-full flex-col overflow-hidden rounded-[calc(1rem-1px)] bg-surface p-5 sm:p-6",
          "shadow-[inset_0_1px_0_0_var(--highlight)]",
        )}
      >
        {/* Surface spotlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: showSpotlight ? surfaceGlow : undefined }}
        />

        {/* Static ambient glow: always present, also the reduced-motion / touch fallback. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full blur-3xl opacity-20"
          style={{ background: glowColor }}
        />

        {/* Top specular line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />

        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </div>
    </motion.div>
  );
}

export default BentoSpotlightCard;
