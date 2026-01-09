"use client";

import { useState, useEffect, useCallback } from "react";
import { getGPUTier, type TierResult } from "detect-gpu";

/**
 * Quality tiers for adaptive icon rendering
 * - 0: No WebGL / very weak GPU / Data Saver mode → SVG fallback
 * - 1: Low-end GPU (≥15fps) / slow network → Basic canvas
 * - 2: Mid-range GPU (≥30fps) / decent network → Enhanced canvas
 * - 3: High-end GPU (≥60fps) / fast network → Full 3D (R3F)
 */
export type QualityTier = 0 | 1 | 2 | 3;

export interface AdaptiveQualityResult {
  tier: QualityTier;
  isLoading: boolean;
  gpuTier: number;
  networkType: string | null;
  cpuCores: number;
  dataSaverEnabled: boolean;
  /** Force a specific tier (useful for testing) */
  setForcedTier: (tier: QualityTier | null) => void;
}

const STORAGE_KEY = "ainex_quality_tier";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedResult {
  tier: QualityTier;
  gpuTier: number;
  timestamp: number;
}

/**
 * Detect network connection quality using Network Information API
 */
function getNetworkInfo(): { type: string | null; saveData: boolean } {
  if (typeof navigator === "undefined") {
    return { type: null, saveData: false };
  }

  // @ts-expect-error - Network Information API not in all TS libs
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return { type: null, saveData: false };
  }

  return {
    type: connection.effectiveType || null,
    saveData: connection.saveData || false,
  };
}

/**
 * Get CPU core count
 */
function getCpuCores(): number {
  if (typeof navigator === "undefined") {
    return 4; // Default assumption
  }
  return navigator.hardwareConcurrency || 4;
}

/**
 * Calculate final quality tier based on multiple signals
 */
function calculateTier(
  gpuTier: number,
  networkType: string | null,
  cpuCores: number,
  dataSaverEnabled: boolean
): QualityTier {
  // Data Saver mode always gets tier 0
  if (dataSaverEnabled) {
    return 0;
  }

  // GPU tier is the primary signal (0-3 from detect-gpu)
  let baseTier = gpuTier as QualityTier;

  // Downgrade for slow network
  if (networkType === "slow-2g" || networkType === "2g") {
    baseTier = Math.min(baseTier, 0) as QualityTier;
  } else if (networkType === "3g") {
    baseTier = Math.min(baseTier, 1) as QualityTier;
  }

  // Downgrade for low CPU cores
  if (cpuCores <= 2) {
    baseTier = Math.min(baseTier, 1) as QualityTier;
  } else if (cpuCores <= 4) {
    baseTier = Math.min(baseTier, 2) as QualityTier;
  }

  return baseTier;
}

/**
 * Load cached result from localStorage
 */
function loadCachedResult(): CachedResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const parsed: CachedResult = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save result to localStorage
 */
function saveCachedResult(tier: QualityTier, gpuTier: number): void {
  if (typeof window === "undefined") return;

  try {
    const result: CachedResult = {
      tier,
      gpuTier,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to detect device capability and return appropriate quality tier
 *
 * Uses:
 * - detect-gpu for GPU benchmarking
 * - Network Information API for bandwidth
 * - navigator.hardwareConcurrency for CPU cores
 *
 * Results are cached in localStorage for 24 hours to avoid repeated benchmarks.
 */
export function useAdaptiveQuality(): AdaptiveQualityResult {
  const [tier, setTier] = useState<QualityTier>(1); // Default to tier 1
  const [isLoading, setIsLoading] = useState(true);
  const [gpuTier, setGpuTier] = useState(1);
  const [networkType, setNetworkType] = useState<string | null>(null);
  const [cpuCores, setCpuCores] = useState(4);
  const [dataSaverEnabled, setDataSaverEnabled] = useState(false);
  const [forcedTier, setForcedTier] = useState<QualityTier | null>(null);

  useEffect(() => {
    let mounted = true;

    async function detectCapability() {
      // Check for cached result first
      const cached = loadCachedResult();

      // Get network and CPU info (always fresh)
      const network = getNetworkInfo();
      const cores = getCpuCores();

      if (mounted) {
        setNetworkType(network.type);
        setDataSaverEnabled(network.saveData);
        setCpuCores(cores);
      }

      // Use cached GPU tier if available
      if (cached) {
        const finalTier = calculateTier(cached.gpuTier, network.type, cores, network.saveData);
        if (mounted) {
          setGpuTier(cached.gpuTier);
          setTier(finalTier);
          setIsLoading(false);
        }
        return;
      }

      // Run GPU benchmark
      try {
        const result: TierResult = await getGPUTier();
        const detectedGpuTier = result.tier as number;

        const finalTier = calculateTier(detectedGpuTier, network.type, cores, network.saveData);

        if (mounted) {
          setGpuTier(detectedGpuTier);
          setTier(finalTier);
          saveCachedResult(finalTier, detectedGpuTier);
        }
      } catch (error) {
        // On error, default to tier 1
        console.warn("GPU detection failed, defaulting to tier 1:", error);
        if (mounted) {
          setGpuTier(1);
          setTier(1);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    detectCapability();

    // Listen for network changes
    // @ts-expect-error - Network Information API
    const connection = navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection;
    const handleNetworkChange = () => {
      const network = getNetworkInfo();
      setNetworkType(network.type);
      setDataSaverEnabled(network.saveData);

      // Recalculate tier with new network info
      setTier((_currentTier) => {
        const newTier = calculateTier(gpuTier, network.type, cpuCores, network.saveData);
        return newTier;
      });
    };

    connection?.addEventListener?.("change", handleNetworkChange);

    return () => {
      mounted = false;
      connection?.removeEventListener?.("change", handleNetworkChange);
    };
  }, [gpuTier, cpuCores]);

  const handleSetForcedTier = useCallback((newTier: QualityTier | null) => {
    setForcedTier(newTier);
  }, []);

  return {
    tier: forcedTier ?? tier,
    isLoading,
    gpuTier,
    networkType,
    cpuCores,
    dataSaverEnabled,
    setForcedTier: handleSetForcedTier,
  };
}

/**
 * Simple hook that just returns the tier number
 * Use this in components that don't need the full details
 */
export function useQualityTier(): QualityTier {
  const { tier } = useAdaptiveQuality();
  return tier;
}
