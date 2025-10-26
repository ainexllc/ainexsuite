'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import { Check, Shield, Sparkles, Stethoscope } from 'lucide-react';

const plans = [
  {
    name: 'Personal',
    price: '$14',
    period: 'per month',
    description: 'Great for individuals optimizing longevity, performance, or recovery.',
    perks: [
      'Unlimited device and lab connections',
      'Adaptive baselines & readiness scores',
      'AI health briefs delivered weekly',
      'Secure sharing with two guests',
      'Export insights (PDF, CSV)',
    ],
    cta: 'Start 14-day Trial',
    highlighted: false,
  },
  {
    name: 'Pro Team',
    price: '$39',
    period: 'per month',
    description: 'Ideal for coaches and wellness teams supporting multiple clients.',
    perks: [
      'All Personal features',
      'Client rosters with role permissions',
      'Protocol templates & adherence tracking',
      'Real-time alert routing to Slack or SMS',
      'Integrations with Todo & Track',
    ],
    cta: 'Upgrade to Pro Team',
    highlighted: true,
  },
  {
    name: 'Clinical',
    price: 'Custom',
    period: '',
    description: 'Purpose-built for clinics, concierge medicine, and research cohorts.',
    perks: [
      'Dedicated deployment specialist',
      'EHR integrations & FHIR exports',
      'Audit logging & consent workflows',
      'BAA and compliance reviews',
      'Priority support & roadmap input',
    ],
    cta: 'Book a Demo',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Do I need a device to use Pulse?',
    answer:
      'No. You can log metrics manually or import labs without any hardware. Connect wearables later to unlock deeper trend detection.',
  },
  {
    question: 'How secure is my health data?',
    answer:
      'All data is encrypted in transit and at rest. You control every share link, can revoke access instantly, and receive export receipts for compliance audits.',
  },
  {
    question: 'Can I invite my doctor or coach?',
    answer:
      'Yes. Invitees receive tailored dashboards and alerts based on the permissions you set. Pro Team and Clinical plans allow unlimited collaborators.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'You retain access through the end of the billing cycle. We keep your data accessible for 90 days with export options whenever you need them.',
  },
];

export default function PulsePricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-rose-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Plans for every health journey
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Start with a free trial. Upgrade when you&apos;re ready to bring in your coach, care team, or organization.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted
                  ? 'border-rose-400 bg-gradient-to-br from-rose-500/10 to-indigo-500/10'
                  : 'border-white/10 bg-zinc-800/80'
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100">
                    Most popular
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
                    <Check className="h-5 w-5 text-rose-300 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Security on par with modern clinics</h2>
            <p className="text-white/70 leading-relaxed">
              From encryption to audit trails, Pulse handles sensitive information with the care it deserves. You decide
              who sees what, for how long, and at what level of detail.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-rose-300 mt-1" />
                <span>Granular scopes for biometrics, notes, and labs to keep private data private.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-rose-300 mt-1" />
                <span>Automated incident logs and download receipts for compliance readiness.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-rose-300 mt-1" />
                <span>Redundant backups plus regional data residency options on Clinical plans.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Every plan includes</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-rose-300 mt-0.5" />
                <span>Unlimited metrics, timeline entries, and AI-generated insights.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-rose-300 mt-0.5" />
                <span>Daily readiness summaries with actionable recommendations.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-rose-300 mt-0.5" />
                <span>Private share links with expiration controls and access logs.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-rose-300 mt-0.5" />
                <span>Email and in-app support with <em>real</em> humans.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Answers to common questions about pricing, billing, and collaborating with care teams.
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

        <section className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Need a tailored rollout?</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Our Clinical team helps you migrate historical data, configure compliance workflows, and train staff.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Talk to Sales
            </button>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
            <Stethoscope className="h-5 w-5 text-rose-300" />
            Direct access to a clinician success partner on every enterprise deployment.
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
