'use client';

interface LayeredBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
}

// Simple helper to add opacity to hex color
const addAlpha = (color: string, opacity: number) => {
  // If it's already rgba/hsla, return as is (simplified)
  if (color.startsWith('rgb') || color.startsWith('hsl')) return color;

  // Remove #
  const hex = color.replace('#', '');
  // Convert to int
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Layered background with gradient effects
 * This is the standard background for all homepage templates
 */
export function LayeredBackground({
  primaryColor = '#f97316', // Default Orange
  secondaryColor = '#6366f1', // Default Indigo
}: LayeredBackgroundProps) {

  const primaryWithAlpha = addAlpha(primaryColor, 0.14);
  const secondaryWithAlpha = addAlpha(secondaryColor, 0.12);
  const primaryOrb = addAlpha(primaryColor, 0.25);
  const secondaryOrb = addAlpha(secondaryColor, 0.20);

  return (
    <>
      {/* Base gradient layer */}
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at top, ${primaryWithAlpha}, rgba(5,5,5,0.95) 55%),
            radial-gradient(circle at bottom, ${secondaryWithAlpha}, rgba(5,5,5,0.95) 65%)
          `
        }}
      />

      {/* Atmospheric gradient orbs */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[150px] -z-20"
        style={{ backgroundColor: primaryOrb }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-[-12%] h-[360px] w-[360px] rounded-full blur-[160px] -z-20"
        style={{ backgroundColor: secondaryOrb }}
      />
    </>
  );
}