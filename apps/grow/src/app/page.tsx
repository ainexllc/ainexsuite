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
  { text: 'Identifying your keystone habits for the week…', emoji: '🧱' },
  { text: 'Designing a morning ritual stack…', emoji: '☀️' },
  { text: 'Reviewing streak data to optimize consistency…', emoji: '🔥' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Habit Stacking',
    description:
      'Build robust routines by linking new habits to existing triggers in your daily flow.',
    icon: Target,
  },
  {
    title: 'Streak Analytics',
    description: 'Visualize your consistency with heatmaps and trend lines that highlight your best days.',
    icon: TrendingUp,
  },
  {
    title: 'Smart Reminders',
    description: 'Context-aware nudges that catch you at the right moment, not when you\'re busy.',
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
  { label: 'Contact Us', href: 'mailto:grow@ainexsuite.com' },
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
  const { needsActivation, checking } = useAppActivation('grow');
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
              <div className="h-16 w-16 rounded-full bg-[#8b5cf6]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#8b5cf6]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="GROW" appColor="#8b5cf6" />}
        backgroundComponent={<LayeredBackground primaryColor="#8b5cf6" secondaryColor="#a78bfa" variant="organic" />}
        appName="grow"
        accentColor="#8b5cf6"
        gradientFrom="#8b5cf6"
        gradientTo="#a78bfa"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Consistency First' },
          headline: 'Build unbreakable habits.',
          subheadline: 'AINex Grow helps you design, track, and stick to the routines that shape your life.',
          description: "Transform your goals into daily actions. Grow provides the structure and accountability you need to make habits stick.",
          highlights: [
            {
              icon: Repeat,
              title: 'Routine Builder',
              description: 'Design morning, evening, and focus routines that put success on autopilot.',
            },
            {
              icon: CheckCircle,
              title: 'Daily Tracking',
              description: 'Log completions instantly and see your progress build over time.',
            },
          ],
        }}
        login={{
          badgeText: 'Habit Hub',
          signUpTitle: 'Join AINex Grow',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to start building better habits today.',
          signInDescription: 'Sign in to access your habit dashboard.',
          footerText: 'Your habit data is private and yours. Export anytime.',
        }}
        features={{
          sectionTitle: 'Built for consistency',
          sectionDescription: 'Grow combines behavioral science with smart tracking to help you show up every day.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="grow"
            appDisplayName="Grow"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Grow",
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