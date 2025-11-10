'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { Loader2, Brain, BarChart3, Shield, Palette, Sparkles } from 'lucide-react';
import { AinexStudiosLogo } from '@/components/branding/ainex-studios-logo';
import { Footer } from '@/components/footer';
import { HomepageTemplate } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  AIHighlight,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Reading your latest reflections for key signals…', emoji: '🔎' },
  { text: 'Mapping emotional trends and focus shifts in seconds…', emoji: '🧩' },
  { text: 'Delivering your next breakthrough prompt on demand…', emoji: '🚀' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Adaptive Insight Engine',
    description: 'Surface mood paths, recurring themes, and creative streaks that travel to the day you write.',
    icon: Brain,
  },
  {
    title: 'Momentum Dashboards',
    description: 'Watch trends evolve mood, insight frequency, and forward momentum—not guilt.',
    icon: BarChart3,
  },
  {
    title: 'Locked-Down Privacy',
    description: 'Zero-knowledge encryption, local-first drafts, and granular control keeps every entry private.',
    icon: Shield,
  },
];

const aiHighlights: AIHighlight[] = [
  {
    emoji: '🧠',
    title: 'Context Coach',
    description: 'Understands tone, topics, and energy before shaping your next prompt.',
  },
  {
    emoji: '🗂️',
    title: 'Auto-Organized Memory',
    description: 'Tags every entry with themes, projects, and moods so you can surface anything fast.',
  },
  {
    emoji: '📊',
    title: 'Progress Signals',
    description: 'Highlights habits and inflection points before they harden into patterns.',
  },
];

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Templates', href: '/templates', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:hello@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function MainHomePageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');

  const isFromLogout = searchParams.get('from') === 'logout';

  useEffect(() => {
    if (loading) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !isFromLogout) {
      setLoadingMessage('Welcome back! Redirecting you to your workspace…');
    } else {
      setLoadingMessage('');
    }
  }, [loading, user, isFromLogout]);

  useEffect(() => {
    if (!loading && user && !isFromLogout) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, user, isFromLogout, router]);

  if (loading || (user && !isFromLogout)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[#f97316]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#f97316]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !isFromLogout && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f97316] animate-pulse" />
                  Redirecting to your workspace
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <HomepageTemplate
        logo={<AinexStudiosLogo align="center" size="lg" />}
        appName="journaling"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Encrypted by default' },
          headline: 'You write. AI finds insights.',
          subheadline: 'Mood tracking and prompts, automatically.',
          description: 'Every time you open your workspace, AI reflects on your recent entries, delivers fresh summaries, and asks thoughtful questions to guide your next session.',
          highlights: [
            {
              icon: Sparkles,
              title: 'AI Coached Prompts',
              description: 'Dynamic suggestions tuned to your current tone, goals, and streak.',
            },
            {
              icon: Palette,
              title: 'Multimedia Journaling',
              description: 'Drop in photos, voice notes, and links without breaking your writing flow.',
            },
          ],
        }}
        login={{
          badgeText: 'Early Access',
          signUpTitle: 'Create Account',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to access AINexAgent.',
          signInDescription: 'Sign in to access your AI workspace.',
          footerText: 'We never post or access your data without permission. 30-day trial included.',
        }}
        features={{
          videoUrl: 'https://www.youtube.com/embed/ccw3-B2nKaQ',
          videoTitle: 'AINexAgent demo video',
          sectionTitle: 'Built for writers who demand more than a blank page',
          sectionDescription: 'From onboarding to analytics, every workflow keeps you consistent, curious, and moving forward.',
          cards: featureCards,
        }}
        aiPower={{
          title: 'An AI collaborator that actually knows you',
          description: 'AINexAgent learns from your own words to surface inflection points, ask sharper questions, and keep you tethered to what matters most.',
          highlights: aiHighlights,
          demoCard: {
            title: 'AINexAgent Copilot',
            subtitle: 'Daily Brief',
            items: [
              'Research Notes',
              'Meeting Summaries',
              'Product Ideas',
              'Creative Briefs',
              'Personal Growth',
            ],
          },
        }}
        footer={{
          appDisplayName: 'AINexAgent',
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
      <Footer />
    </>
  );
}

export default function MainHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-[#f97316]/20 animate-pulse" />
              </div>
              <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#f97316]" />
            </div>
            <p className="text-lg font-medium text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <MainHomePageContent />
    </Suspense>
  );
}
