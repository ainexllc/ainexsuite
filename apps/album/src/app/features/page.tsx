'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import {
  Camera,
  Palette,
  Clapperboard,
  Sparkles,
  Music2,
  Share2,
  MapPin,
  Users,
  Wand2,
  FileVideo,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';

const featureHighlights = [
  {
    icon: Camera,
    title: 'Unified capture',
    description:
      'Import photos, video clips, audio, and notes from your devices or cloud drives. Moments organizes everything automatically.',
  },
  {
    icon: Palette,
    title: 'Mood-driven curation',
    description:
      'AI tags every memory by emotion, color palette, location, and people so you can rediscover stories instantly.',
  },
  {
    icon: Clapperboard,
    title: 'Instant storytelling',
    description:
      'Generate highlight reels, recap decks, or mini documentaries with cinematic transitions and captions.',
  },
];

const creationHighlights = [
  {
    title: 'Smart selects',
    description:
      'Moments picks the best clips, balances exposure, and suggests trims so you can focus on the narrative.',
  },
  {
    title: 'Soundtracks & voiceovers',
    description:
      'Pair scenes with royalty-free music or narrate your story. AI levels audio and removes background noise automatically.',
  },
  {
    title: 'Design presets',
    description:
      'Apply gallery themes, typography styles, and motion templates tuned for social, events, or keepsakes.',
  },
];

const collaborationHighlights = [
  {
    title: 'Shared galleries',
    description:
      'Invite friends, family, or teammates to upload media, vote on selects, and leave reactions in a private space.',
  },
  {
    title: 'Live events',
    description:
      'Capture weddings, product launches, or festivals with real-time uploads and auto-synced timelines.',
  },
  {
    title: 'Export freedom',
    description:
      'Download 4K reels, print-ready albums, or lightweight stories optimized for social platforms.',
  },
];

const distributionHighlights = [
  {
    title: 'Narrative timelines',
    description: 'Plot memories on an interactive timeline blending images, videos, and journal snippets.',
  },
  {
    title: 'Interactive maps',
    description: 'Explore memories by city or venue. Perfect for travel diaries and community archives.',
  },
  {
    title: 'Private broadcasts',
    description: 'Share encrypted story links with expiration controls, watermarks, and download permissions.',
  },
];

export default function MomentsFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-pink-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-pink-300">
            Moments Features
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Craft living stories from every moment you capture
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            AINex Moments brings your media, memories, and voice together—then turns them into experiences you can share forever.
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300 mb-4">
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Remix memories with studio-level polish</h2>
            <p className="text-white/70 leading-relaxed">
              Moments handles the tedious edits while you focus on how the story should feel. From exposure fixes to tone
              matching, everything adapts to your style automatically.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-pink-300 mt-1" />
                <span>Auto-clean audio, stabilize footage, and color-balance mixed lighting in a single pass.</span>
              </li>
              <li className="flex items-start gap-3">
                <Music2 className="h-5 w-5 text-pink-300 mt-1" />
                <span>Curated soundtrack suggestions that match the mood of each scene or ceremony.</span>
              </li>
              <li className="flex items-start gap-3">
                <Wand2 className="h-5 w-5 text-pink-300 mt-1" />
                <span>Generative transitions and motion graphics tailored to your brand or event aesthetic.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-transparent to-indigo-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <FileVideo className="h-5 w-5 text-pink-300" />
              Highlight reel ready
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Storyboard preview</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Opening montage, candid interviews, keynote highlights, and closing gratitude moments sequenced automatically.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Suggested refinements</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Add voiceover to intro, feature top attendee quotes, include behind-the-scenes reel for bonus content.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Creation tools built for storytellers</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              From solo creators to production teams, Moments keeps workflows fast, collaborative, and fun.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {creationHighlights.map((item) => (
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
              <Users className="h-6 w-6 text-pink-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Collaboration</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Bring your crew into the creative process</h2>
            <p className="text-white/70 leading-relaxed">
              Collect media live, approve selects, and build the narrative together from any device.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {collaborationHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-2xl border border-white/10 bg-zinc-700/60 p-4">
                  <h3 className="text-base font-semibold text-white mb-1">{highlight.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <Share2 className="h-6 w-6 text-pink-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Distribution</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Share stories your way</h2>
            <ul className="space-y-4 text-white/70">
              {distributionHighlights.map((highlight) => (
                <li key={highlight.title} className="flex items-start gap-3">
                  <ImageIcon className="h-5 w-5 text-pink-300 mt-1" />
                  <span>
                    <strong className="text-white">{highlight.title}:</strong> {highlight.description}
                  </span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-5 w-5 text-pink-300" />
                Geo-synced memories
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Relive journeys city by city with playlists, journal snippets, and highlight reels tied to each stop.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-white">
              <Mic className="h-6 w-6 text-pink-300" />
              <h2 className="text-2xl font-semibold">Creator-first support</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed md:max-w-xl">
              Workshops, template drops, and concierge onboarding help you bring your storytelling vision to life—whether
              it’s a personal archive or a premier event production.
            </p>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
