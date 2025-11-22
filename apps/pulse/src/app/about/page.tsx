'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { HeartPulse, ShieldCheck, Users, Sparkles, Globe2, Stethoscope, Cpu } from 'lucide-react';

const chapters = [
  {
    title: 'Born from athletic burnout',
    description:
      'Pulse started as a side project for our founders after juggling multiple wearables, lab spreadsheets, and conflicting advice left them guessing about recovery.',
  },
  {
    title: 'Evolved into an intelligence layer',
    description:
      'We layered signal processing, AI summaries, and beautiful visualization on top of raw vitals so anyone could understand what their body was saying.',
  },
  {
    title: 'Adopted by care teams',
    description:
      'Clinics and coaches asked for secure collaboration, so we built HIPAA-minded tooling—consent flows, audit logs, and role-based dashboards.',
  },
];

const values = [
  {
    icon: HeartPulse,
    title: 'Whole-person view',
    description:
      'Health is more than a single metric. Pulse combines data, context, and narrative so every decision is grounded in the full story.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy as a baseline',
    description:
      'We treat every data point like it belongs to someone we love. Encryption, consent, and control are never optional features.',
  },
  {
    icon: Sparkles,
    title: 'Clarity over noise',
    description:
      'Technology should reduce overwhelm. Pulse distills complex readings into clear, compassionate guidance.',
  },
];

export default function PulseAboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-rose-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
            Our Story
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Building the health brief we wanted for ourselves
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            AINex Pulse helps people, coaches, and clinicians stay ahead of the body&apos;s signals with a shared source
            of truth—without sacrificing privacy or humanity.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why Pulse exists</h2>
            <p className="text-white/70 leading-relaxed">
              Our team experienced the frustration of fragmented health data first-hand. Training insights lived in one
              app, lab results in another, conversations with providers in email threads. There was no single place to
              see what mattered or understand why trends were shifting.
            </p>
            <p className="text-white/70 leading-relaxed">
              Pulse became that place. It translates raw numbers into decisions, keeps everyone aligned on your protocol,
              and gives you ownership over every byte collected about your wellbeing.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/10 to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 text-rose-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">What guides us</span>
            </div>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-rose-300 mt-1" />
                <span>Health is collaborative. We design features that keep you, your support network, and providers on the same page.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-rose-300 mt-1" />
                <span>Trust is earned. Transparent permissions and audit trails are built into every share flow.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Milestones that shaped Pulse</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              From first prototypes to clinical deployments, these moments defined how the product feels today.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {chapters.map((chapter) => (
              <div key={chapter.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-3">{chapter.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{chapter.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">What we value</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              These principles steer every release, support conversation, and partnership.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg space-y-5">
            <div className="flex items-center gap-3 text-white">
              <Stethoscope className="h-6 w-6 text-rose-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Clinician council</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              We partner with sports medicine doctors, functional practitioners, and registered dietitians who review new
              features for medical accuracy and clarity. Their input keeps Pulse practical in high-stakes environments.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-5">
            <div className="flex items-center gap-3 text-white">
              <Cpu className="h-6 w-6 text-rose-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Ethical AI promise</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Our models highlight trends and suggest actions—they never make diagnoses. We continuously review bias,
              offer transparency into why recommendations appear, and keep humans in the loop.
            </p>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Globe2 className="h-5 w-5 text-rose-300" />
              Serving customers in 20+ countries with regional data residency options.
            </div>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
