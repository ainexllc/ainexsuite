"use client";

import { FooterPageLayout } from "@/components/footer-page-layout";
import { Trophy, Users, Activity, Target, HeartPulse, ShieldCheck } from "lucide-react";

const milestones = [
  {
    year: "2019",
    title: "Program spreadsheets, late nights",
    description:
      "AINex Fit started as a scrappy strength-training spreadsheet shared between two coaches trying to juggle dozens of athletes with different goals.",
  },
  {
    year: "2021",
    title: "The AI engine takes shape",
    description:
      "We trained our first readiness models using real athlete data, helping teams detect burnout and injury risk before it derailed a season.",
  },
  {
    year: "2023",
    title: "Fit joins AINexSuite",
    description:
      "By connecting with the broader productivity suite, Fit now syncs with habits, notes, and coaching dashboards to give athletes a true 360° view.",
  },
];

const values = [
  {
    icon: Target,
    title: "Performance first",
    description: "Every feature is designed to help you show up stronger on the platform, track, or field.",
  },
  {
    icon: Users,
    title: "Coach + athlete harmony",
    description: "Fit keeps communication clear and programming aligned so everyone pulls in the same direction.",
  },
  {
    icon: ShieldCheck,
    title: "Data dignity",
    description: "Your metrics belong to you. We protect them with enterprise security and flexible export controls.",
  },
];

export default function FitAboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-orange-400">
            Our story
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Built by coaches. Powered by athletes.
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            We’re a team of performance coaches, sport scientists, and builders obsessed with helping
            athletes and hybrid performers reach their potential without drowning in logistics.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Why we created Fit
            </h2>
            <p className="text-white/70 leading-relaxed">
              We saw athletes juggling seven different apps just to track workouts, readiness, and coach feedback.
              Program adjustments arrived too late, and data lived in silos. Fit changes that by combining coaching
              workflows, smart automation, and performance analytics in one place.
            </p>
            <p className="text-white/70 leading-relaxed">
              Every log, wearable metric, and note feeds a unified engine that keeps training aligned with your goals.
              Whether you’re chasing a podium or supporting a full roster, Fit keeps the process fluid so you can focus on execution.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 text-white">
              <HeartPulse className="h-6 w-6 text-orange-400" />
              <span className="font-semibold uppercase tracking-wide text-sm text-white/60">What drives us</span>
            </div>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-orange-400 mt-1" />
                <span>Helping athletes push harder while staying healthier through better load management.</span>
              </li>
              <li className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-orange-400 mt-1" />
                <span>Turning raw training data into clear actions for coaches, therapists, and athletes.</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-orange-400 mt-1" />
                <span>Building tools that make collaboration effortless—remote or in-person.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Milestones so far</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Fit grows alongside the athletes and coaches who trust it. Here’s how we’ve evolved.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {milestones.map((milestone) => (
              <div key={milestone.year} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/50">{milestone.year}</div>
                <h3 className="text-xl font-semibold text-white mt-2 mb-3">{milestone.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Our promises</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              These principles guide every feature release and customer conversation.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
