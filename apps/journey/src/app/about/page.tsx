'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { PenSquare, Heart, Sparkles, ShieldCheck, Users, Globe, Camera } from 'lucide-react';

const chapters = [
  {
    title: 'A private escape for our team',
    description:
      'Journey started as a way for our founders to process chaotic weeks building products. We needed a place to record wins, fears, and gratitude without judgment.',
  },
  {
    title: 'Crafted with storytellers',
    description:
      'Writers, therapists, and mindfulness teachers helped us design prompts, reflections, and rituals that invite deeper insight.',
  },
  {
    title: 'Expanded into shared storytelling',
    description:
      'As friends and partners joined, we built ways to share selects, create legacy projects, and honor memories together.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Compassion first',
    description:
      'Journey greets every entry with empathy. We build experiences that nurture, not critique.',
  },
  {
    icon: ShieldCheck,
    title: 'Sacred privacy',
    description:
      'Your inner world is yours. We invest heavily in encryption, consent, and transparency so trust is never compromised.',
  },
  {
    icon: Sparkles,
    title: 'Celebrate growth',
    description:
      'We highlight progress, resilience, and beauty in everyday moments—because reflection should feel rewarding.',
  },
];

export default function JourneyAboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-violet-300">
            Our Story
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            A journal for every chapter—and the people who share it with you
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Journey exists to honor your stories, protect your memories, and keep your growth visible even when life feels blurry.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why Journey exists</h2>
            <p className="text-white/70 leading-relaxed">
              We believe reflection fuels progress. But most tools felt either too clinical or too chaotic. Journey blends
              intention with warmth—the freedom of a private notebook with the intelligence of a guide.
            </p>
            <p className="text-white/70 leading-relaxed">
              From founders navigating pivots to parents documenting family milestones, Journey holds the memories that
              define who we become.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 text-violet-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">What guides us</span>
            </div>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-violet-300 mt-1" />
                <span>Reflection is communal. We support partners, cohorts, and families who want to grow together.</span>
              </li>
              <li className="flex items-start gap-3">
                <PenSquare className="h-5 w-5 text-violet-300 mt-1" />
                <span>Creativity thrives in safety. Journey keeps a soft landing for your most tender thoughts.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Milestones along the way</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              A few moments that shaped Journey into the companion it is today.
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
              These principles shape how we design Journey, respond to feedback, and partner with our community.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 mb-4">
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
              <Camera className="h-6 w-6 text-violet-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Memory keepers</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              We collaborate with photographers, documentarians, and archivists to help you preserve more than words—think
              audio snippets, film scans, and mementos tied to your entries.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-5">
            <div className="flex items-center gap-3 text-white">
              <Globe className="h-6 w-6 text-violet-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Global reflections</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Journey supports multilingual entries and localized prompts so communities worldwide can reflect in their native voice.
            </p>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
