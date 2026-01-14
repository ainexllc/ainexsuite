"use client";

import { Pin, Circle, CheckCircle2, Sparkles, Star, Crown, Flame, Zap, Heart } from "lucide-react";
import Link from "next/link";

// Sample favorite note for demos
const SAMPLE_NOTE = {
  title: "Launch Checklist",
  checklist: [
    { id: "1", text: "Finalize marketing copy", completed: true },
    { id: "2", text: "QA sign-off on all features", completed: true },
    { id: "3", text: "Load testing complete", completed: true },
    { id: "4", text: "Documentation updated", completed: false },
    { id: "5", text: "Stakeholder demo scheduled", completed: false },
    { id: "6", text: "Press release drafted", completed: false },
  ],
};

const completedCount = SAMPLE_NOTE.checklist.filter((i) => i.completed).length;
const totalCount = SAMPLE_NOTE.checklist.length;
const progressPercent = (completedCount / totalCount) * 100;

// Corner ribbon component (kept as requested)
function CornerRibbon({ variant = "default" }: { variant?: string }) {
  const colors: Record<string, string> = {
    default: "bg-orange-500",
    gold: "bg-gradient-to-br from-amber-400 to-yellow-600",
    purple: "bg-gradient-to-br from-purple-500 to-indigo-600",
    fire: "bg-gradient-to-br from-red-500 to-orange-500",
    mint: "bg-gradient-to-br from-emerald-400 to-teal-500",
    blue: "bg-gradient-to-br from-blue-500 to-cyan-500",
  };

  return (
    <div className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden z-20">
      <div className={`absolute top-0 right-0 ${colors[variant] || colors.default} w-14 h-14 rotate-45 translate-x-7 -translate-y-7`} />
      <Pin className="absolute top-1.5 right-1.5 h-3 w-3 text-white fill-white" />
    </div>
  );
}

// Checklist content component
function ChecklistContent({ maxItems = 5 }: { maxItems?: number }) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      {/* Progress bar at top */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="flex-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
          {completedCount}/{totalCount}
        </span>
      </div>
      {/* Items */}
      <ul className="space-y-1.5">
        {SAMPLE_NOTE.checklist.slice(0, maxItems).map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-2 text-xs ${
              item.completed
                ? "text-zinc-400 dark:text-zinc-500 line-through"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            )}
            <span className="line-clamp-1">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FavoritesDesignsPage() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/mockups/note-cards"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-4 inline-block"
          >
            ← Back to mockups
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Favorite Card Designs
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            6 different treatments for favorite/pinned notes. All keep your corner ribbon.
          </p>
        </header>

        {/* Designs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Design 1: Gradient Border Glow */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              1. Gradient Border Glow
            </h3>
            <div className="relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
              <article className="relative h-[260px] rounded-2xl bg-white dark:bg-zinc-800 p-4 flex flex-col">
                <CornerRibbon variant="purple" />
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 pr-8">
                  {SAMPLE_NOTE.title}
                </h3>
                <ChecklistContent />
              </article>
            </div>
            <p className="text-xs text-zinc-500">Glowing gradient border with blur effect</p>
          </div>

          {/* Design 2: Glass Morphism */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Star className="w-4 h-4 text-cyan-500" />
              2. Glass Morphism
            </h3>
            <div className="relative">
              {/* Colorful background blobs */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-400/30 dark:bg-cyan-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-400/30 dark:bg-purple-500/20 rounded-full blur-2xl" />
              </div>
              <article className="relative h-[260px] rounded-2xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 p-4 flex flex-col shadow-xl">
                <CornerRibbon variant="blue" />
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 pr-8">
                  {SAMPLE_NOTE.title}
                </h3>
                <ChecklistContent />
              </article>
            </div>
            <p className="text-xs text-zinc-500">Frosted glass with colorful backdrop</p>
          </div>

          {/* Design 3: Golden Premium */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              3. Golden Premium
            </h3>
            <article className="relative h-[260px] rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-2 border-amber-300/50 dark:border-amber-700/50 p-4 flex flex-col shadow-lg shadow-amber-500/10">
              <CornerRibbon variant="gold" />
              {/* Gold accent line at top */}
              <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 pr-8 mt-1">
                {SAMPLE_NOTE.title}
              </h3>
              <ChecklistContent />
              {/* Subtle shimmer overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </article>
            <p className="text-xs text-zinc-500">Premium gold treatment with shimmer</p>
          </div>

          {/* Design 4: Neon Outline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              4. Neon Accent
            </h3>
            <article className="relative h-[260px] rounded-2xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 p-4 flex flex-col overflow-hidden">
              <CornerRibbon variant="mint" />
              {/* Neon glow effects */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_5px_rgba(52,211,153,0.3)]" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_5px_rgba(34,211,238,0.3)]" />
              <h3 className="font-semibold text-white mb-3 pr-8">
                {SAMPLE_NOTE.title}
              </h3>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex-1 h-1 rounded-full bg-zinc-700 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[9px] font-medium text-zinc-400 tabular-nums">{completedCount}/{totalCount}</span>
                </div>
                <ul className="space-y-1.5">
                  {SAMPLE_NOTE.checklist.slice(0, 5).map((item) => (
                    <li key={item.id} className={`flex items-center gap-2 text-xs ${item.completed ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                      {item.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                      )}
                      <span className="line-clamp-1">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
            <p className="text-xs text-zinc-500">Dark card with neon glow lines</p>
          </div>

          {/* Design 5: Elevated Float */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              5. Elevated Float
            </h3>
            <article className="relative h-[260px] rounded-2xl bg-white dark:bg-zinc-800 p-4 flex flex-col shadow-2xl shadow-orange-500/20 dark:shadow-orange-500/10 border border-orange-200/50 dark:border-orange-800/30 transform hover:-translate-y-1 transition-transform">
              <CornerRibbon variant="fire" />
              {/* Accent bar on left */}
              <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-orange-400 via-red-500 to-pink-500" />
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 pr-8 pl-2">
                {SAMPLE_NOTE.title}
              </h3>
              <div className="pl-2">
                <ChecklistContent />
              </div>
            </article>
            <p className="text-xs text-zinc-500">Strong shadow with gradient accent bar</p>
          </div>

          {/* Design 6: Spotlight Ring */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              6. Spotlight Ring
            </h3>
            <article className="relative h-[260px] rounded-2xl bg-white dark:bg-zinc-800 p-4 flex flex-col ring-4 ring-pink-500/20 dark:ring-pink-500/30 ring-offset-4 ring-offset-zinc-100 dark:ring-offset-zinc-950 shadow-lg">
              <CornerRibbon variant="default" />
              {/* Top highlight */}
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 pr-8">
                {SAMPLE_NOTE.title}
              </h3>
              <ChecklistContent />
            </article>
            <p className="text-xs text-zinc-500">Ring offset with top highlight</p>
          </div>

        </div>

        {/* Page Background Variations - Full Width */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Subtle Page Background Behind Favorites</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">The actual page background is slightly different in the favorites zone - no container, just a tint</p>
        </section>
      </div>

      {/* Full-width background demos */}
      <div className="space-y-8 mt-8">

        {/* Demo A: Warm tint */}
        <div>
          <div className="max-w-6xl mx-auto px-8 mb-2">
            <span className="text-xs font-medium text-zinc-500">A. Warm Orange Tint</span>
          </div>
          <div className="bg-orange-50/50 dark:bg-orange-950/20 py-6 border-y border-orange-100/50 dark:border-orange-900/20">
            <div className="max-w-6xl mx-auto px-8">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Favorites</span>
              </div>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-950 py-6">
            <div className="max-w-6xl mx-auto px-8">
              <span className="text-xs text-zinc-400 mb-3 block">All Notes (normal bg)</span>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Demo B: Slightly darker/lighter */}
        <div>
          <div className="max-w-6xl mx-auto px-8 mb-2">
            <span className="text-xs font-medium text-zinc-500">B. Subtle Shade Shift (darker in light, lighter in dark)</span>
          </div>
          <div className="bg-zinc-200/50 dark:bg-zinc-800/50 py-6">
            <div className="max-w-6xl mx-auto px-8">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Favorites</span>
              </div>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-950 py-6">
            <div className="max-w-6xl mx-auto px-8">
              <span className="text-xs text-zinc-400 mb-3 block">All Notes (normal bg)</span>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Demo C: Gradient fade */}
        <div>
          <div className="max-w-6xl mx-auto px-8 mb-2">
            <span className="text-xs font-medium text-zinc-500">C. Gradient Fade (soft transition)</span>
          </div>
          <div className="bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-transparent dark:from-amber-950/30 dark:via-orange-950/15 dark:to-transparent py-6">
            <div className="max-w-6xl mx-auto px-8">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Favorites</span>
              </div>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-950 py-6">
            <div className="max-w-6xl mx-auto px-8">
              <span className="text-xs text-zinc-400 mb-3 block">All Notes (normal bg)</span>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Demo D: Very subtle blue/purple */}
        <div>
          <div className="max-w-6xl mx-auto px-8 mb-2">
            <span className="text-xs font-medium text-zinc-500">D. Cool Accent (subtle blue-purple)</span>
          </div>
          <div className="bg-indigo-50/30 dark:bg-indigo-950/20 py-6">
            <div className="max-w-6xl mx-auto px-8">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Favorites</span>
              </div>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-950 py-6">
            <div className="max-w-6xl mx-auto px-8">
              <span className="text-xs text-zinc-400 mb-3 block">All Notes (normal bg)</span>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <div className="w-48 h-28 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-8">

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
          <p>Pick your favorite treatment and I&apos;ll apply it to the notes app!</p>
        </footer>
      </div>
    </div>
  );
}
