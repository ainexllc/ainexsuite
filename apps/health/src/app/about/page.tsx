'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Flame, ListChecks, BrainCircuit, Users, Sparkles, ShieldCheck, Compass } from 'lucide-react';

const chapters = [
  {
    title: 'Started as a founder ritual',
    description:
      'Track began when our team struggled to keep consistent habits while shipping products and leading teams. Sticky notes and habit apps lacked context—so we built our own.',
  },
  {
    title: 'Built with behavior science',
    description:
      'We partnered with habit coaches and psychologists to translate proven frameworks into customizable, compassionate tooling.',
  },
  {
    title: 'Expanded to teams',
    description:
      'Operators, studios, and growth leaders adopted Track to coordinate rituals across companies. Shared dashboards and accountability loops became core features.',
  },
];

const values = [
  {
    icon: ListChecks,
    title: 'Small wins matter',
    description:
      'Consistency beats intensity. Track celebrates every micro progress and adjusts recommendations to keep the streak alive.',
  },
  {
    icon: ShieldCheck,
    title: 'Psychological safety first',
    description:
      'Habits touch vulnerable parts of life. We design with empathy, optional sharing, and controls that keep you in charge.',
  },
  {
    icon: Sparkles,
    title: 'Coaching with kindness',
    description:
      'AI should encourage—not shame. Track offers supportive nudges and reframes setbacks into learning moments.',
  },
];

export default function TrackAboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
            Our Story
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Helping driven people design lives with momentum
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Track turns rituals into a living system—one that adapts to your goals, protects your energy, and celebrates the journey.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why we built Track</h2>
            <p className="text-white/70 leading-relaxed">
              We were tired of habit apps that treated every person the same. Real life is messy—launches run long,
              seasons change, energy ebbs. We wanted a system that flexed with us and still kept the big picture in view.
            </p>
            <p className="text-white/70 leading-relaxed">
              Track became our solution. It connects routines to purpose, captures reflection, and helps friends or teams
              stay aligned without micromanaging.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 text-amber-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">What guides us</span>
            </div>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-amber-300 mt-1" />
                <span>Habits are social. We build tools that make accountability supportive, not stressful.</span>
              </li>
              <li className="flex items-start gap-3">
                <BrainCircuit className="h-5 w-5 text-amber-300 mt-1" />
                <span>Insights should be actionable. Track translates data into clear next steps for the week ahead.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Milestones on our journey</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              From late-night prototypes to global teams, these chapters shaped Track into the coach it is today.
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
              These principles keep us focused on building a habit partner worthy of your goals.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 mb-4">
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
              <Compass className="h-6 w-6 text-amber-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Behavior advisory network</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Top coaches, therapists, and community builders review new features to ensure they reinforce healthy behavior
              change and inclusivity.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-5">
            <div className="flex items-center gap-3 text-white">
              <Flame className="h-6 w-6 text-amber-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Momentum manifesto</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              We believe motivation is a byproduct of structure. Track keeps your structure resilient so you can stay lit,
              even when life gets wild.
            </p>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
