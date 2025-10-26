'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import {
  PenSquare,
  Heart,
  Feather,
  BrainCircuit,
  BookOpen,
  Compass,
  Clock,
  Users,
  Quote,
  NotebookPen,
  Image as ImageIcon,
} from 'lucide-react';

const featureHighlights = [
  {
    icon: PenSquare,
    title: 'Narrative studio',
    description:
      'Draft entries with AI co-authors that mirror your tone, suggest deeper prompts, and shape fragments into stories.',
  },
  {
    icon: Heart,
    title: 'Emotional analytics',
    description:
      'Track mood, energy, and themes over time. Journey surfaces inflection points and correlates them with milestones.',
  },
  {
    icon: Compass,
    title: 'Memory map',
    description:
      'Link reflections to people, places, projects, and rituals. Everything stays searchable and beautifully organized.',
  },
];

const ritualHighlights = [
  {
    title: 'Guided reflections',
    description:
      'Choose from morning priming, nightly closure, or deep-dive prompts tuned to your current season.',
  },
  {
    title: 'Voice-to-story',
    description:
      'Record a quick voice note. Journey transcribes, summarizes, and offers next-step prompts in seconds.',
  },
  {
    title: 'Moment capsules',
    description:
      'Drop photos, audio, and links into your entries. Build rich memories without leaving the flow of writing.',
  },
];

const connectionHighlights = [
  {
    title: 'Private or shared',
    description:
      'Keep entries locked down or selectively share with confidants, coaches, or therapists for deeper conversations.',
  },
  {
    title: 'Story exports',
    description:
      'Turn selected entries into newsletters, gratitude letters, or annual recaps formatted automatically.',
  },
  {
    title: 'Suite integration',
    description:
      'Send insights to Notes, align feelings with habits in Track, and anchor decisions in Todo—all without copy-paste.',
  },
];

const mediaHighlights = [
  {
    title: 'Memory lanes',
    description: 'Walk through timelines of a relationship, project, or city with curated photos and quotes.',
  },
  {
    title: 'Moodboards',
    description: 'Collect motifs, colors, and lyrics that defined a season. Journey keeps them ready for future inspiration.',
  },
  {
    title: 'Highlight reels',
    description: 'Compile milestone entries into a shareable, cinematic recap for friends, family, or your future self.',
  },
];

export default function JourneyFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-violet-300">
            Journey Features
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            A reflective canvas for every chapter of your life
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            AINex Journey is your sanctuary for writing, remembering, and evolving. Capture raw feelings, uncover patterns, and honor growth.
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 mb-4">
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Write freely, reflect deeply</h2>
            <p className="text-white/70 leading-relaxed">
              Journey invites you to express without editing. AI handles structure, surfaces insights, and gently nudges
              you to explore what&apos;s beneath the surface.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Feather className="h-5 w-5 text-violet-300 mt-1" />
                <span>Flexible entry types—typed, handwritten, voice, photo, or a mix of everything.</span>
              </li>
              <li className="flex items-start gap-3">
                <BrainCircuit className="h-5 w-5 text-violet-300 mt-1" />
                <span>AI reflections highlight recurring themes, triggers, and sources of gratitude.</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-violet-300 mt-1" />
                <span>Scheduled check-ins keep your practice alive without overwhelming your calendar.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <NotebookPen className="h-5 w-5 text-violet-300" />
              Evening reflection completed
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Today&apos;s story thread</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Celebrated a product launch, noticed fatigue, and felt grateful for the support network that made it happen.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Suggested prompts</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  &ldquo;What energized you today?&rdquo; &ldquo;Where did you feel proud?&rdquo; &ldquo;How will you care for yourself tomorrow?&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Rituals that meet you where you are</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Whether you journal in the morning, between meetings, or on red-eye flights, Journey adapts to your rhythm.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ritualHighlights.map((item) => (
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
              <Users className="h-6 w-6 text-violet-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Connection</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Share only what feels right</h2>
            <p className="text-white/70 leading-relaxed">
              Journey protects your inner world while making it effortless to invite others in when you&apos;re ready.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {connectionHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-2xl border border-white/10 bg-zinc-700/60 p-4">
                  <h3 className="text-base font-semibold text-white mb-1">{highlight.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <Quote className="h-6 w-6 text-violet-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Memory craft</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Transform entries into keepsakes</h2>
            <ul className="space-y-4 text-white/70">
              {mediaHighlights.map((highlight) => (
                <li key={highlight.title} className="flex items-start gap-3">
                  <ImageIcon className="h-5 w-5 text-violet-300 mt-1" />
                  <span>
                    <strong className="text-white">{highlight.title}:</strong> {highlight.description}
                  </span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BookOpen className="h-5 w-5 text-violet-300" />
                Annual anthology builder
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Curate your year with a single click—Journey selects standout entries, quotes, and visuals for your yearly reflection.
              </p>
            </div>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
