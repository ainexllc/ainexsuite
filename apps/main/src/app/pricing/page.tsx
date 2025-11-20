'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import { Check, Sparkles, Zap, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

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

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

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
    setSelectedApps((prev) => {
      if (prev.includes(appName)) {
        return prev.filter((a) => a !== appName);
      }
      // For single-app tier, only allow 1 selection
      // For three-apps tier, allow up to 3 selections
      const maxApps = 3; // Default to 3-app bundle limit
      if (prev.length < maxApps) {
        return [...prev, appName];
      }
      return prev;
    });
  };

  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Choose the plan that fits your needs. Start with a 30-day free trial, no credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-5">
          {pricingTiers.map((tier) => (
            <div
              key={tier.tier}
              className={`relative rounded-3xl border p-8 shadow-lg transition hover:-translate-y-1 ${
                tier.popular
                  ? 'border-[#f97316] bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 lg:col-span-1 lg:row-span-2 flex flex-col justify-between'
                  : 'border-white/10 bg-zinc-800/80'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 rounded-full bg-[#f97316] px-4 py-1 text-sm font-semibold text-white">
                    <Sparkles className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}
              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {tier.icon}
                    <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-white/60">/ {tier.period}</span>
                  </div>
                  <p className="text-sm text-white/70 mt-4">{tier.description}</p>
                  {tier.appCount && (
                    <p className="text-xs text-white/50 mt-2">
                      {tier.appCount === 8 ? '8 apps' : `${tier.appCount} app${tier.appCount === 1 ? '' : 's'}`}
                    </p>
                  )}
                </div>

                {/* App Selection for single-app and three-apps tiers */}
                {(tier.tier === 'single-app' || tier.tier === 'three-apps') && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white">Select apps:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {APPS.map((app) => (
                        <button
                          key={app.name}
                          onClick={() => toggleApp(app.name)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            selectedApps.includes(app.name)
                              ? 'bg-[#f97316] text-white border border-[#f97316]'
                              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {app.label}
                        </button>
                      ))}
                    </div>
                    {selectedApps.length > 0 && (
                      <p className="text-xs text-white/50 text-center">
                        {selectedApps.length} of {tier.appCount} selected
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleCheckout(tier)}
                  disabled={loading === tier.tier}
                  className={`w-full rounded-2xl px-6 py-4 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    tier.popular
                      ? 'bg-[#f97316] text-white hover:bg-[#ea6a0f]'
                      : 'border border-white/20 text-white hover:bg-white/5'
                  }`}
                >
                  {loading === tier.tier ? 'Loading...' : tier.cta}
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Feature Comparison */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">
              Compare All Features
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Detailed breakdown of what&apos;s included in each plan.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left pb-4 pr-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
                      Features
                    </span>
                  </th>
                  {pricingTiers.map((tier) => (
                    <th key={tier.tier} className="text-center pb-4 px-4">
                      <span className="text-sm font-semibold uppercase tracking-wide text-white">
                        {tier.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr>
                      <td colSpan={pricingTiers.length + 1} className="pt-8 pb-4">
                        <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                      </td>
                    </tr>
                    {category.features.map((feature, idx) => (
                      <tr
                        key={feature.name}
                        className={idx !== category.features.length - 1 ? 'border-b border-white/5' : ''}
                      >
                        <td className="py-4 pr-4 text-sm text-white/70">{feature.name}</td>
                        {pricingTiers.map((tier) => (
                          <td key={tier.tier} className="py-4 px-4 text-center">
                            <div className="flex justify-center">
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
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12">
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Do I need a credit card for the free trial?</h3>
              <p className="text-sm text-white/70">
                No! Sign up for your 30-day free trial with just an email. No credit card required.
                Upgrade anytime if you want to continue after the trial ends.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What happens after my free trial ends?</h3>
              <p className="text-sm text-white/70">
                Your data is preserved for 30 days. You can upgrade to any paid plan to keep your
                account active, or cancel anytime. Your data won&apos;t be deleted immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I change my apps later?</h3>
              <p className="text-sm text-white/70">
                Yes! For Single App and 3-App Bundle plans, you can change your selected apps anytime
                from your account settings. Upgrade to Pro or Premium for access to all 8 apps.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-white/70">
                We accept all major credit cards (Visa, Mastercard, Amex, Discover).
                All payments are processed securely through Stripe.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-white/70">
                Absolutely. Cancel anytime from your account settings, no questions asked.
                You&apos;ll keep access until the end of your current billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What&apos;s included in each subscription tier?</h3>
              <p className="text-sm text-white/70">
                Free Trial: All 8 apps, 200 queries/month. Single App: 1 app, 200 queries/month.
                3-App Bundle: 3 apps, 500 queries/month. Pro: All 8 apps, 2,000 queries/month.
                Premium: All 8 apps, 10,000+ queries/month.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to transform your personal growth?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Start your 30-day free trial today. All features included. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (user) {
                  router.push('/workspace');
                } else {
                  router.push('/?signup=true');
                }
              }}
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Start 30-Day Free Trial
            </button>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}

// Required for fragment syntax
import React from 'react';
