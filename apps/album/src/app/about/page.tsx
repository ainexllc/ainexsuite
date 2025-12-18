'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Camera, Sparkles, Share2, ShieldCheck, Users, Music2, Globe } from 'lucide-react';

const chapters = [
  {
    title: 'Started with a suitcase of footage',
    description:
      'Our founders were filmmakers drowning in hard drives after traveling the world. Moments began as a way to stitch everything into a single, coherent story.',
  },
  {
    title: 'Adopted by creators and families',
    description:
      'Photographers, parents, and community organizers asked for a simpler way to co-create and relive memories, so we made collaboration effortless.',
  },
  {
    title: 'Scaled to production houses',
    description:
      'Studios wanted the same magic for high-volume projects, pushing us to build pro-grade workflows while keeping the interface inviting.',
  },
];

const values = [
  {
    icon: Camera,
    title: 'Capture the truth',
    description:
      'We honor candid moments. Tools should elevate authenticity, not replace it.',
  },
  {
    icon: Sparkles,
    title: 'Delight in craft',
    description:
      'Great storytelling is equal parts emotion and precision. Moments helps you deliver both without the tedious heavy lifting.',
  },
  {
    icon: ShieldCheck,
    title: 'Protect what matters',
    description:
      'Your footage and rights are yours. We safeguard originals, access, and context every step of the way.',
  },
];

export default function MomentsAboutPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-pink-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-pink-300">
            Our Story
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Built for the people who keep memories alive
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Moments gives creators, families, and production teams a home for their stories—from raw captures to cinematic releases.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why Moments exists</h2>
            <p className="text-white/70 leading-relaxed">
              We were tired of juggling drives, emails, and apps just to share one recap video. Moments unifies capture,
              collaboration, and storytelling so memories move from raw files to finished experiences in no time.
            </p>
            <p className="text-white/70 leading-relaxed">
              From backyard celebrations to global launches, we treat each story with the reverence it deserves.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 text-pink-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">What guides us</span>
            </div>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-pink-300 mt-1" />
                <span>Stories are communal. We make it easy for everyone to contribute, react, and relive together.</span>
              </li>
              <li className="flex items-start gap-3">
                <Share2 className="h-5 w-5 text-pink-300 mt-1" />
                <span>Sharing should feel magical. Every export, gallery, and reel aims to surprise and delight.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Milestones we celebrate</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              A few chapters in our journey alongside the creators who trusted us with theirs.
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
              These principles keep Moments focused on empowering storytellers.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300 mb-4">
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
              <Music2 className="h-6 w-6 text-pink-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Creative council</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Musicians, editors, and visual storytellers advise on new features, ensuring Moments respects artistry while
              streamlining production.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-5">
            <div className="flex items-center gap-3 text-white">
              <Globe className="h-6 w-6 text-pink-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Global reach</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Moments powers storytelling across 40+ countries with localized interfaces, caption translation, and region-aware delivery.
            </p>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
