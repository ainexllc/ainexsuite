'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import {
  Lightbulb,
  GraduationCap,
  Brain,
  Users,
  Target,
  CalendarCheck,
  FileText,
  Workflow,
} from 'lucide-react';

const heroHighlights = [
  {
    icon: Brain,
    title: 'Adaptive Learning Paths',
    description:
      'AI-crafted sprints and milestones that evolve with your progress, schedule, and reflections.',
  },
  {
    icon: Users,
    title: 'Mentor Collaboration',
    description:
      'Share journals, quizzes, and growth metrics with mentors or peers to accelerate feedback.',
  },
  {
    icon: Target,
    title: 'Results You Can Measure',
    description:
      'Momentum dashboards show streaks, clarity gains, and focus shifts in real time.',
  },
];

const playbooks = [
  {
    title: 'Skill Sprints',
    description:
      'Launch 2–4 week learning sprints with structured practice, AI check-ins, and mentor reviews.',
  },
  {
    title: 'Knowledge Vault',
    description:
      'Capture insights from books, podcasts, and lectures; Grow organizes references automatically.',
  },
  {
    title: 'Reflection Rituals',
    description:
      'Guided nightly prompts crystallize lessons, highlight blockers, and suggest tomorrow’s focus.',
  },
];

const integrations = [
  {
    title: 'Resource Sync',
    description:
      'Connect Readwise, Notion, or Google Drive to pull highlights and reference material directly into Grow.',
  },
  {
    title: 'Calendar Alignment',
    description:
      'Push sprint milestones and deep work sessions to your calendar automatically.',
  },
  {
    title: 'Collaboration Tools',
    description:
      'Share learning boards via Slack or email summaries so teammates stay aligned with your progress.',
  },
];

export default function GrowFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300">
            Grow Features
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Your learning strategy, supercharged by AI
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Grow captures the way you learn, then orchestrates practice, reflection, and feedback so every goal becomes achievable.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {heroHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 mb-4">
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Learning workflows that stay in rhythm</h2>
            <p className="text-white/70 leading-relaxed">
              Grow aligns goals, resources, and practice in a single view. Map your week, plug in reference material, and let AI suggest the next best action so momentum never stalls.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <CalendarCheck className="h-5 w-5 text-indigo-300 mt-1" />
                <span>
                  <strong className="text-white">Dynamic scheduling:</strong> Block time for study, workshops, and rest; Grow adjusts when your week changes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Workflow className="h-5 w-5 text-indigo-300 mt-1" />
                <span>
                  <strong className="text-white">Context-aware prompts:</strong> Capture quick wins, roadblocks, and aha moments—Grow surfaces them during reviews.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-indigo-300 mt-1" />
                <span>
                  <strong className="text-white">Insight summaries:</strong> Weekly AI reflections summarize progress, highlight skill gaps, and recommend focus areas.
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <Lightbulb className="h-5 w-5 text-indigo-300" />
              <span className="text-white">Reflection insight ready</span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Today’s reflection</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  “Storytelling workshop unlocked a new framework. Need to practice on the next pitch deck. AI suggests a 30-minute recap tomorrow.”
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Recommended practice</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Record a 5-minute video explaining the framework, then share with mentor for feedback. Add takeaways to the Knowledge Vault.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Ready-made playbooks</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Launch with templates designed by learning strategists, then customize each step to fit your goals.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {playbooks.map((playbook) => (
              <div key={playbook.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-3">{playbook.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{playbook.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-indigo-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Integrations</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Bring all your learning data together</h2>
            <p className="text-white/70 leading-relaxed">
              Grow connects knowledge sources, calendars, and collaboration tools so your efforts stay aligned.
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
            <h2 className="text-2xl font-semibold text-white">Why learners choose Grow</h2>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-indigo-300 mt-1" />
                <span>AI helps you retain more by surfacing the exact prompts and refreshers you need.</span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="h-5 w-5 text-indigo-300 mt-1" />
                <span>Goals stay front and center with weekly scorecards that highlight momentum and blind spots.</span>
              </li>
              <li className="flex items-start gap-3">
                <span>Mentors and peers get just the right context to give meaningful feedback fast.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
