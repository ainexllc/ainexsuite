'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  GraduationCap,
  BookOpen,
  Rocket,
  Lightbulb,
  PenTool,
} from 'lucide-react';
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
  { text: 'Reviewing your focus areas and recent reflections…', emoji: '🔍' },
  { text: 'Pairing mentors, courses, and AI prompts to accelerate learning…', emoji: '⚡' },
  { text: 'Drafting a weekly growth sprint with milestones and nudges…', emoji: '🗓️' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'Mentors' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Adaptive Learning Paths',
    description:
      'Generate multi-week roadmaps for any skill with checkpoints, practice reps, and mentor feedback built in.',
    icon: GraduationCap,
  },
  {
    title: 'Knowledge Vault',
    description:
      'Surface highlights from books, podcasts, and notes automatically organized by topic and priority.',
    icon: BookOpen,
  },
  {
    title: 'Progress Intelligence',
    description:
      'Real-time dashboards show streaks, mastery scores, and confidence trends so you know where to double down.',
    icon: Rocket,
  },
];

const aiHighlights: AIHighlight[] = [
  {
    emoji: '🧠',
    title: 'Context-Aware Coach',
    description:
      'AINex Grow synthesizes your reflections and quiz results to recommend the next exercise or resource.',
  },
  {
    emoji: '✍️',
    title: 'Learning Companion',
    description:
      'Transform raw notes into concise summaries, flashcards, and discussion prompts in one click.',
  },
  {
    emoji: '🎯',
    title: 'Goal Guardrails',
    description:
      'Receive nudges when you drift from priorities, with quick actions to reset your schedule or scope.',
  },
];

const productLinks: FooterLink[] = [
  { label: 'Learning Features', href: '/features' },
  { label: 'Mentor Plans', href: '/pricing' },
  { label: 'Program Library', href: '/programs', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:grow@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function GrowHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('grow');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your learning studio…');
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
        appName="grow"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Mastery-first learning' },
          headline: 'Learn faster. Retain more.',
          subheadline: 'AINex Grow transforms curiosity into mastery with AI-guided paths and accountability.',
          description: 'Whether you're upskilling, pivoting careers, or exploring passions, Grow keeps you progressing with intention.',
          highlights: [
            {
              icon: Lightbulb,
              title: 'Skill Discovery',
              description: 'Explore trending skills and curated roadmaps from experts in your field.',
            },
            {
              icon: PenTool,
              title: 'Interactive Exercises',
              description: 'Quizzes, practice labs, and peer challenges keep learning hands-on.',
            },
          ],
        }}
        login={{
          badgeText: 'Learning Hub',
          signUpTitle: 'Join AINex Grow',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to accelerate skill mastery with AI coaching.',
          signInDescription: 'Sign in to access your personalized learning dashboard.',
          footerText: 'Your learning data stays private and portable. Export progress anytime.',
        }}
        features={{
          videoUrl: 'https://www.youtube.com/embed/bYz9vOQHN4M',
          videoTitle: 'AINex Grow walkthrough',
          sectionTitle: 'Built for lifelong learners and career pivoteers',
          sectionDescription: 'Grow bridges the gap between curiosity and mastery with intelligent scaffolding and peer accountability.',
          cards: featureCards,
        }}
        aiPower={{
          title: 'An AI mentor that adapts to your pace',
          description: 'Grow tailors exercises, surfaces blind spots, and celebrates milestones that matter most to you.',
          highlights: aiHighlights,
          demoCard: {
            title: 'This Week\'s Sprint',
            subtitle: 'Learning path active',
            items: [
              'Product Strategy',
              'AI + Data Foundations',
              'Creative Storytelling',
              'Engineering Leadership',
              'Public Speaking',
            ],
          },
        }}
        footer={{
          appDisplayName: 'AINex Grow',
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="grow"
            appDisplayName="Grow"
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

export default function GrowHomePage() {
  return <GrowHomePageContent />;
}
