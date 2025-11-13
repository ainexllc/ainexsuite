'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { Loader2, Workflow, Cog, Play, Target, Zap, GitBranch } from 'lucide-react';
import { AinexStudiosLogo } from '@/components/branding/ainex-studios-logo';
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
  { text: 'Analyzing workflow automation opportunities…', emoji: '🔍' },
  { text: 'Optimizing process connections and dependencies…', emoji: '📊' },
  { text: 'Generating intelligent workflow recommendations…', emoji: '⚡' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Visual Workflow Designer',
    description: 'Design beautiful workflows with drag-and-drop simplicity and real-time visualization.',
    icon: Workflow,
  },
  {
    title: 'Automation Engine',
    description: 'Execute workflows automatically with triggers, conditions, and custom logic.',
    icon: Cog,
  },
  {
    title: 'Real-time Execution',
    description: 'Monitor workflow execution in real-time and identify bottlenecks instantly.',
    icon: Play,
  },
];

const aiHighlights: AIHighlight[] = [
  {
    emoji: '🎯',
    title: 'Smart Templates',
    description: 'AI-powered workflow templates that adapt to your specific use cases and patterns.',
  },
  {
    emoji: '⚡',
    title: 'Auto-Optimization',
    description: 'Intelligently optimize workflow paths based on execution history and performance.',
  },
  {
    emoji: '📈',
    title: 'Intelligent Routing',
    description: 'Automatically route tasks to the right nodes based on conditions and data.',
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
  { label: 'Contact Us', href: 'mailto:workflow@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function WorkflowHomePageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');

  useEffect(() => {
    if (loading) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user) {
      setLoadingMessage('Welcome back! Redirecting you to your workflow workspace…');
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
              <div className="h-16 w-16 rounded-full bg-[#a855f7]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#a855f7]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#a855f7] animate-pulse" />
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
        appName="workflow"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: GitBranch, text: 'Visual workflow builder' },
          headline: 'Build Workflows.',
          subheadline: 'AINexSuite Workflow brings visual workflow automation to your fingertips.',
          description: 'Design, automate, and execute beautiful workflows with drag-and-drop simplicity. Transform complex processes into elegant visual diagrams.',
          highlights: [
            {
              icon: Target,
              title: 'Visual Builder',
              description: 'Design workflows visually with intuitive drag-and-drop interface.',
            },
            {
              icon: Zap,
              title: 'Smart Automation',
              description: 'Automate processes with triggers, conditions, and intelligent routing.',
            },
          ],
        }}
        login={{
          badgeText: 'Workflow Hub',
          signUpTitle: 'Join AINex Workflow',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to start building beautiful workflows.',
          signInDescription: 'Sign in to access your workflow workspace.',
          footerText: 'Your workflow data stays secure and private. Export anytime.',
        }}
        features={{
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          videoTitle: 'AINex Workflow demo',
          sectionTitle: 'Built for teams that automate',
          sectionDescription: 'Workflow combines visual design, automation, and execution into one intelligent platform.',
          cards: featureCards,
        }}
        aiPower={{
          title: 'AI that understands your workflows',
          description: 'Workflow uses AI to optimize paths, suggest improvements, and automate routine decision-making.',
          highlights: aiHighlights,
          demoCard: {
            title: 'Active Workflows',
            subtitle: 'Running now',
            items: [
              'Customer Onboarding',
              'Order Processing',
              'Data Sync Pipeline',
              'Notification System',
              'Approval Workflow',
            ],
          },
        }}
        footer={{
          appDisplayName: 'AINex Workflow',
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        showActivation={false}
      />
      <Footer />
    </>
  );
}

export default function WorkflowHomePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]"><Loader2 className="h-12 w-12 animate-spin text-purple-500" /></div>}>
      <WorkflowHomePageContent />
    </Suspense>
  );
}
