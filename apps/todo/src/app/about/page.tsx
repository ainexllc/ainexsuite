'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Target, Workflow, Users, Sparkles, ShieldCheck, Hourglass } from 'lucide-react';

const history = [
  {
    title: 'From sticky notes to smart ops',
    description:
      'Todo began as a side project to replace overflowing sticky notes and project spreadsheets. We wanted a system that understood priorities the way operators do.',
  },
  {
    title: 'Built for real-world coordination',
    description:
      'We layered AI, automations, and contextual data so Todo could orchestrate work across teams, not just individuals.',
  },
  {
    title: 'Integrated into AINexSuite',
    description:
      'By connecting with Notes, Grow, and Journey, Todo now keeps planning aligned with learning, reflection, and execution across the entire suite.',
  },
];

const principles = [
  {
    icon: Target,
    title: 'Outcome-focused organization',
    description: 'Tasks should always connect back to objectives. Todo makes it effortless to see why the work matters.',
  },
  {
    icon: Workflow,
    title: 'Automation with context',
    description: 'Movement between states shouldn’t require micro-managing. Automations should be flexible, transparent, and easy to adjust.',
  },
  {
    icon: Users,
    title: 'Human collaboration first',
    description: 'Tools should reduce status requests, not increase them. Todo keeps everyone aligned with shared visibility and clear ownership.',
  },
];

export default function TodoAboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            About Todo
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Built for leaders who keep teams moving
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Todo is the operational heartbeat of AINexSuite. We help teams coordinate, adapt, and deliver without drowning in meetings or status updates.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why we created Todo</h2>
            <p className="text-white/70 leading-relaxed">
              We watched operators spend more time rearranging tasks than executing them. Todo keeps deep work front and center, handles coordination automatically, and captures momentum across teams.
            </p>
            <p className="text-white/70 leading-relaxed">
              Today, startups, agencies, and product teams use Todo to plan sprints, manage launches, and keep stakeholders informed—without losing sight of big-picture goals.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 text-emerald-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">What drives us</span>
            </div>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Hourglass className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Time is finite. Todo should protect focus time instead of fragmenting it.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300 mt-1" />
                <span>Work data deserves enterprise-grade security, even for small teams.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">How Todo evolved</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              We build in the open with the operators and makers who rely on us daily.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {history.map((milestone) => (
              <div key={milestone.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-3">{milestone.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Guiding principles</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              These values steer every feature release, support response, and roadmap decision.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{principle.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{principle.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
