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
  { text: 'Indexing your latest captures and highlights…', emoji: '🗂️' },
  { text: 'Generating synthesis cards from yesterday\'s thinking…', emoji: '📝' },
  { text: 'Drafting prompts so your next note starts focused…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Multimodal Capture',
    description:
      'Drop in ideas from voice, handwriting, or web snippets. Notes auto-transcribe, tag, and sync instantly.',
    icon: PenSquare,
  },
  {
    title: 'Dynamic Knowledge Spaces',
    description:
      'Group notes into living canvases that reveal themes, backlinks, and dependencies without manual sorting.',
    icon: FolderTree,
  },
  {
    title: 'AI-Powered Synthesis',
    description:
      'Summaries, action items, and follow-up questions appear the moment you finish writing.',
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
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('journal');
  const { primary, secondary, loading: colorsLoading } = useAppColors();
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
      setLoadingMessage('Welcome back! Redirecting you to your reflection studio…');
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="notes" appColor={primary} />}
        backgroundComponent={<LayeredBackground primaryColor={primary} secondaryColor={secondary} variant="organic" />}
        appName="notes"
        accentColor={primary}
        gradientFrom={primary}
        gradientTo={secondary}
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Secure knowledge base' },
          headline: 'Capture. Synthesize. Share clarity.',
          subheadline: 'AINex Notes transforms scattered thoughts into searchable insight.',
          description: 'Record ideas from anywhere, organize them automatically, and surface connections you didn\'t know existed.',
          highlights: [
            {
              icon: BookOpen,
              title: 'Living Libraries',
              description: 'Build narrative hubs that update as your projects evolve.',
            },
            {
              icon: Stamp,
              title: 'Instant Summaries',
              description: 'Every note ends with highlights, next steps, and shareable briefs.',
            },
          ],
        }}
        login={{
          badgeText: 'Early Creators',
          signUpTitle: 'Join AINex Notes',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to unlock AI-accelerated note-taking.',
          signInDescription: 'Sign in to access your connected knowledge workspace.',
          footerText: 'Your ideas stay encrypted and private. Export anytime.',
        }}
        features={{
          sectionTitle: 'Built for thinkers, strategists, and storytellers',
          sectionDescription: 'Whether you\'re drafting a product spec or personal journal, Notes keeps every insight discoverable.',
          cards: featureCards,
        }}
        footer={{
          appDisplayName: "AINex Notes",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="notes"
            appDisplayName="Notes"
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
