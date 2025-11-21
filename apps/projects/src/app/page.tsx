'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { Loader2, Workflow, BarChart3, Shield, Users, Target, Zap } from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Analyzing project dependencies and critical paths…', emoji: '🔍' },
  { text: 'Organizing tasks by priority and team capacity…', emoji: '📊' },
  { text: 'Generating intelligent project insights and recommendations…', emoji: '⚡' },
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
  { label: 'Contact Us', href: 'mailto:projects@ainexsuite.com' },
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
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');

  useEffect(() => {
    if (loading) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user) {
      setLoadingMessage('Welcome back! Redirecting you to your projects workspace…');
    } else {
      setLoadingMessage('');
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, user, router]);

  if (loading || user) {
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
              {user && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="Projects" appColor="#6366f1" />}
        backgroundComponent={<LayeredBackground primaryColor="#6366f1" secondaryColor="#818cf8" variant="structured" />}
        appName="Projects"
        accentColor="#6366f1"
        gradientFrom="#6366f1"
        gradientTo="#818cf8"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Enterprise-grade security' },
          headline: 'Plan. Execute. Deliver.',
          subheadline: 'Projects transforms planning into intelligent execution.',
          description: 'From planning to delivery, track everything that matters. Coordinate teams, manage timelines, and drive results with AI-powered insights.',
          highlights: [
            {
              icon: Target,
              title: 'Goal Tracking',
              description: 'Set objectives and track progress with intelligent milestone management.',
            },
            {
              icon: Zap,
              title: 'Smart Automation',
              description: 'Automate routine tasks and focus on what moves projects forward.',
            },
          ],
        }}
        login={{
          badgeText: 'Project Hub',
          signUpTitle: 'Join Projects',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to start managing projects with intelligence.',
          signInDescription: 'Sign in to access your project workspace.',
          footerText: 'Your project data stays secure and private. Export anytime.',
        }}
        features={{
          sectionTitle: 'Built for teams that ship',
          sectionDescription: 'Projects combines planning, execution, and analytics into one intelligent workspace.',
          cards: featureCards,
        }}
        showActivation={false}
        footer={{
          appDisplayName: "Projects",
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
