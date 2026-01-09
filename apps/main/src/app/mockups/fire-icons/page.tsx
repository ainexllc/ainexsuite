"use client";

import { useState, lazy, Suspense } from "react";
import {
  FireIcon,
  FireIconSVG,
  FireIconCanvas,
  FIRE_COLOR_PRESETS,
  QualityProvider,
  useQuality,
  AdaptivePriorityIcon,
  AdaptivePriorityBadge,
  type QualityTier,
  type FireIconIntensity,
} from "@ainexsuite/ui";

// Lazy load the 3D version for this demo (to avoid SSR issues with Three.js)
const LazyFireIcon3D = lazy(() =>
  import("@ainexsuite/ui").then((mod) => ({ default: mod.FireIcon3D }))
);

function FireIcon3DWrapper(props: { size: number; isAnimating: boolean; intensity: FireIconIntensity }) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-ink-200 rounded" style={{ width: props.size, height: props.size }} />}>
      <LazyFireIcon3D {...props} />
    </Suspense>
  );
}

function QualityDisplay() {
  const { tier, isLoading, gpuTier, networkType, cpuCores, dataSaverEnabled } = useQuality();

  if (isLoading) {
    return (
      <div className="p-4 bg-surface-secondary rounded-lg animate-pulse">
        <p className="text-ink-500">Detecting device capability...</p>
      </div>
    );
  }

  const tierLabels = ["SVG (Fallback)", "Canvas (Low)", "Canvas (Medium)", "3D (High)"];
  const tierColors = ["text-zinc-500", "text-yellow-500", "text-orange-500", "text-green-500"];

  return (
    <div className="p-4 bg-surface-secondary rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-ink-500">Detected Tier:</span>
        <span className={`font-bold ${tierColors[tier]}`}>
          {tier} - {tierLabels[tier]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-ink-400">
        <div>GPU Tier: {gpuTier}</div>
        <div>CPU Cores: {cpuCores}</div>
        <div>Network: {networkType || "unknown"}</div>
        <div>Data Saver: {dataSaverEnabled ? "On" : "Off"}</div>
      </div>
    </div>
  );
}

function DemoSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
        {description && <p className="text-ink-500 text-sm">{description}</p>}
      </div>
      <div className="p-6 bg-surface rounded-xl border border-ink-200/20">{children}</div>
    </section>
  );
}

export default function FireIconsDemo() {
  const [forcedTier, setForcedTier] = useState<QualityTier | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [intensity, setIntensity] = useState<FireIconIntensity>("normal");

  return (
    <QualityProvider forcedTier={forcedTier ?? undefined}>
      <div className="min-h-screen bg-surface-primary p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-ink-900">Adaptive Fire Icons Demo</h1>
            <p className="text-ink-500">
              Three-tier rendering system that automatically selects the best quality based on device capability.
            </p>
          </div>

          {/* Device Detection */}
          <DemoSection
            title="Device Capability Detection"
            description="Using detect-gpu, Network Information API, and hardware concurrency"
          >
            <QualityDisplay />
          </DemoSection>

          {/* Controls */}
          <DemoSection title="Demo Controls">
            <div className="flex flex-wrap gap-6">
              {/* Tier Override */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-700">Force Tier</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForcedTier(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      forcedTier === null
                        ? "bg-blue-500 text-white"
                        : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                    }`}
                  >
                    Auto
                  </button>
                  {([0, 1, 2, 3] as QualityTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setForcedTier(tier)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        forcedTier === tier
                          ? "bg-blue-500 text-white"
                          : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                      }`}
                    >
                      Tier {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-700">Animation</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAnimating(true)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isAnimating
                        ? "bg-blue-500 text-white"
                        : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                    }`}
                  >
                    On
                  </button>
                  <button
                    onClick={() => setIsAnimating(false)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      !isAnimating
                        ? "bg-blue-500 text-white"
                        : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>

              {/* Intensity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-700">Intensity</label>
                <div className="flex gap-2">
                  {(["calm", "normal", "intense"] as FireIconIntensity[]).map((i) => (
                    <button
                      key={i}
                      onClick={() => setIntensity(i)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        intensity === i
                          ? "bg-blue-500 text-white"
                          : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DemoSection>

          {/* Side by Side Comparison */}
          <DemoSection
            title="Side-by-Side Comparison"
            description="Each tier rendered at 48px for comparison"
          >
            <div className="grid grid-cols-3 gap-8">
              {/* Tier 0 - SVG */}
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-ink-50 rounded-xl">
                  <FireIconSVG
                    size={48}
                    isAnimating={isAnimating}
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-ink-900">Tier 0: SVG</div>
                  <div className="text-xs text-ink-500">Framer Motion</div>
                  <div className="text-xs text-green-600">+0KB</div>
                </div>
              </div>

              {/* Tier 1-2 - Canvas */}
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-ink-50 rounded-xl">
                  <FireIconCanvas
                    size={48}
                    isAnimating={isAnimating}
                    intensity={intensity}
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-ink-900">Tier 1-2: Canvas</div>
                  <div className="text-xs text-ink-500">Zdog Pseudo-3D</div>
                  <div className="text-xs text-yellow-600">+28KB</div>
                </div>
              </div>

              {/* Tier 3 - 3D */}
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-ink-50 rounded-xl">
                  <FireIcon3DWrapper
                    size={48}
                    isAnimating={isAnimating}
                    intensity={intensity}
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-ink-900">Tier 3: 3D</div>
                  <div className="text-xs text-ink-500">React Three Fiber</div>
                  <div className="text-xs text-orange-600">+500KB (lazy)</div>
                </div>
              </div>
            </div>
          </DemoSection>

          {/* Adaptive Icon (Auto-selects based on tier) */}
          <DemoSection
            title="Adaptive FireIcon"
            description="Automatically selects the best rendering tier for your device"
          >
            <div className="flex items-center gap-8">
              <FireIcon
                size={64}
                isAnimating={isAnimating}
                intensity={intensity}
                forceTier={forcedTier ?? undefined}
              />
              <div className="text-sm text-ink-500">
                Currently using: <strong>Tier {forcedTier ?? "Auto"}</strong>
              </div>
            </div>
          </DemoSection>

          {/* Flame Count Variations */}
          <DemoSection
            title="Flame Count Variations"
            description="Intertwined flame tongues sharing a common base - like a real fire"
          >
            <div className="grid grid-cols-3 gap-8">
              {([1, 2, 3] as const).map((count) => (
                <div key={count} className="flex flex-col items-center gap-4">
                  <div className="p-6 bg-ink-50 rounded-xl">
                    <FireIconSVG
                      size={48}
                      isAnimating={isAnimating}
                      flameCount={count}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-ink-900">
                      {count === 1 ? "Single Tongue" : count === 2 ? "Two Tongues" : "Three Tongues"}
                    </div>
                    <div className="text-xs text-ink-500">flameCount={count}</div>
                  </div>
                </div>
              ))}
            </div>
          </DemoSection>

          {/* Size Variations */}
          <DemoSection title="Size Variations" description="From 14px to 96px">
            <div className="flex items-end gap-6">
              {[14, 18, 24, 32, 48, 64, 96].map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <FireIcon
                    size={size}
                    isAnimating={isAnimating}
                    intensity={intensity}
                    forceTier={forcedTier ?? undefined}
                  />
                  <span className="text-xs text-ink-400">{size}px</span>
                </div>
              ))}
            </div>
          </DemoSection>

          {/* Color Presets */}
          <DemoSection title="Color Presets" description="Pre-defined color schemes">
            <div className="grid grid-cols-6 gap-6">
              {(Object.keys(FIRE_COLOR_PRESETS) as Array<keyof typeof FIRE_COLOR_PRESETS>).map(
                (preset) => (
                  <div key={preset} className="flex flex-col items-center gap-2">
                    <FireIcon
                      size={48}
                      {...FIRE_COLOR_PRESETS[preset]}
                      isAnimating={isAnimating}
                      intensity={intensity}
                      forceTier={forcedTier ?? undefined}
                    />
                    <span className="text-xs text-ink-500 capitalize">{preset}</span>
                  </div>
                )
              )}
            </div>
          </DemoSection>

          {/* Priority Icons */}
          <DemoSection
            title="Adaptive Priority Icons"
            description="Ready-to-use priority indicators with automatic quality selection"
          >
            <div className="space-y-6">
              {/* Priority Icons */}
              <div className="flex items-center gap-8">
                {(["urgent", "high", "medium", "low"] as const).map((priority) => (
                  <div key={priority} className="flex flex-col items-center gap-2">
                    <AdaptivePriorityIcon
                      priority={priority}
                      size="lg"
                      showOnlyHighPriority={false}
                      forceTier={forcedTier ?? undefined}
                    />
                    <span className="text-xs text-ink-500 capitalize">{priority}</span>
                  </div>
                ))}
              </div>

              {/* Priority Badges */}
              <div className="flex flex-wrap gap-4">
                {(["urgent", "high", "medium", "low"] as const).map((priority) => (
                  <AdaptivePriorityBadge
                    key={priority}
                    priority={priority}
                    size="md"
                    forceTier={forcedTier ?? undefined}
                  />
                ))}
              </div>
            </div>
          </DemoSection>

          {/* Intensity Comparison */}
          <DemoSection
            title="Intensity Comparison"
            description="Calm, Normal, and Intense animation speeds"
          >
            <div className="grid grid-cols-3 gap-8">
              {(["calm", "normal", "intense"] as FireIconIntensity[]).map((i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <FireIcon
                    size={64}
                    isAnimating={true}
                    intensity={i}
                    forceTier={forcedTier ?? undefined}
                  />
                  <span className="text-sm text-ink-500 capitalize">{i}</span>
                </div>
              ))}
            </div>
          </DemoSection>

          {/* Grid of Many Icons */}
          <DemoSection
            title="Performance Test"
            description="Grid of 24 icons to test rendering performance"
          >
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <FireIcon
                  key={i}
                  size={32}
                  isAnimating={isAnimating}
                  intensity={intensity}
                  forceTier={forcedTier ?? undefined}
                  {...FIRE_COLOR_PRESETS[
                    (Object.keys(FIRE_COLOR_PRESETS) as Array<keyof typeof FIRE_COLOR_PRESETS>)[
                      i % Object.keys(FIRE_COLOR_PRESETS).length
                    ]
                  ]}
                />
              ))}
            </div>
          </DemoSection>

          {/* Code Examples */}
          <DemoSection title="Usage Examples">
            <div className="space-y-4 font-mono text-sm">
              <pre className="p-4 bg-ink-900 text-ink-100 rounded-lg overflow-x-auto">
{`// Basic usage (auto-detects device capability)
import { FireIcon } from "@ainexsuite/ui";
<FireIcon size={24} />

// With color preset
import { FireIcon, FIRE_COLOR_PRESETS } from "@ainexsuite/ui";
<FireIcon {...FIRE_COLOR_PRESETS.urgent} intensity="intense" />

// Multiple flames (SVG/Tier 0 only)
<FireIcon size={48} flameCount={2} /> // Double flame
<FireIcon size={48} flameCount={3} /> // Triple flame

// Force a specific tier
<FireIcon size={48} forceTier={3} /> // Always 3D

// Adaptive priority icon
import { AdaptivePriorityIcon } from "@ainexsuite/ui";
<AdaptivePriorityIcon priority="urgent" size="lg" />

// Add QualityProvider at app root
import { QualityProvider } from "@ainexsuite/ui";
<QualityProvider>
  <App />
</QualityProvider>`}
              </pre>
            </div>
          </DemoSection>
        </div>
      </div>
    </QualityProvider>
  );
}
