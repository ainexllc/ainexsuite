'use client';

import { HomepageTemplate, AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import type {
  DemoStep,
  NavLink,
  FeatureCard,
  FooterLink,
} from '@ainexsuite/ui/components';
import { Cpu, Radio, Zap, Shield } from 'lucide-react';

// Empty demo steps for SmartHub as it doesn't have specific ones yet
const demoSteps: DemoStep[] = [];

const navLinks: NavLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/plans', label: 'Plans' },
];

const featureCards: FeatureCard[] = [
  {
    title: 'Unified Control',
    description: 'Manage all your compatible Google Home devices from a single interface. Lights, thermostats, locks, and more.',
    icon: Cpu,
  },
  {
    title: 'Real-time Status',
    description: 'See which lights are on, the temperature, and security status at a glance with live updates.',
    icon: Radio,
  },
  {
    title: 'Smart Automation',
    description: 'Trigger actions across your devices with AI-powered insights and custom routine builders.',
    icon: Zap,
  },
];

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Integrations', href: '/integrations' },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog', external: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Help Center', href: '/help', external: true },
  { label: 'Contact Us', href: '/contact' },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function SmartHubLandingPage() {
  return (
    <HomepageTemplate
      logo={<AinexStudiosLogo appName="Smart Hub" appColor="#0ea5e9" size="lg" asLink={false} />}
      backgroundComponent={<LayeredBackground />}
      appName="Smart Hub"
      accentColor="#0ea5e9"
      gradientFrom="#0ea5e9"
      gradientTo="#38bdf8"
      demoSteps={demoSteps}
      navLinks={navLinks}
      hero={{
        badge: { icon: Shield, text: 'Secure & Private' },
        headline: 'Connect Your World.',
        subheadline: 'Centralized control for your smart home.',
        description: 'Monitor status, automate routines, and manage your Google Home devices from one beautiful, unified dashboard.',
        highlights: [
          {
            icon: Cpu,
            title: 'Unified Control',
            description: 'One interface for all your smart devices.',
          },
          {
            icon: Zap,
            title: 'Smart Automation',
            description: 'AI-powered routines that learn from you.',
          },
        ],
      }}
      login={{
        badgeText: 'Beta Access',
        signUpTitle: 'Connect Your Home',
        signInTitle: 'Welcome Back',
        signUpDescription: 'Create your account to start managing your smart home.',
        signInDescription: 'Sign in to access your Smart Hub dashboard.',
        footerText: 'Secure connection. Your data stays private.',
      }}
      features={{
        sectionTitle: 'Why Smart Hub?',
        sectionDescription: 'Seamlessly integrate your devices for a smarter living experience.',
        cards: featureCards,
      }}
      footer={{
        appDisplayName: "Smart Hub",
        productLinks,
        companyLinks,
        resourceLinks,
        legalLinks,
      }}
    />
  );
}