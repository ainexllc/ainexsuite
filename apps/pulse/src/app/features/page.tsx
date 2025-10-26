'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import {
  HeartPulse,
  Activity,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  BellRing,
  FileHeart,
  Hospital,
  Gauge,
  Droplets,
  BrainCircuit,
} from 'lucide-react';

const featureHighlights = [
  {
    icon: HeartPulse,
    title: 'Unified biometrics',
    description:
      'Pull in wearables, lab panels, and manual entries for a continuous picture of body stress, recovery, and readiness.',
  },
  {
    icon: Activity,
    title: 'Adaptive baselines',
    description:
      'AINex Pulse learns your personal ranges, then flags subtle shifts in heart rate variability, sleep debt, and inflammation markers.',
  },
  {
    icon: Stethoscope,
    title: 'Care collaboration',
    description:
      'Share curated dashboards with coaches or clinicians and give them the context they need in seconds.',
  },
];

const monitoringHighlights = [
  {
    title: 'Pattern detection',
    description:
      'Auto-classify outliers across glucose, HRV, and mood entries so you can respond before symptoms compound.',
  },
  {
    title: 'Recovery guidance',
    description:
      'Receive AI recommendations on sleep, nutrition, and training adjustments based on your current load.',
  },
  {
    title: 'Early alerting',
    description:
      'Escalate critical signals to your inner circle with thresholds tuned to your provider’s preferences.',
  },
];

const careHighlights = [
  {
    title: 'Lab intelligence',
    description:
      'Trend blood work over time, see which biomarkers are drifting, and generate questions for your next appointment.',
  },
  {
    title: 'Medication tracking',
    description:
      'Log prescriptions and supplements once; Pulse keeps adherence summaries and highlights possible interactions.',
  },
  {
    title: 'Encounter prep',
    description:
      'Walk into every consult with an AI-authored brief that captures recent changes, notable events, and next-step suggestions.',
  },
];

const integrationPartners = [
  {
    title: 'Device ecosystem',
    description: 'Apple Health, Whoop, Oura, Garmin, Peloton, and manual CSV import.',
  },
  {
    title: 'Clinical platforms',
    description: 'FHIR-friendly export for EHRs plus secure share links for coaches and practitioners.',
  },
  {
    title: 'AINex Suite',
    description: 'Handshake with Todo, Track, and Journey so wellness insights take action across the suite.',
  },
];

export default function PulseFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-rose-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
            Pulse Features
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Monitor what matters. Act before it escalates.
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            AINex Pulse reunites the full picture of your health—signals, habits, and labs—then guides your next move with clinical-grade clarity.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Always-on monitoring with context</h2>
            <p className="text-white/70 leading-relaxed">
              Pulse correlates every data source in real time. The result: proactive guidance that respects your body, your team, and your goals.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-rose-300 mt-1" />
                <span>HIPAA-ready security with granular sharing controls for loved ones and practitioners.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-rose-300 mt-1" />
                <span>AI-generated recaps translate raw numbers into plain language next steps.</span>
              </li>
              <li className="flex items-start gap-3">
                <BellRing className="h-5 w-5 text-rose-300 mt-1" />
                <span>Predictive alerts surface trends before they trigger symptoms or setbacks.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-transparent to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <Gauge className="h-5 w-5 text-rose-300" />
              Vital snapshot ready
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Today’s watch list</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  HRV climbing back to baseline, inflammation markers steady, hydration trend dipping below target.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Suggested actions</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Add electrolyte boost pre-lunch, schedule a recovery walk, share readiness summary with your coach.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Care intelligence without extra admin</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Pulse lightens the lift for care teams while keeping you in control of every data point.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {monitoringHighlights.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <FileHeart className="h-6 w-6 text-rose-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Care collaboration</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Built for serious health journeys</h2>
            <p className="text-white/70 leading-relaxed">
              Whether you&apos;re training for a championship or managing a chronic condition, Pulse keeps everyone aligned with the facts.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {careHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-2xl border border-white/10 bg-zinc-700/60 p-4">
                  <h3 className="text-base font-semibold text-white mb-1">{highlight.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <Hospital className="h-6 w-6 text-rose-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Integrations</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Connect every signal</h2>
            <ul className="space-y-4 text-white/70">
              {integrationPartners.map((partner) => (
                <li key={partner.title} className="flex items-start gap-3">
                  <Droplets className="h-5 w-5 text-rose-300 mt-1" />
                  <span>
                    <strong className="text-white">{partner.title}:</strong> {partner.description}
                  </span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BrainCircuit className="h-5 w-5 text-rose-300" />
                AI compliance guardrails
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Log every share event with audit trails, consent tracking, and export receipts for peace of mind.
              </p>
            </div>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
