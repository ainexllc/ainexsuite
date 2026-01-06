'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  CreditCard,
  BarChart3,
  BellRing,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Scanning for active subscriptions...', emoji: '🔍' },
  { text: 'Analyzing monthly spending trends...', emoji: '📊' },
  { text: 'Identifying potential savings...', emoji: '💰' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Smart Tracking',
    description: 'Keep all your recurring expenses in one place. Never lose track of a trial again.',
    icon: CreditCard,
  },
  {
    title: 'Spend Analytics',
    description: 'Visualize your spending habits with beautiful charts and category breakdowns.',
    icon: BarChart3,
  },
  {
    title: 'Renewal Alerts',
    description: 'Get notified before payments happen so you can cancel unwanted services in time.',
    icon: BellRing,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact', href: 'mailto:support@ainexsuite.com' },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

function TrackHomePageContent() {
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('subs');
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
      setLoadingMessage('Welcome back! Redirecting to dashboard…');
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
  }, [loading, checking, isBootstrapping, user, needsActivation, router]);

  if (loading || checking || isBootstrapping || (user && !needsActivation)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[#10b981]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#10b981]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <HomepageTemplate
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="SUBS" appColor="#10b981" />}
        backgroundComponent={<LayeredBackground primaryColor="#10b981" secondaryColor="#34d399" variant="organic" />}
        appName="subs"
        accentColor="#10b981"
        gradientFrom="#10b981"
        gradientTo="#34d399"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Wallet, text: 'Financial Clarity' },
          headline: 'Master your recurring expenses.',
          subheadline: 'Stop paying for subscriptions you don\'t use. Track, manage, and optimize your spending effortlessly.',
          description: "The average person wastes hundreds of dollars a year on forgotten subscriptions. Take control today.",
          highlights: [
            {
              icon: ShieldCheck,
              title: 'Total Control',
              description: 'See every penny leaving your account for subscriptions in one dashboard.',
            },
            {
              icon: BarChart3,
              title: 'Insightful Data',
              description: 'Understand where your money goes with detailed category breakdowns.',
            },
          ],
        }}
        login={{
          badgeText: 'Finance Hub',
          signUpTitle: 'Start Tracking',
          signInTitle: 'Welcome Back',
          signUpDescription: 'Join to start saving money on your subscriptions.',
          signInDescription: 'Sign in to view your subscription dashboard.',
          footerText: 'Secure and private financial tracking.',
        }}
        features={{
          sectionTitle: 'Why Track?',
          sectionDescription: 'Designed to help you keep more of your hard-earned money.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="subs"
            appDisplayName="Subs"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Subs",
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
