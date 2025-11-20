'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  Scale,
  Activity,
  TrendingUp,
  Ruler,
  LineChart,
} from 'lucide-react';

import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Logging your morning weigh-in…', emoji: '⚖️' },
  { text: 'Calculating weekly average and trend lines…', emoji: '📊' },
  { text: 'Projecting progress toward your goal weight…', emoji: '📉' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Smart Weight Log',
    description:
      'Log daily with one tap. AI smooths out fluctuations to show your true trend.',
    icon: Scale,
  },
  {
    title: 'Body Metrics',
    description:
      'Track measurements, body fat %, and muscle mass alongside your weight.',
    icon: Ruler,
  },
  {
    title: 'Goal Forecasting',
    description:
      'See when you\'ll hit your target based on your current rate of progress.',
    icon: TrendingUp,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Tracking Features', href: '/features' },
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
      setLoadingMessage('Welcome back! Redirecting you to your tracking dashboard…');
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="TRACK" appColor="#14b8a6" />}
        backgroundComponent={<LayeredBackground primaryColor="#14b8a6" secondaryColor="#2dd4bf" variant="structured" />}
        appName="track"
        accentColor="#14b8a6"
        gradientFrom="#14b8a6"
        gradientTo="#2dd4bf"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Privacy-first tracking' },
          headline: 'Track your progress. Visualize change.',
          subheadline: 'AINex Track turns daily data points into a clear picture of your health journey.',
          description: 'Simple, intelligent logging for weight, measurements, and body composition. See the trends that matter.',
          highlights: [
            {
              icon: LineChart,
              title: 'Smart Charts',
              description: 'Visualize your trajectory with smoothing that hides noise and reveals progress.',
            },
            {
              icon: Activity,
              title: 'Body Comp',
              description: 'Track more than just scale weight—monitor muscle, fat, and measurements.',
            },
          ],
        }}
        login={{
          badgeText: 'Health Tracker',
          signUpTitle: 'Join AINex Track',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to start tracking your body metrics.',
          signInDescription: 'Sign in to access your tracking dashboard.',
          footerText: 'Your health data is encrypted and yours alone. Export anytime.',
        }}
        features={{
          videoUrl: 'https://www.youtube.com/embed/mgxI8W5fzl0',
          videoTitle: 'AINex Track walkthrough',
          sectionTitle: 'Built for clarity',
          sectionDescription: 'Track cuts through the noise of daily fluctuations to show you the real story of your progress.',
          cards: featureCards,
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
        footer={{
          appDisplayName: "AINex Track",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function TrackHomePage() {
  return <TrackHomePageContent />;
}