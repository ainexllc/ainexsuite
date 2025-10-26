import { FooterPageLayout } from '@/components/footer-page-layout';
import { Check, Sparkles } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out AINexSuite and exploring the basics.',
    features: [
      'Access to all 8 apps',
      'Limited entries per month',
      'Basic AI insights',
      'Web access',
      'Community support',
      '7-day data retention',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'For individuals serious about personal growth and productivity.',
    features: [
      'Everything in Free',
      'Unlimited entries',
      'Advanced AI insights',
      'Priority support',
      'Unlimited data retention',
      'Data export (CSV, JSON)',
      'Custom themes',
      'Offline mode',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Teams',
    price: '$29',
    period: 'per month',
    description: 'For teams and families working toward shared goals together.',
    features: [
      'Everything in Pro',
      'Up to 5 members',
      'Shared workspaces',
      'Team insights & analytics',
      'Admin controls',
      'Priority onboarding',
      'Dedicated support',
      'Team billing',
    ],
    cta: 'Contact Sales',
  },
];

const allFeatures = [
  {
    category: 'Core Apps',
    features: [
      { name: 'Journal with AI prompts', free: true, pro: true, teams: true },
      { name: 'Habit tracking & streaks', free: true, pro: true, teams: true },
      { name: 'Task management', free: true, pro: true, teams: true },
      { name: 'Photo diary', free: true, pro: true, teams: true },
      { name: 'Goal setting', free: true, pro: true, teams: true },
      { name: 'Mood tracking', free: true, pro: true, teams: true },
      { name: 'Fitness monitoring', free: true, pro: true, teams: true },
      { name: 'Quick notes', free: true, pro: true, teams: true },
    ],
  },
  {
    category: 'AI & Insights',
    features: [
      { name: 'Basic AI insights', free: true, pro: true, teams: true },
      { name: 'Advanced pattern detection', free: false, pro: true, teams: true },
      { name: 'Personalized recommendations', free: false, pro: true, teams: true },
      { name: 'Predictive analytics', free: false, pro: true, teams: true },
      { name: 'Team analytics dashboard', free: false, pro: false, teams: true },
    ],
  },
  {
    category: 'Data & Storage',
    features: [
      { name: 'Data retention', free: '7 days', pro: 'Unlimited', teams: 'Unlimited' },
      { name: 'Export formats', free: 'None', pro: 'CSV, JSON, PDF', teams: 'CSV, JSON, PDF' },
      { name: 'Storage per user', free: '50 MB', pro: '5 GB', teams: '10 GB' },
      { name: 'Backup & restore', free: false, pro: true, teams: true },
    ],
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Shared workspaces', free: false, pro: false, teams: true },
      { name: 'Team member limit', free: '1', pro: '1', teams: '5' },
      { name: 'Role-based permissions', free: false, pro: false, teams: true },
      { name: 'Shared goals & habits', free: false, pro: false, teams: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Community support', free: true, pro: true, teams: true },
      { name: 'Email support', free: false, pro: true, teams: true },
      { name: 'Priority support', free: false, pro: false, teams: true },
      { name: 'Dedicated account manager', free: false, pro: false, teams: true },
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
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Choose the plan that fits your needs. All plans include access to all 8 apps.
            Start with a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl border p-8 shadow-lg transition hover:-translate-y-1 ${
                tier.popular
                  ? 'border-[#f97316] bg-gradient-to-br from-zinc-800/80 to-zinc-900/80'
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-white/60">/ {tier.period}</span>
                  </div>
                  <p className="text-sm text-white/70 mt-4">{tier.description}</p>
                </div>
                <button
                  className={`w-full rounded-2xl px-6 py-4 font-semibold transition ${
                    tier.popular
                      ? 'bg-[#f97316] text-white hover:bg-[#ea6a0f]'
                      : 'border border-white/20 text-white hover:bg-white/5'
                  }`}
                >
                  {tier.cta}
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
              Detailed breakdown of what’s included in each plan.
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
                  <th className="text-center pb-4 px-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-white">
                      Free
                    </span>
                  </th>
                  <th className="text-center pb-4 px-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-white">
                      Pro
                    </span>
                  </th>
                  <th className="text-center pb-4 px-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-white">
                      Teams
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr>
                      <td colSpan={4} className="pt-8 pb-4">
                        <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                      </td>
                    </tr>
                    {category.features.map((feature, idx) => (
                      <tr
                        key={feature.name}
                        className={idx !== category.features.length - 1 ? 'border-b border-white/5' : ''}
                      >
                        <td className="py-4 pr-4 text-sm text-white/70">{feature.name}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <FeatureCheck included={feature.free} />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <FeatureCheck included={feature.pro} />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <FeatureCheck included={feature.teams} />
                          </div>
                        </td>
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
              <h3 className="text-lg font-semibold text-white mb-2">Can I change plans later?</h3>
              <p className="text-sm text-white/70">
                Yes! You can upgrade or downgrade at any time. Changes take effect at the start of
                your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-white/70">
                We accept all major credit cards (Visa, Mastercard, Amex, Discover) and PayPal.
                All payments are processed securely through Stripe.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-sm text-white/70">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-white/70">
                Absolutely. Cancel anytime from your account settings. You’ll keep access until the
                end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-white/70">
                We offer a 30-day money-back guarantee for all new subscriptions. Contact support
                for a full refund within 30 days.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What happens to my data if I cancel?</h3>
              <p className="text-sm text-white/70">
                Your data is preserved for 90 days after cancellation. You can export it anytime or
                reactivate your account to restore full access.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to boost your productivity?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/help"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}

// Required for fragment syntax
import React from 'react';
