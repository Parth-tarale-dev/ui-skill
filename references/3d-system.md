# 3D Visual & Interactive WebGL System Recipes

## 1. Curated 3D Asset Libraries Reference

| Library | URL | Best For | Typical Format |
| :--- | :--- | :--- | :--- |
| **3dicons** | `https://3dicons.co` | Feature cards, bento grids, badges, empty states | PNG, GLTF, FBX, Blender |
| **Icons8 3D** | `https://icons8.com/3d` | Avatars, character illustrations, onboarding steps | PNG, GLTF, OBJ |
| **Thiings** | `https://thiings.co/things` | Isometric UI props, product category icons | PNG, GLTF, WebP |
| **Wannathis** | `https://wannathis.one/illustrations` | Iridescent & frosted glass abstract sculptures | PNG, GLTF, Figma |
| **Artify 3D** | `https://artify.co/3d-lettering` | 3D inflated/glossy typographic section headers | PNG, PSD |
| **Fuwatale** | `https://fuwatale.com` | Stylized, cute floating props & friendly icons | PNG, 3D Assets |

---

## 2. Floating Levitation Wrapper (`motion/react`)

```tsx
"use client";

import { motion } from "motion/react";
import Image from "next/image";

interface Floating3DAssetProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  glowColor?: string;
  delay?: number;
  className?: string;
}

export function Floating3DAsset({
  src,
  alt,
  width = 160,
  height = 160,
  glowColor = "rgba(56, 189, 248, 0.25)",
  delay = 0,
  className = "",
}: Floating3DAssetProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient Radial Backlight */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-full blur-2xl opacity-75"
        style={{ background: glowColor }}
      />

      {/* Levitating Asset Container */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 1.5, -1, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className="relative z-10 drop-shadow-[0_16px_24px_rgba(0,0,0,0.4)]"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority
          className="select-none object-contain pointer-events-none"
        />
      </motion.div>
    </div>
  );
}
```

---

## 3. 3D Perspective Card Tilt (`motion/react`)

```tsx
"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function PerspectiveTiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative perspective-1000 ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
```

---

## 4. React Three Fiber Interactive 3D Canvas Boilerplate

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

function HeroGeometry() {
  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh castShadow receiveShadow>
        <torusKnotGeometry args={[1, 0.35, 128, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.15}
          metalness={0.85}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

export function InteractiveHero3D() {
  return (
    <div className="relative h-[480px] w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <HeroGeometry />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
```

---

## 5. Spline 3D Scene Lazy Loader

```tsx
"use client";

import React, { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export function SplineHeroScene({ sceneUrl }: { sceneUrl: string }) {
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        }
      >
        <Spline scene={sceneUrl} className="h-full w-full" />
      </Suspense>
    </div>
  );
}
```
