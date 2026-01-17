"use client";

import React, { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "../lib/utils";

/**
 * MovingBorder - Creates an animated border that travels around a container
 * Based on Aceternity UI's moving-border component
 */
export const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: unknown;
}) => {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(progress, (val) =>
    pathRef.current?.getPointAtLength(val).x
  );
  const y = useTransform(progress, (val) =>
    pathRef.current?.getPointAtLength(val).y
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};

export interface MovingBorderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Border radius for the button */
  borderRadius?: string;
  /** Container class names */
  containerClassName?: string;
  /** Border gradient class names */
  borderClassName?: string;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Border color - used in the radial gradient */
  borderColor?: string;
}

/**
 * Button with animated moving border effect
 */
export function MovingBorderButton({
  borderRadius = "9999px",
  children,
  containerClassName,
  borderClassName,
  duration = 3000,
  className,
  borderColor = "#f97316", // Orange by default
  borderWidth = 2,
  ...otherProps
}: MovingBorderButtonProps & { borderWidth?: number }) {
  return (
    <button
      className={cn(
        "relative bg-transparent",
        containerClassName
      )}
      style={{
        borderRadius,
        padding: `${borderWidth}px`,
      }}
      {...otherProps}
    >
      {/* Moving border layer - sits in the padding gap */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <MovingBorder duration={duration} rx="50%" ry="50%">
          <div
            className={cn("h-12 w-12", borderClassName)}
            style={{
              background: `radial-gradient(${borderColor} 35%, transparent 65%)`,
            }}
          />
        </MovingBorder>
      </div>

      {/* Content layer - fills inside the border with solid background */}
      <div
        className={cn(
          "relative z-10 flex h-full w-full items-center justify-center",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
        }}
      >
        {children}
      </div>
    </button>
  );
}

export default MovingBorderButton;
