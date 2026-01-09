"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface NoiseBackgroundProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  gradientColors?: string[];
  noiseIntensity?: number;
  speed?: number;
  backdropBlur?: boolean;
  animating?: boolean;
}

export function NoiseBackground({
  children,
  className,
  containerClassName,
  gradientColors = [
    "rgb(255, 100, 150)",
    "rgb(100, 150, 255)",
    "rgb(255, 200, 100)",
  ],
  noiseIntensity = 0.2,
  speed = 0.1,
  backdropBlur = false,
  animating = true,
}: NoiseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate noise texture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 128;
    canvas.width = size;
    canvas.height = size;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Create gradient string for animation
  const gradientStops = gradientColors
    .map((color, i) => {
      const percent = (i / (gradientColors.length - 1)) * 100;
      return `${color} ${percent}%`;
    })
    .join(", ");

  return (
    <div className={cn("relative", containerClassName)}>
      {/* Animated gradient background - acts as the border */}
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(135deg, ${gradientStops})`,
          backgroundSize: "400% 400%",
        }}
        animate={
          animating
            ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }
            : undefined
        }
        transition={
          animating
            ? {
                duration: 5 / speed,
                repeat: Infinity,
                ease: "linear",
              }
            : undefined
        }
      />

      {/* Noise texture overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit]"
        style={{
          opacity: noiseIntensity,
          mixBlendMode: "overlay",
        }}
      />

      {/* Backdrop blur layer */}
      {backdropBlur && (
        <div className="absolute inset-0 backdrop-blur-sm rounded-[inherit]" />
      )}

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
