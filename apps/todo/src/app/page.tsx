'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  CalendarClock,
  Target,
  BarChart3,
  Kanban,
  ClipboardList,
} from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Loading your tasks and projects…', emoji: '📋' },
  { text: 'Organizing by priority and due date…', emoji: '🎯' },
  { text: 'Your workspace is ready…', emoji: '✅' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Smart Prioritization',
    description:
      'Set priorities, due dates, and labels. Filter and sort to always see what needs attention now.',
    icon: BarChart3,
  },
  {
    title: 'Projects & Lists',
    description:
      'Organize tasks into projects. Create recurring tasks for routines that repeat daily, weekly, or monthly.',
    icon: CalendarClock,
  },
  {
    title: 'Shared Spaces',
    description:
      'Collaborate with family or teams. Assign tasks, share projects, and stay in sync together.',
    icon: Target,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Planning Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Workflow Library', href: '/workflows', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:tasks@ainexspace.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function TodoHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('todo');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your command center…');
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
              <div className="h-16 w-16 rounded-full bg-[#8b5cf6]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#8b5cf6]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="todo" appColor="#8b5cf6" />}
        backgroundComponent={<LayeredBackground primaryColor="#8b5cf6" secondaryColor="#a78bfa" variant="structured" />}
        appName="todo"
        accentColor="#8b5cf6"
        gradientFrom="#8b5cf6"
        gradientTo="#a78bfa"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Get Things Done' },
          headline: 'Tasks that actually get done.',
          subheadline: 'Simple, powerful task management for your life.',
          description: 'Create tasks, set priorities, organize into projects. With recurring tasks, due dates, and shared spaces—everything you need to stay on top of what matters.',
          highlights: [
            {
              icon: Kanban,
              title: 'Flexible Views',
              description: 'List, kanban, or calendar view. Work the way that fits you best.',
            },
            {
              icon: ClipboardList,
              title: 'Recurring Tasks',
              description: 'Set it once, repeat forever. Perfect for habits and routines.',
            },
          ],
        }}
        login={{
          badgeText: 'Free to Start',
          signUpTitle: 'Start Getting Things Done',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account and start organizing your tasks.',
          signInDescription: 'Sign in to access your tasks and projects.',
          footerText: 'Syncs across all your devices. Private and secure.',
        }}
        features={{
          sectionTitle: 'Everything you need, nothing you don\'t',
          sectionDescription: 'Powerful enough for complex projects. Simple enough for a grocery list.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="todo"
            appDisplayName="Todo"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Todo",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function TodoHomePage() {
  return <TodoHomePageContent />;
}
