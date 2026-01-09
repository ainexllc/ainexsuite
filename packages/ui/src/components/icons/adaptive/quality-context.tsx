"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdaptiveQuality, type QualityTier, type AdaptiveQualityResult } from "./use-adaptive-quality";

const QualityContext = createContext<AdaptiveQualityResult | null>(null);

interface QualityProviderProps {
  children: ReactNode;
  /** Override the detected tier (useful for testing) */
  forcedTier?: QualityTier;
}

/**
 * Provider component that runs quality detection once and shares the result
 * with all child components via context.
 *
 * Place this at the app root to avoid multiple GPU benchmarks.
 *
 * @example
 * ```tsx
 * // In app layout
 * <QualityProvider>
 *   <App />
 * </QualityProvider>
 *
 * // In component
 * const { tier } = useQuality();
 * ```
 */
export function QualityProvider({ children, forcedTier }: QualityProviderProps) {
  const quality = useAdaptiveQuality();

  // Apply forced tier if provided
  const value: AdaptiveQualityResult = forcedTier !== undefined
    ? { ...quality, tier: forcedTier }
    : quality;

  return (
    <QualityContext.Provider value={value}>
      {children}
    </QualityContext.Provider>
  );
}

/**
 * Hook to access the shared quality context.
 * Falls back to running its own detection if not within a QualityProvider.
 *
 * @example
 * ```tsx
 * function MyIcon() {
 *   const { tier, isLoading } = useQuality();
 *
 *   if (tier === 3) return <Icon3D />;
 *   if (tier >= 1) return <IconCanvas />;
 *   return <IconSVG />;
 * }
 * ```
 */
export function useQuality(): AdaptiveQualityResult {
  const context = useContext(QualityContext);

  // If no provider, run detection directly (less efficient but still works)
  const fallback = useAdaptiveQuality();

  return context ?? fallback;
}

/**
 * Simple hook that just returns the tier number.
 * Use this when you only need the tier value.
 */
export function useQualityTier(): QualityTier {
  const { tier } = useQuality();
  return tier;
}

/**
 * Check if high-quality 3D rendering should be enabled
 */
export function useIs3DEnabled(): boolean {
  const { tier, isLoading } = useQuality();
  // Only enable 3D for tier 3 and when detection is complete
  return !isLoading && tier === 3;
}

/**
 * Check if canvas-based rendering should be used
 */
export function useIsCanvasEnabled(): boolean {
  const { tier, isLoading } = useQuality();
  // Enable canvas for tiers 1, 2, and 3
  return !isLoading && tier >= 1;
}
