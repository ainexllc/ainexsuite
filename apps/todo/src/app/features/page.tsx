'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import {
  ClipboardCheck,
  BrainCircuit,
  CalendarClock,
  Workflow,
  Sparkles,
  Target,
  Users,
  BarChart3,
} from 'lucide-react';

const heroHighlights = [
  {
    icon: BrainCircuit,
    title: 'Priority intelligence',
    description: 'AINex Todo scores tasks automatically so the right work rises to the top each day.',
  },
  {
    icon: CalendarClock,
    title: 'Schedule aware',
    description: 'Pull calendar meetings and rituals into one plan so focus blocks actually fit.',
  },
  {
    icon: Workflow,
    title: 'Reusable workflows',
    description: 'Build playbooks for launches, reviews, and team rituals with automations baked in.',
  },
];

const automationHighlights = [
  {
    title: 'Smart intake',
    description: 'Capture tasks from email, Slack, and Notes. Todo classifies and slots them without breaking your flow.',
  },
  {
    title: 'Scenario planning',
    description: 'Shift due dates or workload in one view. Todo recalculates schedules and alerts affected teammates.',
  },
  {
    title: 'Focus mode',
    description: 'Block distractions with timed focus sessions, recorded progress, and end-of-day rollups.',
  },
];

const integrations = [
  {
    title: 'Project tools',
    description: 'Two-way links with Notion, Jira, and Linear keep tactical tasks synced with strategic projects.',
  },
  {
    title: 'Communication',
    description: 'Slack and email digests show what moved, what’s next, and who’s waiting on whom.',
  },
  {
    title: 'AINex Suite',
    description: 'Tie tasks to Grow goals, Notes references, and Journey reflections for full context.',
  },
];

export default function TodoFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Todo Features
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Plan boldly. Execute clearly.
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Todo turns an endless list into a strategic command center. See priorities, schedule focus time, and align teams—all in one place.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {heroHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 mb-4">
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">The lifecycle of a task, handled end to end</h2>
            <p className="text-white/70 leading-relaxed">
              Todo’s automation engine keeps tasks prioritized and contextualized from intake to done. No more copy-paste between planning docs and execution boards.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-300 mt-1" />
                <span>
                  <strong className="text-white">AI task briefs:</strong> Drop in a raw note and Todo writes a ready-to-execute brief with suggested subtasks and owners.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="h-5 w-5 text-emerald-300 mt-1" />
                <span>
                  <strong className="text-white">Outcome alignment:</strong> Tie tasks to OKRs or Grow goals so you always know why it matters.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-300 mt-1" />
                <span>
                  <strong className="text-white">Team clarity:</strong> Everyone sees dependencies, blockers, and owners at a glance—no status meetings required.
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <ClipboardCheck className="h-5 w-5 text-emerald-300" />
              Priority planner ready
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Today’s slate</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  High-impact tasks highlighted. Context pulled in from Notes and Grow. Deep work block scheduled and conflicts resolved.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Suggested adjustments</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Push “Finalize launch copy” to tomorrow—design dependencies still open. Slot “Mentor session prep” into today’s focus block.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Automation made for operators</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Automations make sure planning, execution, and reporting stay in sync even when plans change.
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
              <BarChart3 className="h-6 w-6 text-emerald-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Integrations</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Connect your productivity stack</h2>
            <p className="text-white/70 leading-relaxed">
              Todo stitches together tasks, communications, and project tools to give you one clear view of execution.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {integrations.map((integration) => (
                <div key={integration.title} className="rounded-2xl border border-white/10 bg-zinc-700/60 p-4">
                  <h3 className="text-base font-semibold text-white mb-1">{integration.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{integration.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-white">Why teams choose AINex Todo</h2>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Workflow className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Keep strategy and delivery aligned by tying tasks to goals, notes, and reflections.</span>
              </li>
              <li className="flex items-start gap-3">
                <CalendarClock className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Build realistic plans based on capacity—Todo adjusts when meetings or blockers appear.</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Give everyone clarity with personal focus modes and team-wide status views.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
