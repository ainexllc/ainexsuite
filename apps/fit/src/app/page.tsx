'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Dumbbell,
  UtensilsCrossed,
  ChefHat,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Logging your morning workout and tracking personal records...', emoji: '💪' },
  { text: 'Calculating macros and finding recipes that fit your goals...', emoji: '🥗' },
  { text: 'Analyzing your progress and suggesting next steps...', emoji: '📊' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Workout Tracking',
    description:
      'Log workouts, exercises, sets, and reps. Track personal records and see your strength progression over time.',
    icon: Dumbbell,
  },
  {
    title: 'Smart Nutrition',
    description:
      'Track meals, macros, and calories. Search recipes and get AI-powered meal suggestions that fit your goals.',
    icon: UtensilsCrossed,
  },
  {
    title: 'Body Metrics',
    description:
      'Monitor weight, water intake, and supplements. Visualize trends and stay on track with your fitness journey.',
    icon: TrendingUp,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Fitness Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Workout Library', href: '/workouts', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:fit@ainexsuite.com' },
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
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('fit');
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
      setLoadingMessage('Welcome back! Loading your fitness dashboard...');
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
              <div className="h-16 w-16 rounded-full bg-[#3b82f6]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#3b82f6]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="FIT" appColor="#3b82f6" />}
        backgroundComponent={<LayeredBackground primaryColor="#3b82f6" secondaryColor="#22c55e" variant="structured" />}
        appName="fit"
        accentColor="#3b82f6"
        gradientFrom="#3b82f6"
        gradientTo="#22c55e"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Dumbbell, text: 'Track your gains' },
          headline: 'Train smarter. Eat better. Get results.',
          subheadline: 'AINex Fit is your complete fitness companion.',
          description: 'Track workouts, log nutrition, discover recipes, and monitor your body metrics. AI helps you stay consistent and reach your goals faster.',
          highlights: [
            {
              icon: ChefHat,
              title: 'Recipe Discovery',
              description: 'Find and save recipes that match your macros and dietary preferences.',
            },
            {
              icon: Scale,
              title: 'Progress Tracking',
              description: 'Visualize weight trends, personal records, and fitness milestones.',
            },
          ],
        }}
        login={{
          badgeText: 'Fitness Suite',
          signUpTitle: 'Join AINex Fit',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to start tracking your fitness journey.',
          signInDescription: 'Sign in to access your fitness dashboard.',
          footerText: 'Your fitness data stays encrypted and synced across all Ainex apps.',
        }}
        features={{
          sectionTitle: 'Everything you need to reach your fitness goals',
          sectionDescription: 'From workout logging to meal planning, AINex Fit gives you the tools to train consistently and eat smart.',
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
        footer={{
          appDisplayName: "AINex Fit",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function FitHomePage() {
  return <FitHomePageContent />;
}
