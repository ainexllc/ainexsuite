'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Loader2, Workflow, BarChart3, Shield, Users, Target, Zap } from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Loading your projects and boards…', emoji: '📋' },
  { text: 'Preparing your workspace…', emoji: '🎯' },
  { text: 'Ready to build something great…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Project Whiteboard',
    description: 'Visualize projects with interactive whiteboards, sticky notes, and workflow connections.',
    icon: Workflow,
  },
  {
    title: 'Team Collaboration',
    description: 'Coordinate with team members, share updates, and maintain alignment across projects.',
    icon: Users,
  },
  {
    title: 'Progress Analytics',
    description: 'Visualize project health, track KPIs, and identify bottlenecks before they impact delivery.',
    icon: BarChart3,
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
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:projects@ainexspace.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function ProjectsHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('projects');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your projects workspace…');
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
              <div className="h-16 w-16 rounded-full bg-[#3b82f6]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#3b82f6]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6366f1] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="projects" appColor="#6366f1" />}
        backgroundComponent={<LayeredBackground primaryColor="#6366f1" secondaryColor="#818cf8"  />}
        appName="projects"
        accentColor="#6366f1"
        gradientFrom="#6366f1"
        gradientTo="#818cf8"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Visual Project Management' },
          headline: 'From idea to done.',
          subheadline: 'Visual project management that keeps teams aligned.',
          description: 'Kanban boards, whiteboards, and progress tracking. Everything you need to plan, execute, and ship projects successfully.',
          highlights: [
            {
              icon: Target,
              title: 'Kanban Boards',
              description: 'Visualize progress and move work forward with intuitive boards.',
            },
            {
              icon: Zap,
              title: 'Team Collaboration',
              description: 'Share projects, assign tasks, and keep everyone in sync.',
            },
          ],
        }}
        login={{
          badgeText: 'Free to Start',
          signUpTitle: 'Start Your Project',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account and start managing projects visually.',
          signInDescription: 'Sign in to access your projects.',
          footerText: 'Your projects are private and secure.',
        }}
        features={{
          sectionTitle: 'Everything you need to ship',
          sectionDescription: 'From planning to launch, Projects keeps your team organized and moving forward.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="projects"
            appDisplayName="Projects"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Projects",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function ProjectsHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-[#6366f1]/20 animate-pulse" />
              </div>
              <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#6366f1]" />
            </div>
            <p className="text-lg font-medium text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <ProjectsHomePageContent />
    </Suspense>
  );
}
