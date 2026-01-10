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
  { text: 'Loading your photo collections…', emoji: '📸' },
  { text: 'Organizing memories into albums…', emoji: '🖼️' },
  { text: 'Your gallery is ready…', emoji: '✨' },
];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Beautiful Collections',
    description:
      'Organize photos into themed albums. Add captions, dates, and stories to preserve context.',
    icon: Camera,
  },
  {
    title: 'Easy Uploads',
    description:
      'Drag and drop photos or upload from your device. Bulk upload makes it fast and simple.',
    icon: Palette,
  },
  {
    title: 'Share with Family',
    description:
      'Create shared albums for trips, events, or everyday moments. Everyone can contribute.',
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
  { label: 'Contact Us', href: 'mailto:moments@ainexspace.com' },
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
  const { user, loading } = useAuth();
  const { needsActivation, checking } = useAppActivation('album');
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    if (loading || checking) {
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
              <div className="h-16 w-16 rounded-full bg-[#ec4899]/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-[#ec4899]" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && !needsActivation && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ec4899] animate-pulse" />
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
        logo={<AinexStudiosLogo align="center" size="lg" asLink={false} appName="album" appColor="#ec4899" />}
        backgroundComponent={<LayeredBackground primaryColor="#ec4899" secondaryColor="#f472b6" variant="organic" />}
        appName="album"
        accentColor="#ec4899"
        gradientFrom="#ec4899"
        gradientTo="#f472b6"
        demoSteps={demoSteps}
        navLinks={navLinks}
        hero={{
          badge: { icon: Shield, text: 'Your Private Gallery' },
          headline: 'Your memories, beautifully kept.',
          subheadline: "A home for your photos and the stories behind them.",
          description: 'Upload, organize, and share your favorite photos. Create albums for trips, milestones, and everyday moments worth remembering.',
          highlights: [
            {
              icon: MapPin,
              title: 'Albums & Collections',
              description: 'Organize photos into albums with custom covers and descriptions.',
            },
            {
              icon: Share2,
              title: 'Share with Anyone',
              description: 'Create shared albums for family and friends to enjoy together.',
            },
          ],
        }}
        login={{
          badgeText: 'Free to Start',
          signUpTitle: 'Start Your Album',
          signInTitle: 'Welcome back',
          signUpDescription: "Create your account and start building your photo collection.",
          signInDescription: 'Sign in to access your photos and albums.',
          footerText: 'Your photos are private and secure. Download anytime.',
        }}
        features={{
          sectionTitle: 'Simple photo organization',
          sectionDescription: 'No complicated features. Just a beautiful place for your photos and memories.',
          cards: featureCards,
        }}
        showActivation={showActivation}
        activationComponent={
          <AppActivationBox
            appName="album"
            appDisplayName="Album"
            onActivated={() => window.location.reload()}
            onDifferentEmail={async () => {
              await firebaseSignOut(auth);
              setShowActivation(false);
            }}
          />
        }
        footer={{
          appDisplayName: "AINex Album",
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
