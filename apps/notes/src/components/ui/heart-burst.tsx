"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface HeartBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function HeartBurst({ trigger, onComplete }: HeartBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    angle: number;
    distance: number;
    size: number;
    delay: number;
  }>>([]);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (trigger && containerRef.current) {
      // Get the position of the button
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      // Generate 10-14 particles in a burst pattern
      const count = 10 + Math.floor(Math.random() * 5);
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (360 / count) * i + Math.random() * 15 - 7.5,
        distance: 30 + Math.random() * 25,
        size: 5 + Math.random() * 4,
        delay: Math.random() * 40,
      }));
      setParticles(newParticles);

      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
        setPosition(null);
        onComplete?.();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  // Render anchor point
  const anchor = <div ref={containerRef} className="absolute inset-0 pointer-events-none" />;

  // Render burst via portal to body to escape overflow:hidden
  const burst = position && particles.length > 0 && typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{ left: position.x, top: position.y }}
        >
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full animate-heart-burst"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: "var(--color-primary)",
                left: -particle.size / 2,
                top: -particle.size / 2,
                transformOrigin: "center center",
                "--burst-angle": `${particle.angle}deg`,
                "--burst-distance": `${particle.distance}px`,
                animationDelay: `${particle.delay}ms`,
              } as React.CSSProperties}
            />
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {anchor}
      {burst}
    </>
  );
}
