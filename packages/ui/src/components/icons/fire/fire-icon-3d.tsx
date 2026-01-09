"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "../../../lib/utils";

export interface FireIcon3DProps {
  /** Size in pixels */
  size?: number;
  /** Primary color (outer flame) */
  primaryColor?: string;
  /** Secondary color (middle flame) */
  secondaryColor?: string;
  /** Tertiary color (inner flame core) */
  tertiaryColor?: string;
  /** Whether to animate */
  isAnimating?: boolean;
  /** Animation intensity: calm, normal, intense */
  intensity?: "calm" | "normal" | "intense";
  /** Additional class names */
  className?: string;
}

// Default fire colors
const DEFAULT_COLORS = {
  primary: "#ef4444",
  secondary: "#f97316",
  tertiary: "#fbbf24",
};

interface FlameLayerProps {
  color: string;
  scale: number;
  position: [number, number, number];
  distortSpeed: number;
  distortIntensity: number;
  isAnimating: boolean;
}

/**
 * Individual flame layer with distortion effect
 */
function FlameLayer({
  color,
  scale,
  position,
  distortSpeed,
  distortIntensity,
  isAnimating,
}: FlameLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !isAnimating) return;

    // Subtle wobble animation
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.z = Math.sin(time * 2) * 0.1;
    meshRef.current.position.y = position[1] + Math.sin(time * 3) * 0.05;
  });

  // Create low-poly cone geometry for flame shape
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.5, 1.5, 4, 1); // 4 segments for low-poly look
    geo.translate(0, 0.75, 0); // Move pivot to base
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        speed={isAnimating ? distortSpeed : 0}
        distort={isAnimating ? distortIntensity : 0}
        roughness={0.4}
        metalness={0.1}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

interface SparkParticlesProps {
  color: string;
  count: number;
  isAnimating: boolean;
  speed: number;
}

/**
 * Particle system for sparks/embers
 */
function SparkParticles({ color, count, isAnimating, speed }: SparkParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Create particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Start at flame tip area
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = 0.8 + Math.random() * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      // Random upward velocity with slight spread
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      // Random lifetime offset
      lifetimes[i] = Math.random();
    }

    return { positions, velocities, lifetimes };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !isAnimating) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const { velocities, lifetimes } = particles;

    for (let i = 0; i < count; i++) {
      // Update lifetime
      lifetimes[i] += delta * speed;

      // Reset particle when lifetime exceeds 1
      if (lifetimes[i] > 1) {
        lifetimes[i] = 0;
        positions[i * 3] = (Math.random() - 0.5) * 0.3;
        positions[i * 3 + 1] = 0.8 + Math.random() * 0.3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      } else {
        // Move particle upward
        positions[i * 3] += velocities[i * 3] * delta;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

interface EmberBaseProps {
  color: string;
  isAnimating: boolean;
}

/**
 * Glowing ember base
 */
function EmberBase({ color, isAnimating }: EmberBaseProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !isAnimating) return;

    const time = state.clock.elapsedTime;
    const scale = 1 + Math.sin(time * 4) * 0.2;
    meshRef.current.scale.set(scale, 1, scale);
  });

  return (
    <mesh ref={meshRef} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.25, 4]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

interface FireSceneProps {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  isAnimating: boolean;
  intensity: "calm" | "normal" | "intense";
}

/**
 * Main fire scene containing all 3D elements
 */
function FireScene({
  primaryColor,
  secondaryColor,
  tertiaryColor,
  isAnimating,
  intensity,
}: FireSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Animation parameters based on intensity
  const params = useMemo(() => {
    switch (intensity) {
      case "calm":
        return { distortSpeed: 1, distortIntensity: 0.2, particleSpeed: 0.5, particleCount: 8 };
      case "intense":
        return { distortSpeed: 4, distortIntensity: 0.5, particleSpeed: 2, particleCount: 20 };
      default:
        return { distortSpeed: 2, distortIntensity: 0.3, particleSpeed: 1, particleCount: 12 };
    }
  }, [intensity]);

  // Subtle rotation animation
  useFrame((state) => {
    if (!groupRef.current || !isAnimating) return;

    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
  });

  return (
    <group ref={groupRef}>
      {/* Ambient light */}
      <ambientLight intensity={0.3} />

      {/* Point light at flame center for glow effect */}
      <pointLight
        position={[0, 0.5, 0]}
        color={secondaryColor}
        intensity={isAnimating ? 2 : 1}
        distance={3}
      />

      {/* Floating wrapper for subtle movement */}
      <Float
        speed={isAnimating ? 2 : 0}
        rotationIntensity={0.1}
        floatIntensity={0.2}
      >
        {/* Outer flame - largest, red */}
        <FlameLayer
          color={primaryColor}
          scale={1}
          position={[0, 0, 0]}
          distortSpeed={params.distortSpeed}
          distortIntensity={params.distortIntensity}
          isAnimating={isAnimating}
        />

        {/* Middle flame - medium, orange */}
        <FlameLayer
          color={secondaryColor}
          scale={0.7}
          position={[0, 0.1, 0.05]}
          distortSpeed={params.distortSpeed * 1.2}
          distortIntensity={params.distortIntensity * 0.8}
          isAnimating={isAnimating}
        />

        {/* Inner flame - smallest, yellow (brightest) */}
        <FlameLayer
          color={tertiaryColor}
          scale={0.4}
          position={[0, 0.15, 0.1]}
          distortSpeed={params.distortSpeed * 1.5}
          distortIntensity={params.distortIntensity * 0.6}
          isAnimating={isAnimating}
        />

        {/* Ember base */}
        <EmberBase color={primaryColor} isAnimating={isAnimating} />

        {/* Spark particles */}
        <SparkParticles
          color={tertiaryColor}
          count={params.particleCount}
          isAnimating={isAnimating}
          speed={params.particleSpeed}
        />
      </Float>
    </group>
  );
}

/**
 * React Three Fiber 3D fire icon.
 * This is the Tier 3 high-quality version for powerful devices.
 *
 * Features:
 * - True 3D geometry with depth
 * - Low-poly aesthetic with distortion shaders
 * - Particle system for sparks
 * - Dynamic lighting and glow
 * - Smooth animations
 */
export function FireIcon3D({
  size = 24,
  primaryColor = DEFAULT_COLORS.primary,
  secondaryColor = DEFAULT_COLORS.secondary,
  tertiaryColor = DEFAULT_COLORS.tertiary,
  isAnimating = true,
  intensity = "normal",
  className,
}: FireIcon3DProps) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        style={{ width: size, height: size }}
        dpr={[1, 2]} // Pixel ratio for retina
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <FireScene
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tertiaryColor={tertiaryColor}
            isAnimating={isAnimating}
            intensity={intensity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
