"use client";

import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MagneticButtonVariant = "primary" | "secondary" | "ghost";
export type MagneticButtonSize = "sm" | "md" | "lg";

export interface MagneticButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: MagneticButtonVariant;
  size?: MagneticButtonSize;
  /** Shows the arrow icon that nudges right on hover. */
  arrow?: boolean;
  /** Pull strength: fraction of cursor offset the button follows. 0.2 to 0.5 feels right. */
  strength?: number;
  /** Distance in px from the button edge at which the pull begins. */
  reach?: number;
}

const variants: Record<MagneticButtonVariant, string> = {
  primary: cn(
    "bg-accent text-accent-foreground",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_24px_-8px_var(--accent-glow)]",
    "hover:brightness-110 active:brightness-95",
  ),
  secondary: cn(
    "border border-border bg-surface text-foreground shadow-card",
    "hover:border-border-strong hover:bg-surface-raised active:bg-surface",
  ),
  ghost: cn(
    "bg-transparent text-muted",
    "hover:bg-white/[0.06] hover:text-foreground active:bg-white/[0.03]",
  ),
};

const sizes: Record<MagneticButtonSize, string> = {
  sm: "min-h-11 min-w-11 gap-1.5 px-4 text-sm",
  md: "min-h-11 min-w-11 gap-2 px-5 text-sm",
  lg: "min-h-12 min-w-12 gap-2.5 px-7 text-base",
};

/**
 * Tactile button with a magnetic pull toward the cursor.
 * The pull is computed from the cursor's distance to the wrapper's (untransformed) center,
 * so the measurement never feeds back into itself.
 * Disabled for touch devices, `disabled` buttons, and reduced motion.
 */
export function MagneticButton({
  children,
  className,
  variant = "primary",
  size = "md",
  arrow = false,
  strength = 0.35,
  reach = 80,
  disabled,
  style,
  type = "button",
  ...rest
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLSpanElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 150, damping: 15, mass: 0.2 });
  const y = useSpring(rawY, { stiffness: 150, damping: 15, mass: 0.2 });

  // Label drifts a little further than the shell: subtle parallax inside the button.
  const labelX = useTransform(x, (v) => v * 0.35);
  const labelY = useTransform(y, (v) => v * 0.35);

  useEffect(() => {
    if (reduce || disabled) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = wrapRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;

        // Distance from the button's edge (0 when the cursor is over it).
        const edgeX = Math.max(Math.abs(dx) - rect.width / 2, 0);
        const edgeY = Math.max(Math.abs(dy) - rect.height / 2, 0);
        const distance = Math.hypot(edgeX, edgeY);

        if (distance > reach) {
          rawX.set(0);
          rawY.set(0);
          return;
        }

        // Ease the pull in as the cursor gets closer.
        const proximity = 1 - distance / reach;
        rawX.set(dx * strength * proximity);
        rawY.set(dy * strength * proximity);
      });
    };

    const onLeaveWindow = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, [reduce, disabled, reach, strength, rawX, rawY]);

  return (
    <span ref={wrapRef} className="inline-flex">
      <motion.button
        type={type}
        disabled={disabled}
        style={{ ...style, x, y }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className={cn(
          "group relative inline-flex select-none items-center justify-center rounded-xl font-medium",
          "transition-[background-color,border-color,color,filter,box-shadow] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...rest}
      >
        <motion.span style={{ x: labelX, y: labelY }} className="inline-flex items-center gap-[inherit]">
          <span>{children}</span>
          {arrow && (
            <ArrowRight
              aria-hidden
              strokeWidth={1.75}
              className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 group-disabled:translate-x-0 motion-reduce:transition-none"
            />
          )}
        </motion.span>
      </motion.button>
    </span>
  );
}

export default MagneticButton;
