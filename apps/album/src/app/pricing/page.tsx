'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Check, Sparkles, Shield, Film } from 'lucide-react';

const plans = [
  {
    name: 'Creator',
    price: '$12',
    period: 'per month',
    description: 'Perfect for storytellers documenting travels, events, or creative passion projects.',
    perks: [
      'Unlimited galleries and reels',
      'AI tagging & smart selects',
      'Soundtrack & caption assistant',
      '4K exports with watermarks optional',
      '5 guest collaborators',
    ],
    cta: 'Start 14-day Trial',
    highlighted: false,
  },
  {
    name: 'Studio',
    price: '$34',
    period: 'per month',
    description: 'Designed for teams covering weddings, launches, podcasts, and client storytelling.',
    perks: [
      'All Creator features',
      'Unlimited collaborators',
      'Brand kits & template library',
      'Client review portals',
      'Live event capture mode',
    ],
    cta: 'Upgrade to Studio',
    highlighted: true,
  },
  {
    name: 'Production House',
    price: 'Custom',
    period: '',
    description: 'For agencies and enterprises managing high-volume productions and archives.',
    perks: [
      'Dedicated success producer',
      'Multi-brand workspaces',
      'Advanced rights management',
      'Archival cold storage',
      'API & DAM integrations',
    ],
    cta: 'Talk to Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I invite clients to review content?',
    answer:
      'Yes. Studio and Production plans include review portals where clients can comment, approve cuts, and download final assets with custom permissions.',
  },
  {
    question: 'What export formats are supported?',
    answer:
      'Download MP4, MOV, ProRes, or HEVC video plus PDF lookbooks, social-ready stories, and PNG/JPEG image sets. Audio can export as WAV or MP3.',
  },
  {
    question: 'Do you watermark exports?',
    answer:
      'Watermarks are optional for Creator and disabled by default on paid plans. You control watermark style and placement per export.',
  },
  {
    question: 'How does storage work?',
    answer:
      'Each plan includes generous active storage. Production House customers can add cold storage tiers for long-term archives at reduced costs.',
  },
];

export default function MomentsPricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-pink-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-pink-300">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Plans for storytellers and production teams
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Start free for 14 days. Upgrade when you&apos;re ready to invite collaborators, deliver final cuts, or manage big productions.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted
                  ? 'border-pink-400 bg-gradient-to-br from-pink-500/10 to-indigo-500/10'
                  : 'border-white/10 bg-zinc-800/80'
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-100">
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
                    <Check className="h-5 w-5 text-pink-300 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Security and licensing peace of mind</h2>
            <p className="text-white/70 leading-relaxed">
              Keep client assets safe while maintaining the flexibility to collaborate across teams and vendors.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-pink-300 mt-1" />
                <span>Granular permissions for crews, clients, and contractors with full access logs.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-pink-300 mt-1" />
                <span>AI editing stays in your workspace—no media is used to train external models.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-pink-300 mt-1" />
                <span>Custom licensing notes and usage restrictions travel with every exported asset.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Every plan includes</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-pink-300 mt-0.5" />
                <span>Unlimited projects, storyboards, and distribution channels.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-pink-300 mt-0.5" />
                <span>Auto-sync with mobile capture and desktop editing tools.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-pink-300 mt-0.5" />
                <span>Brand-safe template packs refreshed monthly.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-pink-300 mt-0.5" />
                <span>Email and chat support from producers who ship content daily.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Everything you need to know about collaborating, exporting, and managing client work.
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
              <h3 className="text-2xl font-semibold">Need white-label delivery?</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Production House plans include branded portals, client billing, and concierge onboarding for your team.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Schedule a walkthrough
            </button>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
            <Film className="h-5 w-5 text-pink-300" />
            Trusted by creators covering 500+ events every month.
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
