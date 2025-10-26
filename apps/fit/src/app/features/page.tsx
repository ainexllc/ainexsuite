"use client";

import {
  Dumbbell,
  BrainCircuit,
  Activity,
  Timer,
  Trophy,
  ShieldCheck,
  Flame,
  HeartPulse,
} from "lucide-react";
import { FooterPageLayout } from "@/components/footer-page-layout";

const featureHighlights = [
  {
    icon: BrainCircuit,
    title: "Adaptive Programming",
    description:
      "Personalized training blocks that evolve with your recovery, strength gains, and competition calendar.",
  },
  {
    icon: HeartPulse,
    title: "Readiness Intelligence",
    description:
      "Daily readiness scores combine sleep, HRV, and session feedback so you know when to push or pull back.",
  },
  {
    icon: Timer,
    title: "Session Automation",
    description:
      "Preset timers, tempo cues, rest tracking, and auto-progression keep every workout dialed without spreadsheets.",
  },
];

const coachTools = [
  {
    title: "Coach Co-Pilot",
    description:
      "Let athletes log sessions while you review AI-generated summaries, compliance reports, and video feedback.",
  },
  {
    title: "Roster Overview",
    description:
      "Track team readiness, session quality, and recovery trends in one dashboard made for performance staff.",
  },
  {
    title: "Programming Library",
    description:
      "Build reusable training templates for different phases, then tweak instantly for each athlete or squad.",
  },
];

const integrations = [
  {
    title: "Wearables & Sensors",
    description:
      "Sync Apple Health, Garmin, WHOOP, and Oura to bring heart rate, sleep, and HRV directly into Fit.",
  },
  {
    title: "Nutrition Platforms",
    description:
      "Connect MyFitnessPal or Cronometer to overlay macros with training load for precise fueling decisions.",
  },
  {
    title: "Calendar & Comms",
    description:
      "Push key training milestones to Google Calendar and share recap links in Slack or your preferred chat app.",
  },
];

export default function FitFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-orange-400">
            Built for Strength & Hybrid Athletes
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            The command center for your performance journey
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Fit combines training planning, recovery intelligence, and coach collaboration into one
            seamless experience. Whether you’re chasing PRs or guiding a roster of athletes, every
            feature keeps momentum on track.
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 mb-4">
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Training intelligence that stays ahead of your body
            </h2>
            <p className="text-white/70 leading-relaxed">
              Fit watches every rep, interval, and recovery metric to keep you in the sweet spot between
              overload and adaptation. Snap a photo of your bar path or log a quick RPE—the AI will suggest
              volume tweaks, mobility breaks, and next-day priorities automatically.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Flame className="h-5 w-5 text-orange-400 mt-1" />
                <span>
                  <strong className="text-white">Adaptive deloads:</strong> Fit senses fatigue trends and slides in
                  structured recovery weeks right when you need them.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-orange-400 mt-1" />
                <span>
                  <strong className="text-white">Injury watch:</strong> Tag pain or discomfort mid-session and receive
                  prehab suggestions plus escalation guidance if issues persist.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-orange-400 mt-1" />
                <span>
                  <strong className="text-white">Velocity zones:</strong> Track bar speed trends to ensure power phases
                  stay explosive and hypertrophy phases stay on tempo.
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/10 via-transparent to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <HeartPulse className="h-5 w-5 text-orange-400" />
              Live readiness score: <span className="text-white font-semibold">78 — Prime</span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Today’s focus</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Heavy lower session with accommodating resistance. Keep bar speed above 0.45 m/s on working sets.
                  Fit will flag when fatigue impacts velocity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Recovery prompts</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  10-minute parasympathetic reset post-training. Evening hydration reminder paired with magnesium check.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
              Coaching Suite
            </span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Tools that keep coaches and athletes in sync
            </h2>
            <p className="text-white/70 max-w-3xl mx-auto">
              Fit streamlines communication, session oversight, and programming tweaks so you can focus on high-value feedback.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {coachTools.map((tool) => (
              <div
                key={tool.title}
                className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-md"
              >
                <h3 className="text-xl font-semibold text-white mb-3">{tool.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-orange-400" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Integrations
              </span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Connected to the tools you already trust</h2>
            <p className="text-white/70 leading-relaxed">
              Fit plugs into your favorite wearables, nutrition trackers, and communication platforms so you can
              centralize performance data without changing your stack.
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
            <h2 className="text-2xl font-semibold text-white">Why athletes choose Fit</h2>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Dumbbell className="h-5 w-5 text-orange-400 mt-1" />
                <span>Programming adapts automatically, so you can stay focused on execution instead of spreadsheets.</span>
              </li>
              <li className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-orange-400 mt-1" />
                <span>Readiness and energy trends prevent burnout long before it sidelines a training cycle.</span>
              </li>
              <li className="flex items-start gap-3">
                <HeartPulse className="h-5 w-5 text-orange-400 mt-1" />
                <span>Every log becomes a data point—Fit surfaces insights you’d normally need a performance staff to notice.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
