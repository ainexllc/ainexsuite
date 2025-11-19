'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  BrainCircuit,
  HeartPulse,
  LineChart,
  Dumbbell,
  Timer,
} from 'lucide-react';
import { Footer } from '@/components/footer';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Syncing your wearable data and recent workouts…', emoji: '📡' },
  { text: 'Spotting plateaus and overtraining risks instantly…', emoji: '📉' },
  { text: 'Generating a fresh training block with AI coaching…', emoji: '🤖' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Adaptive Programming',
    description:
      'Daily training plans evolve with your recovery, goals, and logged performance—no spreadsheets required.',
    icon: BrainCircuit,
  },
  {
    title: 'Performance Intelligence',
    description:
      'Visualize strength trends, energy zones, and readiness signals in dashboards designed for athletes.',
    icon: LineChart,
  },
  {
    title: 'Recovery Guardrails',
    description:
      'Automatic deload prompts, sleep sync, and mobility reminders keep you progressing without burnout.',
    icon: HeartPulse,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Training Features', href: '/features' },
  { label: 'Coaching Plans', href: '/pricing' },
  { label: 'Program Library', href: '/programs', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Ambassadors', href: '/coaches', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:coach@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function FitHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('fit');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your training hub…');
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
              <div className="h-16 w-16 rounded-full bg-[#22c55e]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#22c55e]" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="FIT" appColor="#22c55e" />}
        backgroundComponent={<LayeredBackground primaryColor="#22c55e" secondaryColor="#4ade80" variant="energetic" />}
        appName="fit"
        accentColor="#22c55e"
        gradientFrom="#22c55e"
        gradientTo="#4ade80"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Recovery-first programming' },
          headline: 'Train smarter. Recover stronger.',
          subheadline: 'AINex Fit turns data into daily plans that respect your limits and push your ceiling.',
          description: 'From novice to elite, adaptive AI ensures every session builds momentum without burning you out.',
          highlights: [
            {
              icon: Dumbbell,
              title: 'Exercise Library',
              description: 'Technique videos, progression charts, and mobility drills at your fingertips.',
            },
            {
              icon: Timer,
              title: 'Session Timer',
              description: 'Built-in intervals, rest reminders, and rep counters keep workouts efficient.',
            },
          ],
        }}
        login={{
          badgeText: 'Training Studio',
          signUpTitle: 'Join AINex Fit',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to unlock AI-powered training plans.',
          signInDescription: 'Sign in to access your personalized coaching dashboard.',
          footerText: 'Your training data stays private and exportable. Cancel anytime.',
        }}
        features={{
          videoUrl: 'https://www.youtube.com/embed/fDcY55DhP0g',
          videoTitle: 'AINex Fit demo',
          sectionTitle: 'Built for athletes who value progress over perfection',
          sectionDescription: 'Fit meets you where you are and guides you to where you want to go—one intelligent session at a time.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="fit"
            appDisplayName="Fit"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
      />
      <Footer
        appName="AINex Fit"
        productLinks={productLinks}
        companyLinks={companyLinks}
        resourceLinks={resourceLinks}
        legalLinks={legalLinks}
      />
    </>
  );
}

export default function FitHomePage() {
  return <FitHomePageContent />;
}
