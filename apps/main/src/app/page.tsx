'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
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
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
  AppCard,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Syncing your journal, notes, tasks, and fitness data in real-time…', emoji: '🔄' },
  { text: 'AI analyzing patterns across all your apps for insights…', emoji: '🧠' },
  { text: 'Your unified workspace is ready—everything connected…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/plans', label: 'Plans' },
];

const appCards: AppCard[] = [
  {
    name: 'Notes',
    description: 'AI-powered knowledge base with multimodal capture, auto-organization, and intelligent synthesis. Capture clarity.',
    icon: StickyNote,
    color: '#3b82f6',
    href: 'https://notes.ainexsuite.com',
  },
  {
    name: 'Journey',
    description: 'Personal reflection studio with narrative intelligence, emotional analytics, and memory mapping. Write your story.',
    icon: BookOpen,
    color: '#f97316',
    href: 'https://journey.ainexsuite.com',
  },
  {
    name: 'Todo',
    description: 'Adaptive task management with AI prioritization, dependency tracking, and calendar-aware planning. Plan boldly.',
    icon: CheckSquare,
    color: '#f59e0b',
    href: 'https://todo.ainexsuite.com',
  },
  {
    name: 'Fit',
    description: 'Adaptive training & coaching with performance intelligence, recovery guardrails, and wearable sync. Train smarter.',
    icon: Dumbbell,
    color: '#22c55e',
    href: 'https://fit.ainexsuite.com',
  },
  {
    name: 'Grow',
    description: 'Habit consistency builder with streak analytics, smart reminders, and routine automation. Build unbreakable habits.',
    icon: TrendingUp,
    color: '#8b5cf6',
    href: 'https://grow.ainexsuite.com',
  },
  {
    name: 'Pulse',
    description: 'Time mastery & focus companion with smart clock, Pomodoro timers, and circadian rhythm support. Master your time.',
    icon: Heart,
    color: '#ef4444',
    href: 'https://pulse.ainexsuite.com',
  },
  {
    name: 'Moments',
    description: 'Memory vault & storytelling with AI organization, mood clustering, and shareable highlight reels. Capture the moment.',
    icon: Camera,
    color: '#ec4899',
    href: 'https://moments.ainexsuite.com',
  },
  {
    name: 'Track',
    description: 'Universal progress tracking with smart logging, goal forecasting, and noise-filtering charts. Visualize change.',
    icon: Activity,
    color: '#14b8a6',
    href: 'https://track.ainexsuite.com',
  },
  {
    name: 'Projects',
    description: 'Visual project management with interactive whiteboards, team collaboration, and progress analytics. Plan. Execute. Deliver.',
    icon: FolderKanban,
    color: '#6366f1',
    href: 'https://projects.ainexsuite.com',
  },
  {
    name: 'Workflow',
    description: 'Visual automation engine with drag-and-drop designer, real-time monitoring, and custom logic. Build workflows.',
    icon: WorkflowIcon,
    color: '#10b981',
    href: 'https://workflow.ainexsuite.com',
  },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Unified Data Layer',
    description: 'All your apps share data seamlessly—tasks reference journal entries, fitness affects mood tracking, and insights flow everywhere.',
    icon: Database,
  },
  {
    title: 'Cross-App Intelligence',
    description: 'AI learns from your entire life—journal insights inform goal tracking, health metrics guide energy planning, and patterns emerge across everything.',
    icon: Brain,
  },
  {
    title: 'Single Sign-On Access',
    description: 'One account unlocks everything. Switch between apps instantly without logging in again. Your workspace follows you.',
    icon: Users,
  },
  {
    title: 'Connected Workflows',
    description: 'Actions in one app trigger updates in others—complete a workout, update your journal mood. Hit a goal, celebrate in Moments.',
    icon: LinkIcon,
  },
  {
    title: 'Universal Search',
    description: 'Search across all apps at once—find journal entries, notes, tasks, and memories from a single search bar.',
    icon: BarChart3,
  },
  {
    title: 'Privacy First',
    description: 'Enterprise-grade encryption across all apps. Your data never leaves your control. Delete everything with one click.',
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
  { label: 'Contact Us', href: 'mailto:hello@ainexsuite.com' },
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
  const { user, loading, bootstrapStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');

  const isFromLogout = searchParams.get('from') === 'logout';
  const isBootstrapping = bootstrapStatus === 'running';

  useEffect(() => {
    if (loading || isBootstrapping) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !isFromLogout) {
      setLoadingMessage('Welcome back! Redirecting you to your workspace…');
    } else {
      setLoadingMessage('');
    }
  }, [loading, isBootstrapping, user, isFromLogout]);

  useEffect(() => {
    if (!loading && !isBootstrapping && user && !isFromLogout) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, isBootstrapping, user, isFromLogout, router]);

  if (loading || isBootstrapping || (user && !isFromLogout)) {
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
              {user && !isFromLogout && (
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} />}
        backgroundComponent={<LayeredBackground />}
        appName="journaling"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Privacy-First & Encrypted' },
          headline: 'Ten apps. One workspace. Zero friction.',
          subheadline: 'Your complete life operating system.',
          description: 'Replace 10+ disconnected tools with one unified workspace. AINexSuite brings notes, journaling, fitness, projects, habits, time tracking, memories, and automation into an intelligent ecosystem powered by AI—where everything works together seamlessly.',
          highlights: [
            {
              icon: Brain,
              title: 'AI-Powered Intelligence',
              description: 'Grok 4 integration across every app learns from your entire life—journal insights inform goals, health metrics guide planning, patterns emerge everywhere.',
            },
            {
              icon: LinkIcon,
              title: 'Unified & Connected',
              description: 'Real-time data sync across all apps. Tasks reference journal entries. Workouts update mood tracking. Memories connect to moments. Everything flows together.',
            },
          ],
        }}
        apps={{
          sectionTitle: 'Ten Specialized Apps, One Ecosystem',
          sectionDescription: 'From knowledge capture to memory preservation, fitness to focus, habits to automation—each app is powerful alone, transformative together. Built on Firebase with real-time sync and Grok 4 AI intelligence.',
          cards: appCards,
        }}
        login={{
          badgeText: 'Early Access',
          signUpTitle: 'Start Your Journey',
          signInTitle: 'Welcome Back',
          signUpDescription: 'Create your account to unlock all 10 apps. One workspace, infinite possibilities.',
          signInDescription: 'Sign in to access your unified workspace and all your apps.',
          footerText: 'Enterprise-grade encryption. Your data is yours. 30-day free trial included.',
        }}
        features={{
          sectionTitle: 'Why Unified Matters',
          sectionDescription: 'Individual apps are powerful. Together, they become a complete operating system for your life.',
          cards: featureCards,
        }}
        footer={{
          appDisplayName: "AINexSuite",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
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
            <p className="text-lg font-medium text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <MainHomePageContent />
    </Suspense>
  );
}
