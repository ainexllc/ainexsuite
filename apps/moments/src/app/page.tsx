'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppActivation, AppActivationBox } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import {
  Loader2,
  Shield,
  Camera,
  Palette,
  Clapperboard,
  MapPin,
  Share2,
} from 'lucide-react';
import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';

const demoSteps: DemoStep[] = [
  { text: 'Syncing your latest photos, voice notes, and clips…', emoji: '📸' },
  { text: 'Tagging people, places, and vibes in seconds…', emoji: '🏷️' },
  { text: 'Designing a story reel you can share instantly…', emoji: '🎞️' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Unified Memory Hub',
    description:
      'Combine photos, audio, and notes into rich stories with automatic metadata and smart search.',
    icon: Camera,
  },
  {
    title: 'Mood-based Organization',
    description:
      'AI clusters memories by emotion, setting, and people so you can relive any moment instantly.',
    icon: Palette,
  },
  {
    title: 'Shareable Storyboards',
    description:
      'Turn captured moments into reels, letters, or highlight decks with one click.',
    icon: Clapperboard,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Capture Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Templates', href: '/templates', external: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
  { label: 'Community', href: '/community', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: 'mailto:moments@ainexsuite.com' },
  { label: 'Documentation', href: '/docs', external: true },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', external: true },
  { label: 'Terms of Service', href: '/terms', external: true },
  { label: 'Cookie Policy', href: '/cookies', external: true },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', external: true },
  { label: 'GDPR', href: '/gdpr', external: true },
];

function MomentsHomePageContent() {
  const { user, loading, bootstrapStatus } = useAuth();
  const { needsActivation, checking } = useAppActivation('moments');
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
      setLoadingMessage('Welcome back! Redirecting you to your memory studio…');
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="MOMENTS" appColor="#ec4899" />}
        backgroundComponent={<LayeredBackground primaryColor="#ec4899" secondaryColor="#f472b6" variant="organic" />}
        appName="moments"
        accentColor="#ec4899"
        gradientFrom="#ec4899"
        gradientTo="#f472b6"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Private gallery vault' },
          headline: 'Capture the moment.',
          subheadline: "AINex Moments organizes life's highlights into stories worth revisiting.",
          description: 'From travel logs to family milestones, every memory gets context, tags, and a place in your personal timeline.',
          highlights: [
            {
              icon: MapPin,
              title: 'Location Tagging',
              description: 'Auto-tag locations and rediscover memories by place.',
            },
            {
              icon: Share2,
              title: 'One-Click Sharing',
              description: 'Share stories privately with loved ones or publish highlight reels.',
            },
          ],
        }}
        login={{
          badgeText: 'Memory Vault',
          signUpTitle: 'Join AINex Moments',
          signInTitle: 'Welcome back',
          signUpDescription: "Create your account to organize and relive life's best moments.",
          signInDescription: 'Sign in to access your curated memory gallery.',
          footerText: 'Your memories stay encrypted and private. Export or download anytime.',
        }}
        features={{
          sectionTitle: 'Built for storytellers, travelers, and memory keepers',
          sectionDescription: 'Moments transforms scattered media into searchable, shareable stories that honor your experiences.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="moments"
            appDisplayName="Moments"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Moments",
          productLinks,
          companyLinks,
          resourceLinks,
          legalLinks,
        }}
      />
    </>
  );
}

export default function MomentsHomePage() {
  return <MomentsHomePageContent />;
}
