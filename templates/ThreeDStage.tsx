"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useCallback, useId, useState, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Stage for pre-rendered 3D assets (PNG / WebP / AVIF with alpha) from:
 *   3dicons.co, icons8.com/3d, thiings.co/things, wannathis.one/illustrations,
 *   artify.co/3d-lettering, fuwatale.com
 *
 * Layers (back to front):
 *   1. ambient colored back-glow  (blur-2xl opacity-30)
 *   2. floor shadow               (scales and fades in sync with the levitation)
 *   3. perspective tilt wrapper   (perspective 1000px, preserve-3d, mouse tracked)
 *   4. levitation wrapper         (y: [0,-12,0], rotateZ: [0,1.5,0])
 *   5. the asset, lifted translateZ(35px) for real parallax depth
 */

export type ThreeDStageSize = "sm" | "md" | "lg" | "xl";

export interface ThreeDStageProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Path or URL of the exported asset (webp/png/avif with alpha). */
  src: string;
  /** Meaningful alt text, or "" when the asset is purely decorative. */
  alt: string;
  /** Intrinsic pixel size of the exported asset. Prevents layout shift. */
  width: number;
  height: number;
  size?: ThreeDStageSize;
  /** Any CSS color for the back-glow, e.g. "var(--accent)" or "#ffb86b". */
  glowColor?: string;
  /** Continuous Y-axis levitation. */
  levitate?: boolean;
  /** Mouse-tracked 3D perspective tilt (fine pointers only). */
  tilt?: boolean;
  /** Soft floor shadow that scales as the asset rises and falls. */
  floorShadow?: boolean;
  /** Max tilt angle in degrees. */
  tiltRange?: number;
  /** Seconds to offset the levitation. Give sibling stages different delays. */
  delay?: number;
  /** Levitation cycle length in seconds. */
  duration?: number;
  /** Eager-load above-the-fold assets. */
  priority?: boolean;
}

const sizeClasses: Record<ThreeDStageSize, string> = {
  sm: "size-20 sm:size-24",
  md: "size-28 sm:size-36 lg:size-40",
  lg: "size-40 sm:size-52 lg:size-60",
  xl: "w-full max-w-[19rem] sm:max-w-[26rem] lg:max-w-[34rem] aspect-square",
};

const DEPTH_PX = 35;
const LEVITATE_PX = 12;

export function ThreeDStage({
  src,
  alt,
  width,
  height,
  size = "md",
  glowColor = "var(--accent)",
  levitate = true,
  tilt = true,
  floorShadow = true,
  tiltRange = 12,
  delay = 0,
  duration = 5,
  priority = false,
  className,
  onPointerMove,
  onPointerLeave,
  ...rest
}: ThreeDStageProps) {
  const reduce = useReducedMotion();
  const gradientId = useId();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const canLevitate = levitate && !reduce;
  const canTilt = tilt && !reduce;

  // Normalized pointer position inside the stage: -0.5 (left/top) to 0.5 (right/bottom).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 22, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 220, damping: 22, mass: 0.5 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-tiltRange, tiltRange]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [tiltRange, -tiltRange]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (!canTilt || event.pointerType === "touch") return;
      const rect = event.currentTarget.getBoundingClientRect();
      px.set((event.clientX - rect.left) / rect.width - 0.5);
      py.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [canTilt, onPointerMove, px, py],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      px.set(0);
      py.set(0);
    },
    [onPointerLeave, px, py],
  );

  const cycle = {
    duration,
    ease: "easeInOut" as const,
    repeat: Infinity,
    delay,
  };

  return (
    <div
      {...rest}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("relative isolate inline-block", sizeClasses[size], className)}
      style={{ perspective: "1000px", ...rest.style }}
    >
      {/* 1. Ambient back-glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8%] -z-10 rounded-full blur-2xl opacity-30"
        style={{ background: glowColor }}
      />

      {/* 2. Floor shadow: shrinks and fades as the asset rises */}
      {floorShadow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-[2%] left-1/2 -z-10 h-[6%] w-[58%] -translate-x-1/2 rounded-[50%] bg-black blur-md"
          initial={{ scaleX: 1, opacity: 0.4 }}
          animate={canLevitate ? { scaleX: [1, 0.78, 1], opacity: [0.4, 0.2, 0.4] } : { scaleX: 1, opacity: 0.4 }}
          transition={canLevitate ? cycle : { duration: 0 }}
        />
      )}

      {/* 3. Perspective tilt */}
      <motion.div
        className="size-full"
        style={{
          rotateX: canTilt ? rotateX : 0,
          rotateY: canTilt ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
      >
        {/* 4. Levitation */}
        <motion.div
          className="size-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={canLevitate ? { y: [0, -LEVITATE_PX, 0], rotateZ: [0, 1.5, 0] } : { y: 0, rotateZ: 0 }}
          transition={canLevitate ? cycle : { duration: 0 }}
        >
          {/* 5. The asset, lifted forward in Z */}
          {failed ? (
            <AssetFallback gradientId={gradientId} color={glowColor} />
          ) : (
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={cn(
                "size-full select-none object-contain transition-opacity duration-500",
                loaded ? "opacity-100" : "opacity-0",
              )}
              style={{ transform: `translateZ(${DEPTH_PX}px)` }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Loading shimmer: a soft orb, never a gray box */}
      {!loaded && !failed && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[18%] animate-pulse rounded-full opacity-20 blur-xl motion-reduce:animate-none"
          style={{ background: glowColor }}
        />
      )}
    </div>
  );
}

/** Bespoke SVG shown if the asset file is missing or fails to load. A designed orb, not an empty box. */
function AssetFallback({ gradientId, color }: { gradientId: string; color: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="3D asset placeholder"
      className="size-full"
      style={{ transform: `translateZ(${DEPTH_PX}px)` }}
    >
      <defs>
        <radialGradient id={`${gradientId}-body`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="35%" style={{ stopColor: color }} stopOpacity="0.95" />
          <stop offset="100%" style={{ stopColor: color }} stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id={`${gradientId}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="72" fill={`url(#${gradientId}-body)`} />
      <circle cx="100" cy="100" r="72" fill={`url(#${gradientId}-rim)`} />
      <ellipse cx="78" cy="72" rx="22" ry="12" fill="#ffffff" opacity="0.5" transform="rotate(-28 78 72)" />
    </svg>
  );
}

export default ThreeDStage;
