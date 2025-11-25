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
  Moon,
  Heart,
} from 'lucide-react';

import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Logging your morning health check-in…', emoji: '' },
  { text: 'Calculating sleep quality trends…', emoji: '' },
  { text: 'Analyzing your wellness patterns…', emoji: '' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Body Metrics',
    description:
      'Track weight, sleep, hydration, and energy levels. See trends that reveal your health patterns.',
    icon: Scale,
  },
  {
    title: 'Sleep & Recovery',
    description:
      'Log sleep hours and quality. Understand how rest affects your energy and mood.',
    icon: Moon,
  },
  {
    title: 'Wellness Insights',
    description:
      'AI-powered analysis identifies correlations between your habits and how you feel.',
    icon: TrendingUp,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Health Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Community', href: '/community', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:health@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function HealthHomePageContent() {
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('health');
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
      setLoadingMessage('Welcome back! Redirecting you to your health dashboard…');
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
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-emerald-500" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="HEALTH" appColor="#10b981" />}
        backgroundComponent={<LayeredBackground primaryColor="#10b981" secondaryColor="#34d399" variant="structured" />}
        appName="health"
        accentColor="#10b981"
        gradientFrom="#10b981"
        gradientTo="#34d399"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Privacy-first wellness' },
          headline: 'Your body. Your data. Your journey.',
          subheadline: 'AINex Health turns daily check-ins into actionable wellness insights.',
          description: 'Track weight, sleep, hydration, energy, and vitals. Discover patterns that help you feel your best.',
          highlights: [
            {
              icon: Heart,
              title: 'Holistic Tracking',
              description: 'Monitor body metrics, sleep quality, hydration, and energy in one place.',
            },
            {
              icon: Activity,
              title: 'Smart Insights',
              description: 'AI identifies correlations between your habits and how you feel.',
            },
          ],
        }}
        login={{
          badgeText: 'Wellness Tracker',
          signUpTitle: 'Join AINex Health',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to start tracking your wellness journey.',
          signInDescription: 'Sign in to access your health dashboard.',
          footerText: 'Your health data is encrypted and yours alone. Export anytime.',
        }}
        features={{
          sectionTitle: 'Built for wellness',
          sectionDescription: 'Health helps you understand the connection between what you do and how you feel.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="health"
            appDisplayName="Health"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Health",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function HealthHomePage() {
  return <HealthHomePageContent />;
}
