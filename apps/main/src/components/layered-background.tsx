'use client';

import { CanvasWaveBackground } from './canvas-wave-background';

/**
 * Layered background combining canvas wave animation with gradient effects
 */
export function LayeredBackground() {
  return (
    <>
      {/* Base gradient layer */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),rgba(5,5,5,0.95)_55%),radial-gradient(circle_at_bottom,rgba(99,102,241,0.12),rgba(5,5,5,0.95)_65%)]" />

      {/* Atmospheric gradient orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#f97316]/25 blur-[150px] -z-20" />
      <div className="pointer-events-none absolute top-1/3 right-[-12%] h-[360px] w-[360px] rounded-full bg-[#6366f1]/20 blur-[160px] -z-20" />

      {/* Canvas wave animation layer */}
      <CanvasWaveBackground />
    </>
  );
}
