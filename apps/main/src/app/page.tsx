'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useAppColors } from '@ainexsuite/theme';
import {
  Loader2,
  Brain,
  BarChart3,
  Shield,
  BookOpen,
  StickyNote,
  Dumbbell,
  TrendingUp,
  Camera,
  Heart,
  CheckSquare,
  Activity,
  FolderKanban,
  Workflow as WorkflowIcon,
  Link as LinkIcon,
  Database,
  Users
} from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo } from '@ainexsuite/ui/components';
import { DynamicBackground } from '@/components/dynamic-background';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
  AppCard,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Connecting your notes, journal, tasks, and fitness data…', emoji: '🔄' },
  { text: 'AI analyzing your patterns and preparing insights…', emoji: '🧠' },
  { text: 'Welcome to your personal command center…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/plans', label: 'Plans' },
];

const appCards: AppCard[] = [
  {
    name: 'Notes',
    description: 'Beautiful, colorful notes with rich formatting. Organize ideas with labels, pin important notes, and find anything instantly.',
    icon: StickyNote,
    color: '#eab308',
    href: 'https://notes.ainexspace.com',
  },
  {
    name: 'Journal',
    description: 'Daily reflections with mood tracking, AI-powered sentiment analysis, and beautiful cover images. Your story, beautifully captured.',
    icon: BookOpen,
    color: '#f97316',
    href: 'https://journal.ainexspace.com',
  },
  {
    name: 'Todo',
    description: 'Smart task management with priorities, due dates, and recurring tasks. Organize with projects and get things done.',
    icon: CheckSquare,
    color: '#8b5cf6',
    href: 'https://todo.ainexspace.com',
  },
  {
    name: 'Fit',
    description: 'Complete workout tracking with exercise library, nutrition logging, and progress analytics. Train smarter, get stronger.',
    icon: Dumbbell,
    color: '#3b82f6',
    href: 'https://fit.ainexspace.com',
  },
  {
    name: 'Habits',
    description: 'Build lasting habits with streak tracking, flexible schedules, and visual progress. Small steps, big transformations.',
    icon: TrendingUp,
    color: '#14b8a6',
    href: 'https://habits.ainexspace.com',
  },
  {
    name: 'Health',
    description: 'Track body metrics, sleep, vitals, and supplements. Visualize trends and understand your wellness over time.',
    icon: Activity,
    color: '#10b981',
    href: 'https://health.ainexspace.com',
  },
  {
    name: 'Album',
    description: 'Curate and organize your photo memories. Create beautiful collections with stories and share special moments.',
    icon: Camera,
    color: '#ec4899',
    href: 'https://album.ainexspace.com',
  },
  {
    name: 'Projects',
    description: 'Visual project management with kanban boards, milestones, and team collaboration. From idea to launch.',
    icon: FolderKanban,
    color: '#6366f1',
    href: 'https://projects.ainexspace.com',
  },
  {
    name: 'Flow',
    description: 'Visual workflow automation with drag-and-drop canvas. Connect apps, automate tasks, build without code.',
    icon: WorkflowIcon,
    color: '#06b6d4',
    href: 'https://flow.ainexspace.com',
  },
  {
    name: 'Subs',
    description: 'Track all your subscriptions in one place. Monitor spending, get renewal reminders, and optimize costs.',
    icon: Heart,
    color: '#10b981',
    href: 'https://subs.ainexspace.com',
  },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Unified Workspace',
    description: 'All your apps share data seamlessly. Tasks link to projects, journal entries track moods, and everything stays in sync.',
    icon: Database,
  },
  {
    title: 'AI-Powered Insights',
    description: 'Smart analysis across your data—sentiment tracking in journals, pattern recognition in habits, and intelligent suggestions everywhere.',
    icon: Brain,
  },
  {
    title: 'One Account, All Apps',
    description: 'Single sign-on across every app. Log in once and move freely between notes, journal, fitness, and more.',
    icon: Users,
  },
  {
    title: 'Shared Spaces',
    description: 'Collaborate with family, friends, or teams. Share habits, projects, and notes in private spaces you control.',
    icon: LinkIcon,
  },
  {
    title: 'Beautiful Design',
    description: 'Thoughtfully crafted interfaces with dark mode, custom themes, and delightful interactions across every app.',
    icon: BarChart3,
  },
  {
    title: 'Your Data, Your Control',
    description: 'Privacy-first architecture with secure authentication. Export your data anytime. No ads, no tracking, no compromises.',
    icon: Shield,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Plans', href: '/plans' },
  { label: 'Templates', href: '/templates', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:hello@ainexspace.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function MainHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('main');
  const { loading: colorsLoading } = useAppColors();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  const isFromLogout = searchParams.get('from') === 'logout';

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation && !isFromLogout) {
      setLoadingMessage('Welcome back! Redirecting you to your workspace…');
    } else if (user && needsActivation) {
      setLoadingMessage('');
      setShowActivation(true);
    } else {
      setLoadingMessage('');
    }
  }, [loading, checking, user, needsActivation, isFromLogout]);

  useEffect(() => {
    if (!loading && !checking && user && !needsActivation && !isFromLogout) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, checking, user, needsActivation, isFromLogout, router]);

  if (loading || checking || (user && !needsActivation && !isFromLogout)) {
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
              <p className="text-lg font-medium text-foreground">{loadingMessage}</p>
              {user && !isFromLogout && (
                <p className="text-sm text-foreground/60 flex items-center justify-center gap-2">
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} />}
        backgroundComponent={<DynamicBackground />}
        appName="journaling"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Privacy-First Design' },
          headline: 'Your life, beautifully organized.',
          subheadline: 'One workspace for everything that matters.',
          description: 'Notes, journal, tasks, fitness, habits, health, photos, projects, and more—all connected in one elegant workspace. Built for people who want to live intentionally.',
          highlights: [
            {
              icon: Brain,
              title: 'AI That Understands You',
              description: 'Smart insights across your data—mood analysis in journals, pattern recognition in habits, and helpful suggestions when you need them.',
            },
            {
              icon: LinkIcon,
              title: 'Everything Connected',
              description: 'Your apps work together. Share spaces with family. Sync across devices. One login for your entire digital life.',
            },
          ],
        }}
        apps={{
          sectionTitle: 'Apps for Every Part of Your Life',
          sectionDescription: 'Each app is crafted for a specific purpose—notes for ideas, journal for reflection, tasks for action, and more. Together, they create something greater.',
          cards: appCards,
        }}
        login={{
          badgeText: 'Free to Start',
          signUpTitle: 'Create Your Account',
          signInTitle: 'Welcome Back',
          signUpDescription: 'Get started with all apps. No credit card required.',
          signInDescription: 'Sign in to continue where you left off.',
          footerText: 'Your data stays private. Always.',
        }}
        features={{
          sectionTitle: 'Built Different',
          sectionDescription: 'Not just another productivity suite. A thoughtfully designed workspace that respects your time and privacy.',
          cards: featureCards,
        }}
        footer={{
          appDisplayName: "AINexSpace",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="main"
            appDisplayName="Main"
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

export default function MainHomePage() {
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
            <p className="text-lg font-medium text-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <MainHomePageContent />
    </Suspense>
  );
}
