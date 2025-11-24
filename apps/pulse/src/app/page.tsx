'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  Clock,
  Timer,
  Bell,
  Sun,
  Maximize,
} from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Syncing with your calendar for smart alerts…', emoji: '📅' },
  { text: 'Setting up a 25-minute deep work block…', emoji: '⏲️' },
  { text: 'Adjusting display warmth for evening wind-down…', emoji: '🌙' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Smart Clock Face',
    description:
      'Beautiful, fullscreen time displays that adapt to your environment and schedule.',
    icon: Clock,
  },
  {
    title: 'Focus Timer',
    description:
      'Integrated Pomodoro and flow timers that block distractions and track deep work.',
    icon: Timer,
  },
  {
    title: 'Intelligent Alarms',
    description:
      'Wake up naturally with circadian lighting and sounds that respect your sleep cycle.',
    icon: Bell,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Time Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Integrations', href: '/integrations', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Partners', href: '/partners', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:pulse@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function PulseHomePageContent() {
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('pulse');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);
  const isBootstrapping = bootstrapStatus === 'running';

  useEffect(() => {
    if (loading || checking || isBootstrapping) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your time dashboard…');
    } else if (user && needsActivation) {
      setLoadingMessage('');
      setShowActivation(true);
    } else {
      setLoadingMessage('');
    }
  }, [loading, checking, isBootstrapping, user, needsActivation]);

  useEffect(() => {
    if (!loading && !checking && !isBootstrapping && user && !needsActivation) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, checking, isBootstrapping, user, needsActivation, router]);

  if (loading || checking || isBootstrapping || (user && !needsActivation)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[#ef4444]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#ef4444]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ef4444] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="PULSE" appColor="#ef4444" />}
        backgroundComponent={<LayeredBackground primaryColor="#ef4444" secondaryColor="#f87171" variant="energetic" />}
        appName="pulse"
        accentColor="#ef4444"
        gradientFrom="#ef4444"
        gradientTo="#f87171"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Time Mastery' },
          headline: 'Master your time.',
          subheadline: 'AINex Pulse transforms your screen into an intelligent focus companion.',
          description: 'More than a clock. Pulse combines beautiful time displays with smart tools to help you focus, rest, and stay on schedule.',
          highlights: [
            {
              icon: Maximize,
              title: 'Fullscreen Mode',
              description: 'Turn any device into a dedicated time and focus station.',
            },
            {
              icon: Sun,
              title: 'Wake & Sleep',
              description: 'Rhythms that guide you into deep work and deep rest.',
            },
          ],
        }}
        login={{
          badgeText: 'Time Studio',
          signUpTitle: 'Join AINex Pulse',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to sync your focus timers and settings.',
          signInDescription: 'Sign in to access your smart clock dashboard.',
          footerText: 'Your time data is private. We never sell your schedule.',
        }}
        features={{
          sectionTitle: 'Reclaim your attention',
          sectionDescription: 'Pulse is designed to be seen but not distracting, keeping you grounded in the present moment.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="pulse"
            appDisplayName="Pulse"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Pulse",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function PulseHomePage() {
  return <PulseHomePageContent />;
}