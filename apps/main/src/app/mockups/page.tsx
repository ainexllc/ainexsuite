"use client";

import Link from "next/link";
import { MockupShowcase, MagicSparkMic } from "@ainexsuite/ui/components";

// Color variations for MagicSparkMic (#20)
const colorVariations = [
  { name: "Amber (Default)", color: "#f59e0b", bg: "bg-zinc-900" },
  { name: "Cyan", color: "#06b6d4", bg: "bg-zinc-900" },
  { name: "Purple", color: "#a855f7", bg: "bg-zinc-900" },
  { name: "Pink", color: "#ec4899", bg: "bg-zinc-900" },
  { name: "Green", color: "#22c55e", bg: "bg-zinc-900" },
  { name: "Blue", color: "#3b82f6", bg: "bg-zinc-900" },
  { name: "Red", color: "#ef4444", bg: "bg-zinc-900" },
  { name: "Indigo", color: "#6366f1", bg: "bg-zinc-900" },
  { name: "Teal", color: "#14b8a6", bg: "bg-zinc-900" },
  { name: "Orange", color: "#f97316", bg: "bg-zinc-900" },
  { name: "Rose", color: "#f43f5e", bg: "bg-zinc-900" },
  { name: "Violet", color: "#8b5cf6", bg: "bg-zinc-900" },
  { name: "Sky", color: "#0ea5e9", bg: "bg-zinc-900" },
  { name: "Lime", color: "#84cc16", bg: "bg-zinc-900" },
  { name: "Fuchsia", color: "#d946ef", bg: "bg-zinc-900" },
  { name: "Emerald", color: "#10b981", bg: "bg-zinc-900" },
  // Gradient-like dual tone (showing the icon color against different backgrounds)
  { name: "Gold on Black", color: "#fbbf24", bg: "bg-black" },
  { name: "White on Dark", color: "#ffffff", bg: "bg-zinc-800" },
  { name: "Cyan on Navy", color: "#22d3ee", bg: "bg-slate-900" },
  { name: "Pink on Purple", color: "#f472b6", bg: "bg-purple-950" },
];

export default function MockupsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-8">
      {/* Navigation to sub-mockups */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">UI Mockups</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/mockups/fire-icons"
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all font-medium"
          >
            Adaptive Fire Icons (3D)
          </Link>
          <Link
            href="/mockups/date-picker"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
          >
            Date Picker
          </Link>
        </div>
      </div>

      <hr className="max-w-6xl mx-auto border-zinc-200 dark:border-zinc-700 mb-8" />

      {/* Color Variations for #20 MagicSparkMic */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          #20 MagicSparkMic - Color Variations
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Click on any variation to see the color code
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-4">
          {colorVariations.map((variant, i) => (
            <button
              key={i}
              onClick={() => navigator.clipboard.writeText(variant.color)}
              className="group flex flex-col items-center gap-2"
              title={`Click to copy: ${variant.color}`}
            >
              <div
                className={`${variant.bg} rounded-xl p-3 transition-transform group-hover:scale-110 group-active:scale-95`}
                style={{
                  boxShadow: `0 0 20px ${variant.color}40`,
                }}
              >
                <MagicSparkMic size={36} color={variant.color} isAnimating={true} />
              </div>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
                {variant.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {variant.color}
              </span>
            </button>
          ))}
        </div>

        {/* Size variations */}
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10 mb-4">
          Size Variations
        </h3>
        <div className="flex items-end gap-6 flex-wrap">
          {[18, 24, 32, 40, 48, 56, 64].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <div className="bg-zinc-900 rounded-xl p-3">
                <MagicSparkMic size={size} color="#f59e0b" isAnimating={true} />
              </div>
              <span className="text-xs text-zinc-500">{size}px</span>
            </div>
          ))}
        </div>

        {/* Static vs Animated */}
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10 mb-4">
          Static vs Animated
        </h3>
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-zinc-900 rounded-xl p-4">
              <MagicSparkMic size={48} color="#f59e0b" isAnimating={false} />
            </div>
            <span className="text-sm text-zinc-500">Static (isAnimating=false)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-zinc-900 rounded-xl p-4">
              <MagicSparkMic size={48} color="#f59e0b" isAnimating={true} />
            </div>
            <span className="text-sm text-zinc-500">Animated (isAnimating=true)</span>
          </div>
        </div>
      </div>

      <hr className="max-w-6xl mx-auto border-zinc-200 dark:border-zinc-700 mb-8" />

      {/* Full Mockup Showcase */}
      <MockupShowcase defaultSize={32} showControls={true} />
    </div>
  );
}
