'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  Target,
  Zap,
  Repeat,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Loading your habits and streaks…', emoji: '🔥' },
  { text: 'Calculating your consistency score…', emoji: '📊' },
  { text: 'Ready to build great habits…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Streak Tracking',
    description:
      'Watch your streaks grow. Visual progress bars and calendars keep you motivated day after day.',
    icon: Target,
  },
  {
    title: 'Flexible Schedules',
    description: 'Daily, weekly, or custom schedules. Set habits for specific days or times that work for you.',
    icon: TrendingUp,
  },
  {
    title: 'Shared Habits',
    description: 'Track habits together with family or friends. Build accountability and celebrate wins.',
    icon: Zap,
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
  { label: 'Contact Us', href: 'mailto:grow@ainexspace.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function GrowHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('habits');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your habit dashboard…');
    } else if (user && needsActivation) {
      setLoadingMessage('');
      // setShowActivation(true);
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
              <div className="h-16 w-16 rounded-full bg-[#14b8a6]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#14b8a6]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="habits" appColor="#14b8a6" />}
        backgroundComponent={<LayeredBackground primaryColor="#14b8a6" secondaryColor="#2dd4bf" variant="organic" />}
        appName="habits"
        accentColor="#14b8a6"
        gradientFrom="#14b8a6"
        gradientTo="#2dd4bf"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Build Better Habits' },
          headline: 'Small steps. Big changes.',
          subheadline: 'Simple habit tracking that actually works.',
          description: "Track your daily habits, build streaks, and watch yourself grow. Share habits with family or keep them private. The choice is yours.",
          highlights: [
            {
              icon: Repeat,
              title: 'Visual Progress',
              description: 'Beautiful calendars and charts show your consistency at a glance.',
            },
            {
              icon: CheckCircle,
              title: 'One-Tap Tracking',
              description: 'Mark habits complete with a single tap. Quick, easy, satisfying.',
            },
          ],
        }}
        login={{
          badgeText: 'Free to Start',
          signUpTitle: 'Start Building Habits',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account and start your first habit today.',
          signInDescription: 'Sign in to continue building great habits.',
          footerText: 'Your data is private. Sync across all devices.',
        }}
        features={{
          sectionTitle: 'Simple but powerful',
          sectionDescription: 'Everything you need to build habits that stick. Nothing you don\'t.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="habits"
            appDisplayName="Grow"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Habits",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function GrowHomePage() {
  return <GrowHomePageContent />;
}