'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import { Check, Sparkles, Shield } from 'lucide-react';

const plans = [
  {
    name: 'Creator',
    price: '$9',
    period: 'per month',
    description: 'Ideal for individuals mapping a personal learning journey.',
    perks: [
      'AI-crafted learning sprints',
      'Daily reflection prompts',
      'Knowledge Vault up to 2 GB',
      'Goal dashboards and momentum tracking',
      'Export notes and insights (Markdown, PDF)',
    ],
    cta: 'Start 14-day Trial',
    highlighted: false,
  },
  {
    name: 'Mentor',
    price: '$24',
    period: 'per month',
    description: 'Built for coaches and mentors guiding multiple learners.',
    perks: [
      'All Creator features',
      'Unlimited learners & shared boards',
      'Mentor feedback workspace',
      'Progress exports & reporting',
      'API & automation hooks',
    ],
    cta: 'Upgrade to Mentor',
    highlighted: true,
  },
  {
    name: 'Academy',
    price: 'Custom',
    period: '',
    description: 'Tailored for teams, bootcamps, and educational organizations.',
    perks: [
      'Dedicated success partner',
      'SCORM & LMS integration support',
      'Advanced analytics workspace',
      'Single sign-on & provisioning',
      'Private data exports and retention controls',
    ],
    cta: 'Book a Demo',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I use Grow without a mentor?',
    answer:
      'Definitely. Creator plans include everything you need for self-guided learning. You can invite mentors or peers later if you’d like feedback.',
  },
  {
    question: 'How does the 14-day trial work?',
    answer:
      'You get access to the full feature set with no credit card required. Invite collaborators, build learning boards, and connect integrations freely. Cancel anytime before the trial ends.',
  },
  {
    question: 'Do you offer education or non-profit discounts?',
    answer:
      'Yes. Academy plans are tailored to your roster size, curriculum style, and compliance needs. Reach out and we’ll customize pricing for your organization.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'You keep access until the end of the billing period. Your data remains available for 90 days, and you can export everything at any time.',
  },
];

export default function GrowPricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-purple-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-purple-300">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Plans for lifelong learners and mentors
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Start with a 14-day free trial. Choose the plan that fits how you learn—or how you teach.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted
                  ? 'border-purple-400 bg-gradient-to-br from-purple-500/10 to-indigo-500/10'
                  : 'border-white/10 bg-zinc-800/80'
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-200">
                    Popular
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
                    <Check className="h-5 w-5 text-purple-300 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Security and privacy on every plan</h2>
            <p className="text-white/70 leading-relaxed">
              Grow handles sensitive notes, reflections, and collaboration data. We protect it with enterprise-grade
              encryption, granular access controls, and compliance tooling suited for coaches and organizations.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-300 mt-1" />
                <span>Data encrypted in transit and at rest, with flexible retention policies.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-300 mt-1" />
                <span>Role-based permissions for learners, mentors, admins, and observers.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-purple-300 mt-1" />
                <span>GDPR, FERPA, and SOC2-minded architecture for institutional deployments.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Every plan includes</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-purple-300 mt-0.5" />
                <span>Unlimited goals, sprints, and reflection entries.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-purple-300 mt-0.5" />
                <span>AI study prompts tuned to your context and progress.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-purple-300 mt-0.5" />
                <span>Weekly insight summaries emailed or shared to Slack.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-purple-300 mt-0.5" />
                <span>Export-friendly analytics and 30-day version history.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Details on trials, billing, and working with mentors in Grow.
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
