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
  { text: 'Prioritizing today\'s deep work blocks across projects…', emoji: '🧠' },
  { text: 'Syncing meetings, deadlines, and rituals into one plan…', emoji: '🗓️' },
  { text: 'Drafting focus prompts to keep every task crystal clear…', emoji: '✅' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Priority Intelligence',
    description:
      'Instantly see what matters most with AI-ranked tasks, dependencies, and commitments across every project.',
    icon: BarChart3,
  },
  {
    title: 'Calendar-Aware Planning',
    description:
      'Schedules, rituals, and deadlines integrate automatically so you can plan realistically in minutes.',
    icon: CalendarClock,
  },
  {
    title: 'Focus Routines',
    description:
      'Turn recurring workflows into templates with automations that trigger when you enter focus mode.',
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
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('todo');
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
      setLoadingMessage('Welcome back! Redirecting you to your command center…');
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
          badge: { icon: Shield, text: 'Operational clarity' },
          headline: 'Plan boldly. Finish consistently.',
          subheadline: 'AINex Todo keeps your commitments aligned with your focus.',
          description: 'Combine projects, rituals, and meetings into one adaptive command center. AI ensures every priority has space to breathe—and gets done.',
          highlights: [
            {
              icon: Kanban,
              title: 'Workflow Templates',
              description: 'Save your best routines as reusable blueprints with AI handoff.',
            },
            {
              icon: ClipboardList,
              title: 'Team Assignments',
              description: 'Delegate with context and automatic updates when priorities shift.',
            },
          ],
        }}
        login={{
          badgeText: 'Planning Suite',
          signUpTitle: 'Join AINex Tasks',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to orchestrate projects with AI.',
          signInDescription: 'Sign in to access your adaptive planning workspace.',
          footerText: 'Your tasks stay encrypted, exportable, and synced across every Ainex app.',
        }}
        features={{
          sectionTitle: 'Built for operators who refuse busywork',
          sectionDescription: 'From solo founders to cross-functional teams, AINex Tasks keeps everyone locked on outcomes—not checklists.',
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
          appDisplayName: "AINex Tasks",
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
