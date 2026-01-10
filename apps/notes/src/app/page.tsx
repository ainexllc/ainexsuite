'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Loader2, Shield, Palette, FolderTree, Wand2, ListChecks, Bell } from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import { useAppColors } from '@ainexsuite/theme';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Syncing your notes across all devices…', emoji: '🔄' },
  { text: 'Organizing ideas with smart color-coded folders…', emoji: '🎨' },
  { text: 'Your workspace is ready to go…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Colorful & Customizable',
    description:
      'Choose from 12 vibrant colors, patterns, and backgrounds. Make every note uniquely yours with covers and visual styling.',
    icon: Palette,
  },
  {
    title: 'Labels & Spaces',
    description:
      'Organize with color-coded labels, create workspaces for personal, family, or work, and filter to find anything instantly.',
    icon: FolderTree,
  },
  {
    title: 'AI-Powered Insights',
    description:
      'Generate summaries, extract action items, and get smart tag suggestions. Let AI help you make sense of your notes.',
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


function NotesHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('notes');
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
      setLoadingMessage('Welcome back! Redirecting you to your notes workspace…');
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="notes" appColor={primary} />}
        backgroundComponent={<LayeredBackground primaryColor={primary} secondaryColor={secondary} variant="organic" />}
        appName="notes"
        accentColor={primary}
        gradientFrom={primary}
        gradientTo={secondary}
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Beautifully organized notes' },
          headline: 'Colorful notes. Clear thinking.',
          subheadline: 'Capture ideas in vibrant, organized notes that sync everywhere.',
          description: 'Text notes, checklists, and quick templates — all color-coded and searchable. Set reminders, collaborate with others, and let AI help you stay on top of everything.',
          highlights: [
            {
              icon: ListChecks,
              title: 'Notes & Checklists',
              description: 'Rich text editing, to-do lists, and ready-made templates for any purpose.',
            },
            {
              icon: Bell,
              title: 'Smart Reminders',
              description: 'Get notified via push, email, or SMS. Never forget an important note.',
            },
          ],
        }}
        login={{
          badgeText: 'Free to start',
          signUpTitle: 'Start taking notes',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to start capturing ideas in colorful, organized notes.',
          signInDescription: 'Sign in to access your notes, labels, and workspaces.',
          footerText: 'Your notes sync across all devices. Private and secure.',
        }}
        features={{
          sectionTitle: 'Everything you need to stay organized',
          sectionDescription: 'From quick shopping lists to detailed project notes, with focus mode, sharing, and calendar views built in.',
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

export default function NotesHomePage() {
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
      <NotesHomePageContent />
    </Suspense>
  );
}
