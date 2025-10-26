'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import { Check, Shield, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Focus',
    price: '$8',
    period: 'per month',
    description: 'Perfect for individuals or founders who need a personal ops command center.',
    perks: [
      'Priority scoring & focus mode',
      'Daily agenda with calendar sync',
      'Unlimited automations & recurring tasks',
      'AI task briefs and rewrite assistance',
      'Integrations with Notes, Grow, and Journey',
    ],
    cta: 'Start 14-day Trial',
    highlighted: false,
  },
  {
    name: 'Team Ops',
    price: '$19',
    period: 'per member / month',
    description: 'Built for cross-functional teams managing launches, clients, and rituals.',
    perks: [
      'All Focus features',
      'Shared workspaces and role-based permissions',
      'Custom fields & workload balancing',
      'Slack/email digests and stakeholder views',
      'API access and webhooks',
    ],
    cta: 'Upgrade to Team Ops',
    highlighted: true,
  },
  {
    name: 'Enterprise Ops',
    price: 'Custom',
    period: '',
    description: 'Tailored for departments and agencies coordinating complex initiatives.',
    perks: [
      'Dedicated success partner',
      'SSO/SAML, SCIM provisioning',
      'Advanced analytics & custom dashboards',
      'Private data lake exports',
      'Compliance, auditing, and retention controls',
    ],
    cta: 'Book a Demo',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'How does the free trial work?',
    answer:
      'You get access to all Team Ops features for 14 days—automations, integrations, collaboration. No credit card required. Cancel anytime before the trial ends.',
  },
  {
    question: 'Can I invite my team on the Focus plan?',
    answer:
      'Focus is single-user. Upgrade to Team Ops to collaborate, assign tasks, and share dashboards.',
  },
  {
    question: 'Do you offer discounts for non-profits or education?',
    answer:
      'Yes. Enterprise Ops plans can be tailored to your organization’s size and budget. Contact us and we’ll put together a plan that fits.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'You retain access until the end of your billing cycle. We keep your data for 90 days so you can export or reactivate without losing history.',
  },
];

export default function TodoPricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Plans for disciplined operators and collaborative teams
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Try Team Ops free for 14 days. Scale your plan when you’re ready to coordinate larger initiatives.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted
                  ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/10 to-blue-500/10'
                  : 'border-white/10 bg-zinc-800/80'
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                    Most Popular
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
                    <Check className="h-5 w-5 text-emerald-300 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built with security and reliability at the core</h2>
            <p className="text-white/70 leading-relaxed">
              Todo runs mission-critical operations for teams. Every plan includes enterprise-grade security, compliance, and observability tools.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Encryption in transit and at rest, with optional zero-retention workspaces.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Role-based permissions, audit logs, and granular sharing controls.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Compliance-minded architecture for SOC2, GDPR, and HIPAA use cases.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Included in every plan</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-300 mt-0.5" />
                <span>Unlimited projects, lists, and automations.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-300 mt-0.5" />
                <span>Weekly performance recaps and focus recommendations.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-300 mt-0.5" />
                <span>Email + in-app digests highlighting conflicts and overdue work.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-300 mt-0.5" />
                <span>Data exports (CSV, JSON) and 30-day version history.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Details about trials, billing, collaboration, and data control in Todo.
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
