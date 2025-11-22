'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Check, Sparkles, Shield, Heart } from 'lucide-react';

const plans = [
  {
    name: 'Solo Journey',
    price: '$7',
    period: 'per month',
    description: 'Keep a private sanctuary for your thoughts, memories, and intentions.',
    perks: [
      'Unlimited entries & media attachments',
      'AI prompts and emotional summaries',
      'Mood, energy, and theme analytics',
      'Voice note transcription',
      'Export to PDF & Markdown',
    ],
    cta: 'Start 14-day Trial',
    highlighted: false,
  },
  {
    name: 'Circle',
    price: '$16',
    period: 'per month',
    description: 'Share curated reflections with trusted friends, coaches, or therapists.',
    perks: [
      'All Solo features',
      'Shared storyboards & comment threads',
      'Collaborator permissions & redactions',
      'Weekly reflection recaps',
      'Templates for group rituals',
    ],
    cta: 'Upgrade to Circle',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: 'Custom',
    period: '',
    description: 'Perfect for retreats, collectives, and organizations guiding reflective journeys.',
    perks: [
      'Dedicated success partner',
      'Custom onboarding experiences',
      'Private workspace branding',
      'Advanced analytics & exports',
      'Compliance reviews & SSO',
    ],
    cta: 'Talk to Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Is my writing private by default?',
    answer:
      'Yes. Everything you capture stays private unless you explicitly share an entry or collection. Even our team cannot access your content without your permission.',
  },
  {
    question: 'Can I write offline?',
    answer:
      'The mobile apps let you draft offline. Entries sync automatically when you reconnect so your practice never breaks.',
  },
  {
    question: 'Can I export my journals?',
    answer:
      'Export anytime in PDF or Markdown. Studio plans can also export JSON for archival or creative projects.',
  },
  {
    question: 'Do collaborators need a paid seat?',
    answer:
      'Circle and Studio plans include unlimited reader/collaborator seats. Solo Journey lets you invite one confidant at no extra cost.',
  },
];

export default function JourneyPricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-violet-300">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Choose the journal path that fits you
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Begin with a 14-day trial. Upgrade whenever you&apos;re ready to share your story or host a community.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted
                  ? 'border-violet-400 bg-gradient-to-br from-violet-500/10 to-indigo-500/10'
                  : 'border-white/10 bg-zinc-800/80'
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-100">
                    Most loved
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
                    <Check className="h-5 w-5 text-violet-300 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-violet-500 text-white hover:bg-violet-600'
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Keep your inner world protected</h2>
            <p className="text-white/70 leading-relaxed">
              Your reflections deserve a safe home. Journey uses encryption, access controls, and transparent permissions
              so you decide who sees each word.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-violet-300 mt-1" />
                <span>Encryption in transit and at rest, plus optional passphrase vaults for sensitive entries.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-violet-300 mt-1" />
                <span>AI suggestions stay on your device when privacy mode is enabled. Nothing trains shared models.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-violet-300 mt-1" />
                <span>Download receipts and access logs for every shared entry or collection.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Every plan includes</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-violet-300 mt-0.5" />
                <span>Unlimited entries, collections, and attachments.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-violet-300 mt-0.5" />
                <span>Prompt libraries tailored to creativity, leadership, relationships, and wellbeing.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-violet-300 mt-0.5" />
                <span>Calendar timeline view and milestone tagging.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-violet-300 mt-0.5" />
                <span>Support from guides who journal daily themselves.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Learn how billing, sharing, and exports work before you begin your journey.
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
              <h3 className="text-2xl font-semibold">Hosting a retreat or cohort?</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Studio plans include white-glove onboarding, facilitator toolkits, and custom reflection templates for your program.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Connect with our team
            </button>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
            <Heart className="h-5 w-5 text-violet-300" />
            Guided by community mentors who have logged over 10,000 collective entries.
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
