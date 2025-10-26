'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import {
  Target,
  Flame,
  AlarmClock,
  Sparkles,
  CalendarClock,
  TrendingUp,
  ListChecks,
  Users,
  Trophy,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react';

const featureHighlights = [
  {
    icon: Target,
    title: 'Habit intentions',
    description:
      'Define the why, when, and how for every habit. Track keeps your intentions visible and ties them to the outcomes you care about.',
  },
  {
    icon: Flame,
    title: 'Momentum scoring',
    description:
      'Smart streaks factor in intensity, consistency, and recovery so you celebrate real progress—not calendar math.',
  },
  {
    icon: CalendarClock,
    title: 'Rhythm planning',
    description:
      'Design weekly and seasonal cadences with effortless drag-and-drop. Track optimizes focus blocks around your energy curve.',
  },
];

const automationHighlights = [
  {
    title: 'Adaptive nudges',
    description:
      'Notifications adjust based on timezones, schedule conflicts, and recent wins so reminders stay helpful, never nagging.',
  },
  {
    title: 'Reflection loops',
    description:
      'End each habit with guided prompts. Track distills your answers into insights, mood trends, and blockers to revisit later.',
  },
  {
    title: 'Restart safety nets',
    description:
      'When life interrupts, Track suggests scaled-back versions of routines to rebuild confidence without losing momentum.',
  },
];

const coachHighlights = [
  {
    title: 'Shared dashboards',
    description:
      'Invite mentors or teams to follow along. Provide context on goals, routines, and readiness in one secure space.',
  },
  {
    title: 'Accountability recaps',
    description:
      'Automatic weekly summaries highlight breakthroughs, slips, and action items for the days ahead.',
  },
  {
    title: 'Goal alignment',
    description:
      'Tie habits to Todo projects or Grow goals so daily actions always ladder up to the bigger picture.',
  },
];

const integrationHighlights = [
  {
    title: 'Productivity tools',
    description: 'Sync habits with Todo tasks and calendar events to keep execution synchronized.',
  },
  {
    title: 'Wellness devices',
    description: 'Pull sleep and readiness data from Pulse to adapt routines on recovery days.',
  },
  {
    title: 'AINex suite',
    description: 'Send reflections to Journey and insights to Notes for richer storytelling across the suite.',
  },
];

export default function TrackFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
            Track Features
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Habit systems for ambitious operators
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            AINex Track weaves routines, reflections, and accountability into a momentum machine that bends to real life.
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 mb-4">
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Build rituals that respond to reality</h2>
            <p className="text-white/70 leading-relaxed">
              Track analyzes your energy, schedule, and wins to tune each habit. When priorities shift, your routine
              adjusts without you rebuilding everything from scratch.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-300 mt-1" />
                <span>AI suggests ideal timing windows based on your history and calendar availability.</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-amber-300 mt-1" />
                <span>Momentum graphs reveal trends in consistency, intensity, and emotional state.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlarmClock className="h-5 w-5 text-amber-300 mt-1" />
                <span>Dynamic reminders escalate gently when streaks drift, giving you control without guilt.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-transparent to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <ListChecks className="h-5 w-5 text-amber-300" />
              Evening ritual summarized
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Today&apos;s highlights</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Deep work ritual hit 90% focus, hydration bounced back, and reflection noted a new blocker with context.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Next moves</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Schedule recovery run, invite accountability partner to tomorrow&apos;s build session, attach note to Grow goal.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Automations that keep you consistent</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Track’s automations keep habits aligned with the rest of your life so motivation isn’t required every day.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {automationHighlights.map((item) => (
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
              <Users className="h-6 w-6 text-amber-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Accountability</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Designed for teams and partners</h2>
            <p className="text-white/70 leading-relaxed">
              Whether you&apos;re coaching clients or building habits with a partner, Track keeps everyone aligned and
              motivated.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {coachHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-2xl border border-white/10 bg-zinc-700/60 p-4">
                  <h3 className="text-base font-semibold text-white mb-1">{highlight.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-amber-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Integrations</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Connect every motivation loop</h2>
            <ul className="space-y-4 text-white/70">
              {integrationHighlights.map((integration) => (
                <li key={integration.title} className="flex items-start gap-3">
                  <ArrowUpRight className="h-5 w-5 text-amber-300 mt-1" />
                  <span>
                    <strong className="text-white">{integration.title}:</strong> {integration.description}
                  </span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ClipboardList className="h-5 w-5 text-amber-300" />
                Ritual insights everywhere
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Send weekly habit recaps to Notes for documentation or Todo for action planning—no copy-paste required.
              </p>
            </div>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
