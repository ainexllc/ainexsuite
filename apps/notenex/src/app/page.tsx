"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Brain,
  Palette,
  Sparkles,
  Shield,
  Menu,
  X,
  Tags,
  Clock,
} from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { AuthBox } from "@/components/auth/auth-box";
import { LogoWordmark } from "@/components/branding/logo-wordmark";

const demoSteps = [
  { text: "Organizing your notes intelligently…", emoji: "🗂️" },
  { text: "Generating smart suggestions…", emoji: "💡" },
  { text: "Analyzing your workflow patterns…", emoji: "📊" },
];

const featureCards = [
  {
    title: "Smart AI Organization",
    description:
      "Automatically categorize, tag, and connect related notes with intelligent insights.",
    icon: <Brain className="h-7 w-7" />,
  },
  {
    title: "Flexible Layouts",
    description:
      "Switch between grid, list, and kanban views. Color-code, pin, and archive with ease.",
    icon: <Palette className="h-7 w-7" />,
  },
  {
    title: "Privacy-First Design",
    description:
      "Your notes stay yours. Secure cloud sync with optional local-first mode and full export control.",
    icon: <Shield className="h-7 w-7" />,
  },
];

const aiHighlights = [
  {
    emoji: "🏷️",
    title: "Auto Tagging",
    description: "Notes are tagged with topics and categories automatically.",
  },
  {
    emoji: "🔗",
    title: "Smart Linking",
    description: "Discover connections between your notes and ideas.",
  },
  {
    emoji: "⚡",
    title: "Quick Capture",
    description: "Capture ideas fast with keyboard shortcuts and voice input.",
  },
];

export default function HomePage() {
  const { status } = useAuth();
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoSteps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/workspace");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#f97316]" />
          <p className="text-lg font-medium text-white">Checking your session…</p>
          <p className="text-sm text-gray-500">Restoring your workspace if you&apos;re already logged in</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#f97316]" />
          <p className="text-lg font-medium text-white">Welcome back!</p>
          <p className="text-sm text-gray-500">Taking you to your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <LogoWordmark href="/" iconSize={96} variant="dark" />
        <div className="hidden items-center gap-3 md:flex">
          <span className="hidden rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#f97316] lg:inline-flex">
            Beta access
          </span>
          <a
            href="#features"
            className="text-sm text-white/60 transition hover:text-white"
          >
            Features
          </a>
          <a
            href="#ai-power"
            className="text-sm text-white/60 transition hover:text-white"
          >
            AI Features
          </a>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white/5 md:hidden"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>
      {isMobileMenuOpen && (
        <div className="px-6 pb-6 md:hidden">
          <nav className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b]/90 p-6 text-sm font-medium text-white/70">
            <span className="inline-flex rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#f97316]">
              Beta access
            </span>
            {[
              { href: "#features", label: "Features" },
              { href: "#ai-power", label: "AI Features" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <main className="pt-24 sm:pt-28 lg:pt-32">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/10 via-[#0a0a0a] to-[#0a0a0a]" />
            <div className="absolute left-1/3 top-10 h-48 w-48 rounded-full bg-[#f97316]/10 blur-3xl" />
            <div className="absolute right-10 top-1/2 h-36 w-36 rounded-full bg-[#FFB347]/10 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:px-8">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/70 px-4 py-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                <Shield className="h-3.5 w-3.5" />
                Private by design
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-[#FF7A18] to-[#FFB347] bg-clip-text text-transparent">
                  Your AI-powered note workspace
                </span>
                <br />
                <span className="text-white">
                  designed for clarity and focus.
                </span>
              </h1>
              <p className="text-lg text-gray-400 sm:text-xl">
                Capture ideas, organize effortlessly, and discover insights
                with smart layouts, tags, and AI that adapts to your workflow.
              </p>

              <div className="grid gap-4 rounded-3xl border border-gray-800 bg-gray-900/80 p-5 backdrop-blur sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Smart Organization
                    </p>
                    <p className="text-xs text-gray-400">
                      Auto-tagging and intelligent categorization
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Quick Capture
                    </p>
                    <p className="text-xs text-gray-400">
                      Keyboard shortcuts and voice input support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="login" className="relative">
              <div className="absolute inset-0 -translate-y-6 rounded-3xl bg-gradient-to-tr from-[#f97316]/15 via-transparent to-[#FFB347]/20 blur-2xl" />
              <AuthBox className="relative" />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Why choose NoteNex
            </h2>
            <p className="mt-3 text-lg text-gray-400">
              Purpose-built tools to keep you organized, supported by AI that
              actually helps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-gray-800 bg-gray-900 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316]">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="ai-power" className="bg-gray-900/60 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  AI that organizes with you
                </h2>
                <p className="text-lg text-gray-400">
                  NoteNex doesn&apos;t just store—it connects, categorizes, and
                  surfaces the notes you need when you need them.
                </p>
                <ul className="space-y-4 text-gray-400">
                  {aiHighlights.map((item) => (
                    <li
                      key={item.title}
                      className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-[#0a0a0a]/80 p-4"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <p className="font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <div className="rounded-3xl border border-gray-800 bg-[#0a0a0a]/80 p-6 shadow-lg">
                  <div className="flex items-center gap-3 rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-400">
                    <Sparkles className="h-5 w-5 text-[#f97316]" />
                    NoteNex AI Assistant
                  </div>
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-gray-400">Live demo</p>
                    <div className="rounded-2xl border border-dashed border-gray-800 bg-[#0a0a0a]/60 p-6">
                      <div className="flex items-center gap-3 text-white">
                        <span className="text-2xl">
                          {demoSteps[activeDemo].emoji}
                        </span>
                        <span className="text-sm font-medium">
                          {demoSteps[activeDemo].text}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Your data stays private—AI runs on notes you choose,
                      with full control and export options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="themes" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/80 p-8 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  Make it yours
                </h2>
                <p className="text-lg text-gray-400">
                  Choose from multiple layouts, customize colors, and switch
                  themes without losing your workflow.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7A18]" />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFB347]" />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f97316]/40" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Grid View",
                  "List View",
                  "Focus Mode",
                  "Kanban Board",
                  "Archive View",
                ].map((layout) => (
                  <div
                    key={layout}
                    className="rounded-2xl border border-gray-800 bg-[#0a0a0a]/70 p-4 text-sm font-medium text-white"
                  >
                    {layout}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 bg-gray-900/80 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center text-sm text-gray-400 sm:flex-row sm:justify-between sm:text-left">
          <LogoWordmark iconSize={80} variant="dark" />
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            <a href="#login" className="hover:text-[#f97316]">
              Sign in
            </a>
            <a href="#login" className="hover:text-[#f97316]">
              Create account
            </a>
            <a href="#features" className="hover:text-[#f97316]">
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
