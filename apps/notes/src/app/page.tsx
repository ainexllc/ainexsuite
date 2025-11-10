'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Loader2, Shield, PenSquare, FolderTree, Wand2, BookOpen, Stamp } from 'lucide-react';
import { LogoWordmark } from '@/components/branding/logo-wordmark';
import { Footer } from '@/components/footer';
import { HomepageTemplate } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  AIHighlight,
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
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'Team' },
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

const aiHighlights: AIHighlight[] = [
  {
    emoji: '🧠',
    title: 'Context Keeper',
    description:
      'AINex Notes remembers decisions and references across projects so every entry starts with shared context.',
  },
  {
    emoji: '🗣️',
    title: 'Voice-to-Insight',
    description:
      'Record a thought and receive structured summaries, tags, and next steps in seconds.',
  },
  {
    emoji: '🪄',
    title: 'Prompted Flow',
    description:
      'Smart prompts nudge deeper thinking when your note feels unfinished.',
  },
];

const productLinks: FooterLink[] = [
  { label: 'Capture Tools', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Templates', href: '/templates', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:notes@ainexsuite.com' },
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
        logo={<LogoWordmark iconSize={88} />}
        appName="notes"
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
          videoUrl: 'https://www.youtube.com/embed/2QznyN9l0SI',
          videoTitle: 'AINex Notes walkthrough',
          sectionTitle: 'Built for thinkers, strategists, and storytellers',
          sectionDescription: 'Whether you\'re drafting a product spec or personal journal, Notes keeps every insight discoverable.',
          cards: featureCards,
        }}
        aiPower={{
          title: 'A thinking partner inside every note',
          description: 'AI reads along, surfaces patterns, and keeps your knowledge base alive with context-rich insights.',
          highlights: aiHighlights,
          demoCard: {
            title: 'Daily Brief',
            subtitle: 'Morning reflection ready for review',
            items: [
              'Research Vaults',
              'Meeting Journals',
              'Product Specs',
              'Creative Briefs',
              'Personal Diaries',
            ],
          },
        }}
        footer={{
          appDisplayName: 'AINex Notes',
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
      <Footer />
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
                <div className="h-16 w-16 rounded-full bg-[#f97316]/20 animate-pulse" />
              </div>
              <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#f97316]" />
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
