'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  HeartPulse,
  Droplets,
  ClipboardPulse,
  Activity,
  Stethoscope,
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
  { text: 'Syncing heart rate, sleep, and recovery from all your devices…', emoji: '📲' },
  { text: 'Flagging anomalies and suggesting action plans instantly…', emoji: '🚨' },
  { text: 'Preparing a wellness brief to keep your coach and doctor aligned…', emoji: '📈' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'Clinicians' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Unified Health Timeline',
    description:
      'Bring wearable, lab, and manual entries into one view with automatic unit conversions and trend detection.',
    icon: HeartPulse,
  },
  {
    title: 'Precision Biomarker Tracking',
    description:
      'Spot shifts in inflammation, glucose, HRV, and more with adaptive baselines and alert thresholds.',
    icon: Droplets,
  },
  {
    title: 'Personal Health Briefs',
    description:
      'Share AI-generated digests with your doctor or coach, complete with context and next-step recommendations.',
    icon: ClipboardPulse,
  },
];

const aiHighlights: AIHighlight[] = [
  {
    emoji: '🤖',
    title: 'Intelligent Monitoring',
    description:
      'AINex Pulse watches for compounding signals and surfaces insights before they become issues.',
  },
  {
    emoji: '🍎',
    title: 'Habit Guidance',
    description:
      'Receive tailored nutrition, movement, and recovery nudges based on your current biomarker trends.',
  },
  {
    emoji: '🩺',
    title: 'Care Team Sync',
    description:
      'Export concise updates with annotated charts so your care team can respond faster and stay aligned.',
  },
];

const productLinks: FooterLink[] = [
  { label: 'Health Features', href: '/features' },
  { label: 'Membership Plans', href: '/pricing' },
  { label: 'Programs', href: '/programs', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Partners', href: '/partners', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:pulse@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function PulseHomePageContent() {
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('pulse');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user && !needsActivation) {
      setLoadingMessage('Welcome back! Redirecting you to your health dashboard…');
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
        appName="pulse"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Clinical-grade privacy' },
          headline: 'Know your body. Act with confidence.',
          subheadline: 'AINex Pulse connects every data point so you can optimize health with precision.',
          description: 'Track biomarkers, sync wearables, and receive expert AI analysis that keeps you and your care team on the same page.',
          highlights: [
            {
              icon: Activity,
              title: 'Live Monitoring',
              description: 'Real-time sync from wearables and lab uploads with automated alerts.',
            },
            {
              icon: Stethoscope,
              title: 'Care Team Access',
              description: 'Share digests with clinicians who can annotate and respond directly.',
            },
          ],
        }}
        login={{
          badgeText: 'Health Suite',
          signUpTitle: 'Join AINex Pulse',
          signInTitle: 'Welcome back',
          signUpDescription: 'Create your account to track health metrics with AI insights.',
          signInDescription: 'Sign in to access your personalized health dashboard.',
          footerText: 'Your health data stays encrypted and HIPAA-compliant. Export anytime.',
        }}
        features={{
          videoUrl: 'https://www.youtube.com/embed/e9Yn9g4RJas',
          videoTitle: 'AINex Pulse walkthrough',
          sectionTitle: 'Built for health-conscious individuals and clinical teams',
          sectionDescription: 'Pulse transforms scattered health data into actionable intelligence for longevity and performance.',
          cards: featureCards,
        }}
        aiPower={{
          title: 'An AI health co-pilot that never sleeps',
          description: 'Pulse monitors trends, surfaces early warnings, and recommends interventions before issues compound.',
          highlights: aiHighlights,
          demoCard: {
            title: 'Today\'s Health Brief',
            subtitle: 'Morning analysis complete',
            items: [
              'Longevity Dashboard',
              'Metabolic Reset',
              'Cardio Recovery Plan',
              'Autoimmune Insights',
              'Sleep Optimization',
            ],
          },
        }}
        footer={{
          appDisplayName: 'AINex Pulse',
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="pulse"
            appDisplayName="Pulse"
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

export default function PulseHomePage() {
  return <PulseHomePageContent />;
}
