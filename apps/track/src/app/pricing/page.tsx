'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import { Check, Sparkles, Shield, Clock } from 'lucide-react';

const plans = [
  {
    name: 'Solo Builder',
    price: '$8',
    period: 'per month',
    description: 'Perfect for founders, creatives, and athletes designing their own routines.',
    perks: [
      'Unlimited habits and routines',
      'Adaptive streak scoring',
      'Energy & mood reflections',
      'AI ritual suggestions',
      'Exports to CSV & Markdown',
    ],
    cta: 'Start 14-day Trial',
    highlighted: false,
  },
  {
    name: 'Accountability Pack',
    price: '$19',
    period: 'per month',
    description: 'Bring partners or teams along with shared dashboards and coaching tools.',
    perks: [
      'All Solo features',
      'Unlimited collaborators',
      'Coach view & progress notes',
      'Weekly accountability recaps',
      'Integrations with Todo & Grow',
    ],
    cta: 'Upgrade to Accountability',
    highlighted: true,
  },
  {
    name: 'Enterprise Momentum',
    price: 'Custom',
    period: '',
    description: 'For organizations building culture, wellness, or performance programs at scale.',
    perks: [
      'Dedicated success strategist',
      'SCIM provisioning & SSO',
      'Advanced analytics workspace',
      'API & data warehouse sync',
      'Onsite or virtual habit workshops',
    ],
    cta: 'Talk to Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I connect Track to my calendar?',
    answer:
      'Yes. Track syncs with Google and Outlook calendars to block time for rituals and avoid conflicts. You can also send routines to Todo as tasks.',
  },
  {
    question: 'Do collaborators need to pay?',
    answer:
      'Not on Solo Builder—invite one accountability partner for free. Accountability Pack and Enterprise plans include unlimited collaborator seats.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'You keep access until the billing period ends. We store your history for 90 days so you can export or reactivate without losing momentum.',
  },
  {
    question: 'Is there a student or nonprofit discount?',
    answer:
      'Yes. Reach out to support@ainexsuite.com with proof of eligibility and we’ll extend discounted pricing.',
  },
];

export default function TrackPricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Choose the momentum plan that fits
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Try Track free for 14 days. Upgrade whenever you’re ready to invite collaborators or roll out habits across a team.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted
                  ? 'border-amber-400 bg-gradient-to-br from-amber-500/10 to-indigo-500/10'
                  : 'border-white/10 bg-zinc-800/80'
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
                    Best value
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-white">{plan.price}</span>
                {plan.period && <span className="text-sm text-white/60">{plan.period}</span>}
              </div>
              <p className="mt-4 text-sm text-white/70 leading-relaxed">{plan.description}</p>

              <ul className="mt-6 space-y-3 text-sm text-white/70">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-amber-300 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'border border-white/20 text-white hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Security and reliability for serious streaks</h2>
            <p className="text-white/70 leading-relaxed">
              Your routines hold your most personal goals. Track keeps them safe with enterprise-grade safeguards and transparent controls.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-300 mt-1" />
                <span>Data encrypted at rest and in transit, with easy export or deletion whenever you choose.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-300 mt-1" />
                <span>AI coaching that respects your privacy—no selling or sharing behavioral insights.</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-300 mt-1" />
                <span>99.9% uptime backed by global infrastructure and automated backups.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Every plan includes</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-amber-300 mt-0.5" />
                <span>Unlimited routines, reflections, and integrations.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-amber-300 mt-0.5" />
                <span>Weekly momentum reports delivered to your inbox or Slack.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-amber-300 mt-0.5" />
                <span>Access to community ritual templates and seasonal challenges.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-amber-300 mt-0.5" />
                <span>Email support with real humans who build habits too.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Details about billing, integrations, and collaborating with accountability partners.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-md">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
