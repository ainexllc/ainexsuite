"use client";

import { useRef, useEffect, useCallback } from "react";
import Zdog from "zdog";
import { cn } from "../../../lib/utils";

export interface FireIconCanvasProps {
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
  /** Enable 3D rotation on hover */
  rotateOnHover?: boolean;
  /** Additional class names */
  className?: string;
}

// Default fire colors
const DEFAULT_COLORS = {
  primary: "#ef4444",
  secondary: "#f97316",
  tertiary: "#fbbf24",
};

/**
 * Zdog-based pseudo-3D fire icon with low-poly geometric shapes.
 * This is the Tier 1-2 version for mid-range devices.
 *
 * Features:
 * - Canvas-based rendering (lightweight)
 * - Pseudo-3D with depth perception
 * - Rotatable geometry
 * - Animated flame shapes
 */
export function FireIconCanvas({
  size = 24,
  primaryColor = DEFAULT_COLORS.primary,
  secondaryColor = DEFAULT_COLORS.secondary,
  tertiaryColor = DEFAULT_COLORS.tertiary,
  isAnimating = true,
  intensity = "normal",
  rotateOnHover = true,
  className,
}: FireIconCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const illoRef = useRef<Zdog.Illustration | null>(null);
  const animationRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const rotationRef = useRef({ x: 0, y: 0 });

  // Animation speed based on intensity
  const getSpeed = useCallback(() => {
    switch (intensity) {
      case "calm":
        return 0.02;
      case "intense":
        return 0.08;
      default:
        return 0.04;
    }
  }, [intensity]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const speed = getSpeed();

    // Create Zdog illustration
    const illo = new Zdog.Illustration({
      element: canvas,
      dragRotate: false,
      resize: false,
    });
    illoRef.current = illo;

    // Anchor for the entire flame
    const flame = new Zdog.Anchor({
      addTo: illo,
    });

    // Scale factor for the viewbox
    const scale = size / 24;

    // Outer flame - large tetrahedron-like shape
    const outerFlame = new Zdog.Shape({
      addTo: flame,
      path: [
        { x: 0, y: -8 * scale, z: 0 }, // tip
        { x: -4 * scale, y: 4 * scale, z: -2 * scale }, // back left
        { x: 4 * scale, y: 4 * scale, z: -2 * scale }, // back right
        { x: 0, y: 6 * scale, z: 3 * scale }, // front
      ],
      closed: true,
      fill: true,
      stroke: 1,
      color: primaryColor,
    });

    // Middle flame - smaller tetrahedron
    const middleFlame = new Zdog.Shape({
      addTo: flame,
      path: [
        { x: 0, y: -6 * scale, z: 0.5 * scale },
        { x: -2.5 * scale, y: 3 * scale, z: -1 * scale },
        { x: 2.5 * scale, y: 3 * scale, z: -1 * scale },
        { x: 0, y: 4 * scale, z: 2 * scale },
      ],
      closed: true,
      fill: true,
      stroke: 1,
      color: secondaryColor,
    });

    // Inner flame core - smallest tetrahedron
    const innerFlame = new Zdog.Shape({
      addTo: flame,
      path: [
        { x: 0, y: -4 * scale, z: 1 * scale },
        { x: -1.5 * scale, y: 2 * scale, z: 0 },
        { x: 1.5 * scale, y: 2 * scale, z: 0 },
        { x: 0, y: 3 * scale, z: 1.5 * scale },
      ],
      closed: true,
      fill: true,
      stroke: 1,
      color: tertiaryColor,
    });

    // Ember base - small diamond shape
    const ember = new Zdog.Shape({
      addTo: flame,
      path: [
        { x: -2 * scale, y: 6 * scale, z: 0 },
        { x: 0, y: 5 * scale, z: 0 },
        { x: 2 * scale, y: 6 * scale, z: 0 },
        { x: 0, y: 7 * scale, z: 0 },
      ],
      closed: true,
      fill: true,
      stroke: 0.5,
      color: primaryColor,
    });

    // Spark particles
    const sparks: Zdog.Shape[] = [];
    for (let i = 0; i < 3; i++) {
      const spark = new Zdog.Shape({
        addTo: flame,
        path: [
          { x: 0, y: -0.5 * scale },
          { x: 0.5 * scale, y: 0 },
          { x: 0, y: 0.5 * scale },
          { x: -0.5 * scale, y: 0 },
        ],
        translate: {
          x: (i - 1) * 2 * scale,
          y: -6 * scale,
          z: 2 * scale,
        },
        closed: true,
        fill: true,
        stroke: 0,
        color: tertiaryColor,
      });
      sparks.push(spark);
    }

    // Animation state
    let time = 0;
    const sparkPhases = [0, Math.PI * 0.66, Math.PI * 1.33];

    // Animation loop
    function animate() {
      if (!isAnimating && !isHoveringRef.current) {
        illo.updateRenderGraph();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      time += speed;

      // Animate flame shapes with slight rotation/wobble
      const wobbleX = Math.sin(time * 2) * 0.1;
      const wobbleY = Math.cos(time * 1.5) * 0.1;

      outerFlame.rotate.x = wobbleX * 0.5;
      outerFlame.rotate.z = wobbleY * 0.3;

      middleFlame.rotate.x = -wobbleX * 0.7;
      middleFlame.rotate.z = -wobbleY * 0.5;

      innerFlame.rotate.x = wobbleX * 0.9;
      innerFlame.rotate.z = wobbleY * 0.7;

      // Animate flame tip stretching (scale Y)
      const stretchFactor = 1 + Math.sin(time * 3) * 0.15;
      flame.scale.x = 1;
      flame.scale.y = stretchFactor;
      flame.scale.z = 1;

      // Animate ember pulsing
      const emberScale = 1 + Math.sin(time * 4) * 0.2;
      ember.scale.x = emberScale;
      ember.scale.y = emberScale;
      ember.scale.z = 1;

      // Animate sparks floating up
      sparks.forEach((spark, i) => {
        const phase = sparkPhases[i];
        const sparkTime = (time + phase) % (Math.PI * 2);
        const progress = sparkTime / (Math.PI * 2);

        spark.translate.y = -6 * scale - progress * 6 * scale;
        spark.translate.x = (i - 1) * 2 * scale + Math.sin(sparkTime * 2) * scale;

        // Fade out as they rise
        if (progress < 0.2) {
          spark.color = tertiaryColor;
        } else if (progress > 0.8) {
          spark.color = "transparent";
        } else {
          spark.color = tertiaryColor;
        }

        // Scale down as they rise
        const sparkScale = 1 - progress * 0.7;
        spark.scale.x = sparkScale;
        spark.scale.y = sparkScale;
        spark.scale.z = sparkScale;
      });

      // Handle hover rotation
      if (rotateOnHover && isHoveringRef.current) {
        rotationRef.current.y += 0.03;
      } else {
        // Slowly return to original rotation
        rotationRef.current.y *= 0.95;
      }

      illo.rotate.y = rotationRef.current.y;
      illo.updateRenderGraph();

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, primaryColor, secondaryColor, tertiaryColor, isAnimating, getSpeed, rotateOnHover, intensity]);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
  }, []);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center flex-shrink-0", className)}
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={size * 2} // 2x for retina
        height={size * 2}
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
}
