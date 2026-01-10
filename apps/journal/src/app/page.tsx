'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Loader2, Shield, PenSquare, FolderTree, Wand2, BookOpen, Stamp } from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import { useAppColors } from '@ainexsuite/theme';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Preparing your personal reflection space…', emoji: '📖' },
  { text: 'Analyzing mood patterns from recent entries…', emoji: '💭' },
  { text: 'Your journal is ready for today\'s story…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Mood Tracking',
    description:
      'Track how you feel with each entry. Visualize emotional patterns over time with beautiful charts and insights.',
    icon: PenSquare,
  },
  {
    title: 'Beautiful Covers',
    description:
      'Each entry gets a stunning cover image. Choose from curated backgrounds or let AI generate one from your words.',
    icon: FolderTree,
  },
  {
    title: 'AI Sentiment Analysis',
    description:
      'Understand your emotional journey. AI analyzes your writing to reveal patterns and trends in your wellbeing.',
    icon: Wand2,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/features' },
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
  { label: 'Contact Us', href: 'mailto:notes@ainexspace.com' },
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
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('journal');
  const { primary, secondary, loading: colorsLoading } = useAppColors();
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your reflection studio…');
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
              <div className="h-16 w-16 rounded-full bg-[rgb(var(--color-primary-rgb)/0.2)] animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[var(--color-primary)]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  Redirecting to your workspace
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Don't render until colors are loaded
  if (colorsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[rgb(var(--color-primary-rgb)/0.2)] animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[var(--color-primary)]" />
          </div>
          <p className="text-lg font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HomepageTemplate
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="journal" appColor={primary} />}
        backgroundComponent={<LayeredBackground primaryColor={primary} secondaryColor={secondary} variant="organic" />}
        appName="journal"
        accentColor={primary}
        gradientFrom={primary}
        gradientTo={secondary}
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Private & Secure' },
          headline: 'Write your story. Understand yourself.',
          subheadline: 'A beautiful space for daily reflection and self-discovery.',
          description: 'Capture your thoughts, track your moods, and watch your personal story unfold. AI-powered insights help you understand patterns in your emotional journey.',
          highlights: [
            {
              icon: BookOpen,
              title: 'Daily Reflections',
              description: 'Rich text entries with mood tracking, tags, and beautiful cover images.',
            },
            {
              icon: Stamp,
              title: 'AI Cover Summaries',
              description: 'Each entry gets a poetic summary that captures its essence.',
            },
          ],
        }}
        login={{
          badgeText: 'Free to Start',
          signUpTitle: 'Start Your Journal',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account and begin your journaling practice today.',
          signInDescription: 'Sign in to continue your reflection journey.',
          footerText: 'Your entries are private and encrypted. Always.',
        }}
        features={{
          sectionTitle: 'Journaling that grows with you',
          sectionDescription: 'More than a diary. A personal companion that helps you understand your thoughts and emotions.',
          cards: featureCards,
        }}
        footer={{
          appDisplayName: "AINex Journal",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="journal"
            appDisplayName="Journal"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
      />
    </>
  );
}

export default function JournalHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-[rgb(var(--color-primary-rgb)/0.2)] animate-pulse" />
              </div>
              <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[var(--color-primary)]" />
            </div>
            <p className="text-lg font-medium text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <JourneyHomePageContent />
    </Suspense>
  );
}
