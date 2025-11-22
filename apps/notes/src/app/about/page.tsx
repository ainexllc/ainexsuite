'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { BookOpenCheck, Share2, Lightbulb, ShieldCheck, Users, Sparkles } from 'lucide-react';

const chapters = [
  {
    title: 'Born from messy notebooks',
    description:
      'AINex Notes started as a way to clean up the avalanche of meeting scribbles, research snippets, and voice memos our team collected every day.',
  },
  {
    title: 'Evolved into a knowledge command center',
    description:
      'By layering AI organization, semantic search, and thoughtful collaboration, Notes now gives individuals and teams a calm, structured place to think.',
  },
  {
    title: 'Rooted in privacy',
    description:
      'We built Notes to be a trusted home for sensitive ideas. Encryption, access control, and transparent retention policies are non-negotiable.',
  },
];

const values = [
  {
    icon: BookOpenCheck,
    title: 'Capture without friction',
    description: 'Notes should be faster than grabbing a sticky note—yet powerful enough to scale into a knowledge system.',
  },
  {
    icon: Lightbulb,
    title: 'Insight over overload',
    description: 'Information is only useful when it leads to clarity. AI surfaces what matters at the right moment.',
  },
  {
    icon: Share2,
    title: 'Context is meant to be shared',
    description: 'We help teams distribute understanding, not just files. Everyone deserves the full picture.',
  },
];

export default function NotesAboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[var(--color-primary)]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
            Our Story
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Built for thinkers, makers, and teams who never stop learning
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Notes is the backbone of AINexSuite. It keeps ideas flowing between productivity, learning, and reflection—without losing context.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why Notes exists</h2>
            <p className="text-white/70 leading-relaxed">
              We were tired of copying meeting takeaways into slides, emailing ourselves ideas, and losing the thread between projects.
              Notes became our calm space—one where every thought could be captured, organized, and shared seamlessly.
            </p>
            <p className="text-white/70 leading-relaxed">
              Today, Notes helps creators, product teams, educators, and founders capture raw thinking and turn it into outcomes.
              Because when context flows, decisions and creativity follow.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--color-primary)]/10 to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 text-[var(--color-secondary)]" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">What guides us</span>
            </div>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[var(--color-secondary)] mt-1" />
                <span>Respect for the moments when ideas strike—Notes adapts to whatever device or medium you’re using.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)] mt-1" />
                <span>Protection for your most private thinking—security is woven into every feature.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">How we got here</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Notes evolved alongside the teams that depend on it. Here’s what shaped us.
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
              These principles guide every feature release and customer conversation.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-secondary)] mb-4">
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
