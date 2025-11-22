'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Check, Shield, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$6',
    period: 'per month',
    description: 'For individuals capturing ideas, meetings, and research in one place.',
    perks: [
      'Unlimited notes and collections',
      'AI summaries and action items',
      'Semantic search & quick find',
      'Sync across web and mobile',
      'Export to Markdown, PDF, JSON',
    ],
    cta: 'Start 14-day Trial',
    highlighted: false,
  },
  {
    name: 'Collaborate',
    price: '$14',
    period: 'per month',
    description: 'Best for small teams and cross-functional projects needing shared context.',
    perks: [
      'All Starter features',
      'Shared workspaces & collections',
      'Real-time editing & comments',
      'Advanced permissions & link sharing',
      'Integrations (Slack, Notion, Todo)',
    ],
    cta: 'Upgrade to Collaborate',
    highlighted: true,
  },
  {
    name: 'Knowledge Ops',
    price: 'Custom',
    period: '',
    description: 'Tailored for org-wide knowledge bases and documentation workflows.',
    perks: [
      'Dedicated success partner',
      'SSO, SCIM, and data residency options',
      'Enterprise analytics & reporting',
      'Custom retention policies',
      'API access and automation support',
    ],
    cta: 'Book a Demo',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Do I need to pay to use AI features?',
    answer:
      'Starter plans include unlimited AI summaries, action items, and rewrite assistance. Collaborate adds team prompts and shared recap generation at no extra cost.',
  },
  {
    question: 'Can I invite teammates on the Starter plan?',
    answer:
      'You can share read-only views with anyone via link on Starter. For collaborative editing and comments, upgrade to Collaborate.',
  },
  {
    question: 'How does the 14-day trial work?',
    answer:
      'You get full access to Collaborate features for 14 days with no credit card required. Invite teammates, build collections, and decide later if you want to upgrade.',
  },
  {
    question: 'Can I export my notes if I cancel?',
    answer:
      'Yes. You can export individual notes or entire collections as Markdown, PDF, or JSON. We retain your account data for 90 days in case you reactivate.',
  },
];

export default function NotesPricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgb(var(--color-primary-rgb)/0.1)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Capture and organize for less than a notebook habit
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Start with a 14-day free trial. Upgrade when you’re ready to collaborate or scale knowledge ops.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted
                  ? 'border-[var(--color-secondary)] bg-gradient-to-br from-[rgb(var(--color-primary-rgb)/0.1)] to-[rgb(var(--color-secondary-rgb)/0.1)]'
                  : 'border-white/10 bg-zinc-800/80'
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-primary-rgb)/0.15)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
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
                    <Check className="h-5 w-5 text-[var(--color-secondary)] mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]'
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Security and reliability baked in</h2>
            <p className="text-white/70 leading-relaxed">
              Notes stores sensitive meeting minutes, brainstorming, and personal reflections. We protect them with encryption, granular sharing, and enterprise compliance tooling.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-[var(--color-secondary)] mt-1" />
                <span>End-to-end encryption and zero-knowledge optional vaults.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-[var(--color-secondary)] mt-1" />
                <span>Role-based access, link sharing controls, and activity history.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[var(--color-secondary)] mt-1" />
                <span>GDPR, SOC2, and HIPAA-friendly architecture for enterprise deployments.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Included in every plan</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[var(--color-secondary)] mt-0.5" />
                <span>Unlimited note capture and instant syncing.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[var(--color-secondary)] mt-0.5" />
                <span>AI-powered summaries, rewrites, and action item suggestions.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[var(--color-secondary)] mt-0.5" />
                <span>Weekly recap emails with highlights and follow-up prompts.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[var(--color-secondary)] mt-0.5" />
                <span>30-day version history and easy exports.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Details about trials, billing, collaboration, and data control in Notes.
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
