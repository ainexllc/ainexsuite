'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Check, Sparkles, Zap, Package, ArrowRight, Shield, Zap as ZapIcon, Clock, CreditCard, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';

const APPS = [
  { name: 'journey', label: 'Journal' },
  { name: 'notes', label: 'Notes' },
  { name: 'todo', label: 'Tasks' },
  { name: 'track', label: 'Tracker' },
  { name: 'moments', label: 'Moments' },
  { name: 'grow', label: 'Grow' },
  { name: 'pulse', label: 'Pulse' },
  { name: 'fit', label: 'Fit' },
];

interface PricingTier {
  tier: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  priceId?: string;
  appCount?: number;
  popular?: boolean;
  icon?: React.ReactNode;
}

// Original tiers data for logic and table
const pricingTiers: PricingTier[] = [
  {
    tier: 'trial',
    name: 'Free Trial',
    price: '$0',
    period: '30 days',
    description: 'Try all features risk-free. No credit card required.',
    appCount: 8,
    features: [
      'Access to all 8 apps',
      '200 AI queries per month',
      'Basic AI insights',
      'Web access',
      'Community support',
      'Data export',
      '30 days free, then upgrade or cancel',
    ],
    cta: 'Start Free Trial',
    icon: <Check className="h-5 w-5 text-green-400" />,
  },
  {
    tier: 'single-app',
    name: 'Single App',
    price: '$2.99',
    period: 'per month',
    description: 'Perfect for focused users who want one app.',
    appCount: 1,
    features: [
      'Access to 1 app of your choice',
      '200 AI queries per month',
      'Basic AI insights',
      'Web access',
      'Community support',
      'Data export',
      'Cancel anytime',
    ],
    cta: 'Choose App',
    priceId: process.env.NEXT_PUBLIC_STRIPE_SINGLE_APP_PRICE_ID,
  },
  {
    tier: 'three-apps',
    name: '3-App Bundle',
    price: '$5.99',
    period: 'per month',
    description: 'Access your favorite combination of apps.',
    appCount: 3,
    features: [
      'Access to 3 apps of your choice',
      '500 AI queries per month',
      'Basic AI insights',
      'Web access',
      'Community support',
      'Data export',
      'Cancel anytime',
    ],
    cta: 'Choose Apps',
    priceId: process.env.NEXT_PUBLIC_STRIPE_THREE_APPS_PRICE_ID,
    icon: <Package className="h-5 w-5 text-blue-400" />,
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$7.99',
    period: 'per month',
    description: 'Perfect for personal growth enthusiasts.',
    appCount: 8,
    features: [
      'Access to all 8 apps',
      '2,000 AI queries per month',
      'Advanced AI insights',
      'Priority support',
      'Unlimited data retention',
      'Data export (CSV, JSON, PDF)',
      'Custom themes',
      'Cancel anytime',
    ],
    cta: 'Start Now',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    popular: true,
    icon: <Zap className="h-5 w-5 text-yellow-400" />,
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: '$14.99',
    period: 'per month',
    description: 'For power users who demand unlimited possibilities.',
    appCount: 8,
    features: [
      'Access to all 8 apps',
      '10,000+ AI queries per month',
      'Advanced pattern detection',
      'Personalized recommendations',
      'Dedicated support',
      'Priority feature requests',
      'Early access to new features',
      'Cancel anytime',
    ],
    cta: 'Start Now',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    icon: <Sparkles className="h-5 w-5 text-purple-400" />,
  },
];

const allFeatures = [
  {
    category: 'Core Apps',
    features: [
      { name: 'Journal with AI prompts', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Habit tracking & streaks', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Task management', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Photo diary', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Goal setting', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Mood tracking', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Fitness monitoring', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Quick notes', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
    ],
  },
  {
    category: 'AI Features',
    features: [
      { name: 'Monthly AI queries', trial: '200', 'single-app': '200', 'three-apps': '500', pro: '2,000', premium: '10,000+' },
      { name: 'Basic AI insights', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Advanced pattern detection', trial: false, 'single-app': false, 'three-apps': false, pro: true, premium: true },
      { name: 'Personalized recommendations', trial: false, 'single-app': false, 'three-apps': false, pro: true, premium: true },
      { name: 'Sentiment analysis', trial: false, 'single-app': false, 'three-apps': false, pro: true, premium: true },
    ],
  },
  {
    category: 'Data & Storage',
    features: [
      { name: 'Data retention', trial: '30 days', 'single-app': 'Unlimited', 'three-apps': 'Unlimited', pro: 'Unlimited', premium: 'Unlimited' },
      { name: 'Export formats', trial: 'CSV', 'single-app': 'CSV, JSON, PDF', 'three-apps': 'CSV, JSON, PDF', pro: 'CSV, JSON, PDF', premium: 'CSV, JSON, PDF' },
      { name: 'Backup & restore', trial: false, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Custom data deletion', trial: false, 'single-app': true, 'three-apps': true, pro: true, premium: true },
    ],
  },
  {
    category: 'Support & Access',
    features: [
      { name: 'Community support', trial: true, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Email support', trial: false, 'single-app': true, 'three-apps': true, pro: true, premium: true },
      { name: 'Priority support', trial: false, 'single-app': false, 'three-apps': false, pro: true, premium: true },
      { name: 'Early access to new features', trial: false, 'single-app': false, 'three-apps': false, pro: false, premium: true },
    ],
  },
];

function FeatureCheck({ included }: { included: boolean | string }) {
  if (typeof included === 'string') {
    return <span className="text-sm text-white/70">{included}</span>;
  }
  return included ? (
    <Check className="h-5 w-5 text-[#f97316]" />
  ) : (
    <span className="text-sm text-white/30">—</span>
  );
}

export default function PlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [customTierMode, setCustomTierMode] = useState<'single-app' | 'three-apps'>('three-apps');

  const handleCheckout = async (tier: PricingTier) => {
    // Free Trial tier doesn't need Stripe checkout
    if (tier.tier === 'trial') {
      if (!user) {
        router.push('/?signup=true');
      } else {
        router.push('/workspace');
      }
      return;
    }

    // For single-app and three-app tiers, require app selection
    if ((tier.tier === 'single-app' || tier.tier === 'three-apps') && selectedApps.length === 0) {
      alert(`Please select ${tier.appCount} app${tier.appCount === 1 ? '' : 's'} to continue`);
      return;
    }

    // For paid tiers, redirect to Stripe checkout
    if (!user) {
      router.push('/?signup=true');
      return;
    }

    if (!tier.priceId) {
      console.error('Price ID not configured');
      alert('Price configuration error. Please try again later.');
      return;
    }

    setLoading(tier.tier);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: tier.priceId,
          tier: tier.tier,
          selectedApps: tier.tier === 'single-app' || tier.tier === 'three-apps' ? selectedApps : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const toggleApp = (appName: string) => {
    const maxApps = customTierMode === 'single-app' ? 1 : 3;

    setSelectedApps((prev) => {
      // If switching modes, we might need to truncate, but usually we just clear or adjust
      // Here we'll just strictly enforce the current limit
      
      if (prev.includes(appName)) {
        return prev.filter((a) => a !== appName);
      }
      
      if (prev.length < maxApps) {
        return [...prev, appName];
      }
      
      // If limit reached and we click a new one:
      // For single app: replace
      if (maxApps === 1) {
         return [appName];
      }
      
      return prev;
    });
  };

  // Reset selected apps when switching custom tier modes
  const setCustomMode = (mode: 'single-app' | 'three-apps') => {
    setCustomTierMode(mode);
    setSelectedApps([]);
  };

  const customTier = pricingTiers.find(t => t.tier === customTierMode)!;
  const proTier = pricingTiers.find(t => t.tier === 'pro')!;
  const premiumTier = pricingTiers.find(t => t.tier === 'premium')!;

  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-24 pb-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Transparent Plans for Everyone
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl bg-gradient-to-r from-white via-white to-white/80 bg-clip-text">
              Simple, Transparent Plans
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your lifestyle. All plans include a 30-day free trial.
            </p>
          </div>
        </div>

        {/* Main Pricing Grid - 3 Columns */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
          {/* Column 1: Build Your Bundle */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-zinc-900/50 overflow-hidden hover:border-white/20 transition-all duration-300">
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Build Your Bundle</h3>
                  <p className="text-sm text-white/60">Perfect for focused growth</p>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                {/* Toggle Switch */}
                <div className="bg-black/40 p-1 rounded-xl flex text-sm font-medium relative">
                  <button
                    onClick={() => setCustomMode('single-app')}
                    className={`flex-1 py-2.5 rounded-lg transition-all duration-200 ${customTierMode === 'single-app' ? 'bg-zinc-700 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                  >
                    1 App
                  </button>
                  <button
                    onClick={() => setCustomMode('three-apps')}
                    className={`flex-1 py-2.5 rounded-lg transition-all duration-200 ${customTierMode === 'three-apps' ? 'bg-zinc-700 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                  >
                    3 Apps
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{customTier.price}</span>
                  <span className="text-white/50 text-sm font-medium">/ month</span>
                </div>
                
                <p className="text-sm text-white/70">{customTier.description}</p>

                {/* App Selection */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                   <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold">
                      <span className="text-white/50">Select {customTier.appCount} {customTier.appCount === 1 ? 'App' : 'Apps'}</span>
                      <span className="text-[#f97316]">{selectedApps.length}/{customTier.appCount}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      {APPS.map((app) => (
                        <button
                          key={app.name}
                          onClick={() => toggleApp(app.name)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border text-left flex items-center gap-2 ${
                            selectedApps.includes(app.name)
                              ? 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/40'
                              : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedApps.includes(app.name) ? 'bg-[#f97316]' : 'bg-white/20'}`} />
                          {app.label}
                        </button>
                      ))}
                   </div>
                </div>

                <ul className="space-y-3 pt-4">
                  <li className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span>{customTierMode === 'single-app' ? '200' : '500'} AI queries/mo</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span>Basic AI insights</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span>Community support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleCheckout(customTier)}
                disabled={loading === customTier.tier || selectedApps.length === 0}
                className="w-full mt-8 py-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {loading === customTier.tier ? 'Loading...' : customTier.cta}
              </button>
            </div>
          </div>

          {/* Column 2: Pro (Highlighted) */}
          <div className="flex flex-col rounded-3xl border-2 border-[#f97316] bg-gradient-to-b from-[#f97316]/10 to-zinc-900/90 overflow-hidden shadow-2xl shadow-[#f97316]/20 transform lg:-translate-y-4 z-10 relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#f97316] to-[#ea6a0f]" />
            <div className="absolute top-4 right-4">
               <span className="px-3 py-1 rounded-full bg-[#f97316] text-white text-xs font-bold uppercase tracking-wide shadow-lg">
                 Most Popular
               </span>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-[#f97316]/20 text-[#f97316] flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Pro Suite</h3>
                  <p className="text-sm text-white/60">Total personal growth</p>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{proTier.price}</span>
                  <span className="text-white/50 text-sm font-medium">/ month</span>
                </div>
                
                <p className="text-sm text-white/80 font-medium leading-relaxed">
                   Access to all 8 apps. The complete operating system for your life.
                </p>

                <div className="p-4 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20">
                   <p className="text-xs font-bold text-[#f97316] uppercase tracking-wide mb-2">Everything in Bundle, plus:</p>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="h-4 w-4 text-[#f97316]" />
                        <span>All 8 Apps Included</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="h-4 w-4 text-[#f97316]" />
                        <span>2,000 AI queries/mo</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="h-4 w-4 text-[#f97316]" />
                        <span>Advanced AI Insights</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="h-4 w-4 text-[#f97316]" />
                        <span>Unlimited Data Retention</span>
                      </li>
                   </ul>
                </div>
              </div>

              <button
                onClick={() => handleCheckout(proTier)}
                disabled={loading === proTier.tier}
                className="w-full mt-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#f97316] to-[#ea6a0f] hover:shadow-lg hover:shadow-[#f97316]/40 text-white transition-all flex items-center justify-center gap-2 group"
              >
                 {loading === proTier.tier ? 'Loading...' : (
                    <>
                       Start Free Trial
                       <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                    </>
                 )}
              </button>
              <p className="text-center text-xs text-white/40 mt-3">30-day free trial, cancel anytime</p>
            </div>
          </div>

          {/* Column 3: Premium */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-zinc-900/50 overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Premium</h3>
                  <p className="text-sm text-white/60">Power user performance</p>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{premiumTier.price}</span>
                  <span className="text-white/50 text-sm font-medium">/ month</span>
                </div>
                
                <p className="text-sm text-white/70">{premiumTier.description}</p>

                <div className="pt-4 border-t border-white/5">
                   <p className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-4">Ultimate Power</p>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-white/70">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>10,000+ AI queries/mo</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white/70">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>Priority Feature Access</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white/70">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>Dedicated Support</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white/70">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>Personalized Recommendations</span>
                      </li>
                   </ul>
                </div>
              </div>

              <button
                onClick={() => handleCheckout(premiumTier)}
                disabled={loading === premiumTier.tier}
                className="w-full mt-8 py-4 rounded-xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white transition-all"
              >
                 {loading === premiumTier.tier ? 'Loading...' : 'Upgrade to Premium'}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Table */}
        <div className="space-y-8 pt-12 border-t border-white/5">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Compare Features
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-2 overflow-x-auto">
             {/* 
                Simplified Table: We map columns manually to match our new 3-col layout + Trial 
                But using the existing pricingTiers array is fine if we just hide the "Trial" column or show it differently.
                Let's keep it simple and just render the existing table but maybe cleaner style.
             */}
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 pl-6 pr-4 text-white/40 font-medium text-sm uppercase tracking-wider w-1/4">Features</th>
                  {pricingTiers.map((tier) => (
                    <th key={tier.tier} className="py-4 px-4 text-center text-white font-bold text-sm uppercase tracking-wider">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr>
                      <td colSpan={pricingTiers.length + 1} className="py-6 px-6">
                        <span className="text-xs font-bold text-[#f97316] uppercase tracking-widest">{category.category}</span>
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <td className="py-4 pl-6 pr-4 text-sm text-white/80 font-medium">{feature.name}</td>
                        {pricingTiers.map((tier) => (
                          <td key={tier.tier} className="py-4 px-4 text-center">
                            <div className="flex justify-center items-center">
                              <FeatureCheck included={((feature as Record<string, unknown>)[tier.tier] as boolean) ?? false} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 p-8 lg:p-12">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Everything you need to know about our plans and subscriptions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            <div className="group">
              <div className="p-6 rounded-xl border border-white/10 hover:border-[#f97316]/20 bg-white/2 hover:bg-[#f97316]/5 transition">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">Do I need a credit card for the free trial?</h3>
                </div>
                <p className="text-sm text-white/70">
                  No! Sign up for your 30-day free trial with just an email. No credit card required.
                  Upgrade anytime if you want to continue after the trial ends.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="p-6 rounded-xl border border-white/10 hover:border-[#f97316]/20 bg-white/2 hover:bg-[#f97316]/5 transition">
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">What happens after my free trial ends?</h3>
                </div>
                <p className="text-sm text-white/70">
                  Your data is preserved for 30 days. You can upgrade to any paid plan to keep your
                  account active, or cancel anytime. Your data won&apos;t be deleted immediately.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="p-6 rounded-xl border border-white/10 hover:border-[#f97316]/20 bg-white/2 hover:bg-[#f97316]/5 transition">
                <div className="flex items-start gap-3 mb-3">
                  <Package className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">Can I change my apps later?</h3>
                </div>
                <p className="text-sm text-white/70">
                  Yes! For Single App and 3-App Bundle plans, you can change your selected apps anytime
                  from your account settings. Upgrade to Pro or Premium for access to all 8 apps.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="p-6 rounded-xl border border-white/10 hover:border-[#f97316]/20 bg-white/2 hover:bg-[#f97316]/5 transition">
                <div className="flex items-start gap-3 mb-3">
                  <CreditCard className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">What payment methods do you accept?</h3>
                </div>
                <p className="text-sm text-white/70">
                  We accept all major credit cards (Visa, Mastercard, Amex, Discover).
                  All payments are processed securely through Stripe.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="p-6 rounded-xl border border-white/10 hover:border-[#f97316]/20 bg-white/2 hover:bg-[#f97316]/5 transition">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">Can I cancel anytime?</h3>
                </div>
                <p className="text-sm text-white/70">
                  Absolutely. Cancel anytime from your account settings, no questions asked.
                  You&apos;ll keep access until the end of your current billing cycle.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="p-6 rounded-xl border border-white/10 hover:border-[#f97316]/20 bg-white/2 hover:bg-[#f97316]/5 transition">
                <div className="flex items-start gap-3 mb-3">
                  <ZapIcon className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">What&apos;s included in each subscription tier?</h3>
                </div>
                <p className="text-sm text-white/70">
                  Free Trial: All 8 apps, 200 queries/month. Single App: 1 app, 200 queries/month.
                  3-App Bundle: 3 apps, 500 queries/month. Pro: All 8 apps, 2,000 queries/month.
                  Premium: All 8 apps, 10,000+ queries/month.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-8 py-12 px-6">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Start Your Journey
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users transforming their lives with AINexSuite.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => {
                if (user) {
                  router.push('/workspace');
                } else {
                  router.push('/?signup=true');
                }
              }}
              className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white text-black font-bold text-lg uppercase tracking-wide hover:bg-white/90 transition-all duration-300 group gap-2 shadow-xl shadow-white/10"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}