"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Brain,
  Palette,
  Shield,
  Tags,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthBox } from "@/components/auth/auth-box";
import { LogoWordmark } from "@/components/branding/logo-wordmark";
import { Footer } from "@/components/footer";
import { HomepageTemplate } from "@ainexsuite/ui/components";
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  AIHighlight,
  FooterLink,
} from "@ainexsuite/ui/components";

const demoSteps: DemoStep[] = [
  { text: "Organizing your notes intelligently…", emoji: "🗂️" },
  { text: "Generating smart suggestions…", emoji: "💡" },
  { text: "Analyzing your workflow patterns…", emoji: "📊" },
];

const navLinks: NavLink[] = [
  { href: "#features", label: "Features" },
  { href: "#ai-power", label: "AI Features" },
];

const featureCards: FeatureCard[] = [
  {
    title: "Smart AI Organization",
    description:
      "Automatically categorize, tag, and connect related notes with intelligent insights.",
    icon: Brain,
  },
  {
    title: "Flexible Layouts",
    description:
      "Switch between grid, list, and kanban views. Color-code, pin, and archive with ease.",
    icon: Palette,
  },
  {
    title: "Privacy-First Design",
    description:
      "Your notes stay yours. Secure cloud sync with optional local-first mode and full export control.",
    icon: Shield,
  },
];

const aiHighlights: AIHighlight[] = [
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

const productLinks: FooterLink[] = [
  { label: "Features", href: "#features" },
  { label: "AI Features", href: "#ai-power" },
];

const companyLinks: FooterLink[] = [
  { label: "About", href: "/about", external: true },
  { label: "Blog", href: "/blog", external: true },
];

const resourceLinks: FooterLink[] = [
  { label: "Help Center", href: "/help", external: true },
  { label: "Contact Us", href: "mailto:support@notenex.com" },
];

const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy", external: true },
  { label: "Terms of Service", href: "/terms", external: true },
];

export default function HomePage() {
  const { status } = useAuth();
  const router = useRouter();

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
          <p className="text-sm text-gray-500">
            Restoring your workspace if you&apos;re already logged in
          </p>
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
    <>
      <HomepageTemplate
        logo={<LogoWordmark href="/" iconSize={96} variant="dark" />}
        appName="notenex"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: "Private by design" },
          headline: "Your AI-powered note workspace",
          subheadline: "designed for clarity and focus.",
          description:
            "Capture ideas, organize effortlessly, and discover insights with smart layouts, tags, and AI that adapts to your workflow.",
          highlights: [
            {
              icon: Tags,
              title: "Smart Organization",
              description: "Auto-tagging and intelligent categorization",
            },
            {
              icon: Clock,
              title: "Quick Capture",
              description: "Keyboard shortcuts and voice input support",
            },
          ],
        }}
        login={{
          badgeText: "Beta access",
          signUpTitle: "Join NoteNex",
          signInTitle: "Welcome back",
          signUpDescription: "Create your account to start organizing your notes with AI.",
          signInDescription: "Sign in to access your intelligent note workspace.",
          footerText:
            "We never post or access your data without permission.",
        }}
        features={{
          videoUrl: "",
          videoTitle: "NoteNex demo",
          sectionTitle: "Why choose NoteNex",
          sectionDescription:
            "Purpose-built tools to keep you organized, supported by AI that actually helps.",
          cards: featureCards,
        }}
        aiPower={{
          title: "AI that organizes with you",
          description:
            "NoteNex doesn't just store—it connects, categorizes, and surfaces the notes you need when you need them.",
          highlights: aiHighlights,
          demoCard: {
            title: "NoteNex AI Assistant",
            subtitle: "Live demo",
            items: [
              "Project Notes",
              "Meeting Minutes",
              "Research Ideas",
              "Personal Journal",
              "Quick Captures",
            ],
          },
        }}
        footer={{
          appDisplayName: "NoteNex",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        activationComponent={<AuthBox className="relative" />}
      />
      <Footer />
    </>
  );
}
