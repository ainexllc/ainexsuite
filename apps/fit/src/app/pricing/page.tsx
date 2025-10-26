"use client";

import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { FooterPageLayout } from "@/components/footer-page-layout";

const plans = [
  {
    name: "Athlete",
    price: "$14",
    period: "per month",
    description: "Dialed-in training intelligence for individual athletes.",
    perks: [
      "Adaptive strength & conditioning plans",
      "Recovery and readiness scoring",
      "Unlimited training history",
      "Wearable & nutrition sync",
      "AI session summaries",
    ],
    cta: "Start 14-day Trial",
    highlighted: false,
  },
  {
    name: "Coach",
    price: "$39",
    period: "per month",
    description: "Everything a coach needs to manage rosters and programming.",
    perks: [
      "All Athlete features",
      "Unlimited athletes & teams",
      "Coach dashboard & compliance reports",
      "Programming library & templates",
      "Video feedback & shared notes",
      "API/webhooks for custom workflows",
    ],
    cta: "Upgrade to Coach",
    highlighted: true,
  },
  {
    name: "Performance Team",
    price: "Let's talk",
    period: "",
    description: "Custom solutions for academies, schools, and professional clubs.",
    perks: [
      "Dedicated performance success manager",
      "SSO & provisioning support",
      "Advanced analytics workspace",
      "Private data lake exports",
      "White-label athlete portal",
      "Priority roadmap access",
    ],
    cta: "Book a Demo",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Do I need special hardware or sensors?",
    answer:
      "No. Fit works with manual logging right out of the box, and automatically enhances data when you connect wearables, velocity trackers, or nutrition apps.",
  },
  {
    question: "Can I import my existing training history?",
    answer:
      "Yes. Upload spreadsheets or connect your current tools and Fit will migrate sessions, templates, and athlete records without breaking your flow.",
  },
  {
    question: "What’s included in the 14-day trial?",
    answer:
      "Every feature. Build programming, invite athletes, connect wearables, and explore AI insights with no limitations. Cancel anytime—no credit card required.",
  },
  {
    question: "Is there a discount for teams or schools?",
    answer:
      "Absolutely. Performance Team plans are tailored to your roster size, staffing, and analytics needs. Book a demo and we’ll craft a plan that fits.",
  },
];

export default function FitPricingPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-orange-400">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Flexible plans for athletes and high-performance teams
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Start with a 14-day free trial. Upgrade when you’re ready to bring advanced performance
            intelligence to every session.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.highlighted ? "border-orange-400 bg-gradient-to-br from-orange-500/10 to-indigo-500/10" : "border-white/10 bg-zinc-800/80"
              } p-8 shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-300">
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
                    <Check className="h-5 w-5 text-orange-400 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "border border-white/20 text-white hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Every plan includes enterprise-grade security
            </h2>
            <p className="text-white/70 leading-relaxed">
              We treat performance data like health data—because it is. Fit is built on encrypted infrastructure
              with granular access controls so athletes and coaches always know who can see what.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-orange-400 mt-1" />
                <span>End-to-end encryption for training logs, biometrics, and media uploads.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-orange-400 mt-1" />
                <span>Role-based permissions so coaches, athletes, and parents get the right access.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-orange-400 mt-1" />
                <span>GDPR, CCPA, and NCAA data retention best practices baked in from day one.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Included with every plan</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-orange-400 mt-0.5" />
                <span>Unlimited training templates and AI session suggestions.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-orange-400 mt-0.5" />
                <span>Weekly readiness summaries delivered via email or Slack.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-orange-400 mt-0.5" />
                <span>Export capabilities for CSV, JSON, and PDF reports.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-orange-400 mt-0.5" />
                <span>Access to seasonal programming templates curated by performance coaches.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Everything you need to know about getting started with AINex Fit.
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
