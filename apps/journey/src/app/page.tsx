'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  PenSquare,
  Brain,
  Compass,
  BookOpen,
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
  { text: 'Gathering today\'s reflections and spotting emotional shifts…', emoji: '🧠' },
  { text: 'Connecting memories to projects, people, and priorities…', emoji: '🕸️' },
  { text: 'Drafting prompts to deepen tomorrow\'s journaling session…', emoji: '📝' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Narrative Intelligence',
    description:
      'AINex Journey distills your entries into themes, insights, and story arcs so you see the bigger picture.',
    icon: PenSquare,
  },
  {
    title: 'Emotional Analytics',
    description:
      'Mood, energy, and sentiment tracking expose inflection points and momentum shifts over time.',
    icon: Brain,
  },
  {
    title: 'Memory Map',
    description:
      'Link reflections to goals, people, and places for instant recall when you need them most.',
    icon: Compass,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Journaling Features', href: '/features' },
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
  { label: 'Contact Us', href: 'mailto:journey@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function JourneyHomePageContent() {
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('journey');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  const isBootstrapping = bootstrapStatus === 'running';

  useEffect(() => {
    if (user && needsActivation) {
      setShowActivation(true);
    }
  }, [user, needsActivation]);

  useEffect(() => {
    if (loading || checking || isBootstrapping) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your reflection studio…');
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="JOURNEY" appColor="#06b6d4" />}
        backgroundComponent={<LayeredBackground primaryColor="#06b6d4" secondaryColor="#22d3ee" variant="organic" />}
        appName="journey"
        accentColor="#06b6d4"
        gradientFrom="#06b6d4"
        gradientTo="#22d3ee"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Private by design' },
          headline: 'Write your story.',
          subheadline: 'AINex Journey reflects it back with clarity and warmth.',
          description: 'Capture thoughts, track growth, and let AI surface the patterns that define your personal evolution.',
          highlights: [
            {
              icon: BookOpen,
              title: 'Living Journal',
              description: 'Timeline, calendar, and mood analytics woven into one immersive view.',
            },
            {
              icon: Heart,
              title: 'Emotional Safeguards',
              description: 'Gentle check-ins and support resources when entries signal heavier moments.',
            },
          ],
        }}
        login={{
          badgeText: 'Reflection Suite',
          signUpTitle: 'Join AINex Journey',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to explore deeper insight loops.',
          signInDescription: 'Sign in to access your personal reflection studio.',
          footerText: 'Your reflections stay encrypted and private. Export or delete anytime.',
        }}
        features={{
          sectionTitle: 'Built for thoughtful founders, writers, and seekers',
          sectionDescription: 'Journey keeps your inner work organized, insightful, and ready to inspire your next move.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="journey"
            appDisplayName="Journey"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Journey",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function JourneyHomePage() {
  return <JourneyHomePageContent />;
}
