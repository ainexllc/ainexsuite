'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { Loader2, Calendar, Clock, Users, CheckCircle, Zap, Shield } from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Syncing all your calendars...', emoji: '🔄' },
  { text: 'Optimizing your schedule for productivity...', emoji: '⚡' },
  { text: 'Finding the perfect meeting slots...', emoji: '📅' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Unified View',
    description: 'See all your events, tasks, and reminders in one single, beautiful interface.',
    icon: Calendar,
  },
  {
    title: 'Smart Scheduling',
    description: 'AI-powered suggestions to find the best time for your meetings and focus work.',
    icon: Clock,
  },
  {
    title: 'Team Coordination',
    description: 'Seamlessly share availability and book time with your team members.',
    icon: Users,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Careers', href: '/careers', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:calendar@ainexspace.com' },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
];

function CalendarHomePageContent() {
  const { user, loading, bootstrapStatus } = useAuth();
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const isBootstrapping = bootstrapStatus === 'running';

  useEffect(() => {
    if (loading || isBootstrapping) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user) {
      setLoadingMessage('Welcome back! Redirecting you to your calendar...');
    } else {
      setLoadingMessage('');
    }
  }, [loading, isBootstrapping, user]);

  useEffect(() => {
    if (!loading && !isBootstrapping && user) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [loading, isBootstrapping, user, router]);

  if (loading || isBootstrapping || user) {
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
              {user && (
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="calendar" appColor="#8b5cf6" />}
        backgroundComponent={<LayeredBackground primaryColor="#8b5cf6" secondaryColor="#a78bfa" variant="structured" />}
        appName="calendar"
        accentColor="#8b5cf6"
        gradientFrom="#8b5cf6"
        gradientTo="#a78bfa"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Secure & Private' },
          headline: 'Master Your Time.',
          subheadline: 'Calendar brings clarity to your chaotic schedule.',
          description: 'Experience a new way to manage your time. Integrate your life, work, and goals into one seamless timeline.',
          highlights: [
            {
              icon: CheckCircle,
              title: 'Task Integration',
              description: 'View your to-dos alongside your meetings.',
            },
            {
              icon: Zap,
              title: 'Instant Booking',
              description: 'Share scheduling links that actually work.',
            },
          ],
        }}
        login={{
          badgeText: 'Calendar App',
          signUpTitle: 'Join Calendar',
          signInTitle: 'Welcome back',
          signUpDescription: 'Start organizing your life with intelligent scheduling.',
          signInDescription: 'Sign in to access your calendar workspace.',
          footerText: 'Your schedule data stays private. Syncs with AINexSuite.',
        }}
        features={{
          sectionTitle: 'Time management, reimagined',
          sectionDescription: 'More than just a calendar. It is your personal time assistant.',
          cards: featureCards,
        }}
        showActivation={false}
        footer={{
          appDisplayName: "Calendar",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function CalendarHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-[#8b5cf6]/20 animate-pulse" />
              </div>
              <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#8b5cf6]" />
            </div>
            <p className="text-lg font-medium text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <CalendarHomePageContent />
    </Suspense>
  );
}