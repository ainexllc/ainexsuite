'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  Sparkles,
  Target,
  BarChart3,
  CalendarDays,
  ListChecks,
  PenLine,
} from 'lucide-react';
import { LogoWordmark } from '@/components/branding/logo-wordmark';
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
  { text: 'Scanning streaks and energy logs to shape today's focus…', emoji: '🔥' },
  { text: 'Highlighting habit conflicts and suggesting better timing…', emoji: '⏱️' },
  { text: 'Drafting a weekly rhythm tuned to your goals and season…', emoji: '🗓️' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'Coaching' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Adaptive Habit Builder',
    description:
      'Design micro-habits with AI that respect your schedule, energy, and existing commitments.',
    icon: Target,
  },
  {
    title: 'Streak Intelligence',
    description:
      'Real-time dashboards reveal momentum, burnout risk, and habit stacking opportunities.',
    icon: BarChart3,
  },
  {
    title: 'Rhythm Planning',
    description:
      'Weekly and seasonal planners help you stay consistent across focus blocks, rituals, and rest days.',
    icon: CalendarDays,
  },
];

const aiHighlights: AIHighlight[] = [
  {
    emoji: '🧠',
    title: 'Behavioral Insights',
    description:
      'AINex Track translates your completion patterns into actionable feedback and celebration moments.',
  },
  {
    emoji: '⏳',
    title: 'Time-Aware Suggestions',
    description:
      'Receive personalized nudges when streaks slip or when a new habit fits your calendar perfectly.',
  },
  {
    emoji: '🏆',
    title: 'Goal Alignment',
    description:
      'Link habits to outcomes so every daily action pushes your long-term goals forward.',
  },
];

const productLinks: FooterLink[] = [
  { label: 'Habit Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Templates', href: '/templates', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Community', href: '/community', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:track@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function TrackHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('track');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your habit studio…');
    } else if (user && needsActivation) {
      setLoadingMessage('');
      setShowActivation(true);
    } else {
      setLoadingMessage('');
    }
  }, [loading, checking, user, needsActivation]);

  useEffect(() => {
    if (!loading && !checking && user && !needsActivation) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, checking, user, needsActivation, router]);

  if (loading || checking || (user && !needsActivation)) {
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
              {user && !needsActivation && (
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
        logo={<LogoWordmark iconSize={88} />}
        appName="track"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Behavior-first planning' },
          headline: 'Small wins. Compounding results.',
          subheadline: 'AINex Track keeps every habit aligned with your next milestone.',
          description: 'Build rituals that last, understand your streaks, and let AI coach you through setbacks before they stick.',
          highlights: [
            {
              icon: ListChecks,
              title: 'Routine Templates',
              description: 'Start with proven templates or import your own ritual playbooks.',
            },
            {
              icon: PenLine,
              title: 'Daily Reflections',
              description: 'Capture quick notes after each habit and watch AI surface patterns.',
            },
          ],
        }}
        login={{
          badgeText: 'Habit Studio',
          signUpTitle: 'Join AINex Track',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to craft consistent habits with AI support.',
          signInDescription: 'Sign in to access your habit intelligence hub.',
          footerText: 'Your data stays encrypted and portable. Export streaks anytime.',
        }}
        features={{
          videoUrl: 'https://www.youtube.com/embed/mgxI8W5fzl0',
          videoTitle: 'AINex Track walkthrough',
          sectionTitle: 'Built for ambitious creators and teams',
          sectionDescription: 'Track keeps every habit connected to the bigger picture, so momentum never slips through the cracks.',
          cards: featureCards,
        }}
        aiPower={{
          title: 'An AI accountability partner on call',
          description: 'Track analyzes your routines, surfaces powerful insights, and keeps you accountable with kindness.',
          highlights: aiHighlights,
          demoCard: {
            title: 'Daily Reflection',
            subtitle: 'Evening sync complete',
            items: [
              'Morning Momentum',
              'Deep Work Blocks',
              'Recharge Ritual',
              'Creative Sprint',
              'Evening Shutdown',
            ],
          },
        }}
        footer={{
          appDisplayName: 'AINex Track',
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="track"
            appDisplayName="Track"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
      />
      <Footer />
    </>
  );
}

export default function TrackHomePage() {
  return <TrackHomePageContent />;
}
