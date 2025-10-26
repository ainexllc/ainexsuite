'use client';

import { FooterPageLayout } from '@/components/footer-page-layout';
import {
  StickyNote,
  Sparkles,
  FolderTree,
  Lightbulb,
  Search,
  Share2,
  PenSquare,
  Laptop,
} from 'lucide-react';

const heroHighlights = [
  {
    icon: StickyNote,
    title: 'Multimodal capture',
    description: 'Snap ideas from voice, handwriting, or web snippets—Notes keeps everything organized instantly.',
  },
  {
    icon: FolderTree,
    title: 'Smart organization',
    description: 'Knowledge graph views surface relationships between topics, projects, and collaborators.',
  },
  {
    icon: Lightbulb,
    title: 'Insight summaries',
    description: 'AI distills long notes into action items, highlights, and next-step prompts.',
  },
];

const workspaceFeatures = [
  {
    title: 'Flexible workspaces',
    description: 'Craft meeting notes, research outlines, or creative briefs with custom sections and layouts.',
  },
  {
    title: 'Living collections',
    description: 'Curate notes into collections that update automatically—perfect for projects, clients, or themes.',
  },
  {
    title: 'Team-ready sharing',
    description: 'Share notes with granular permissions. Add comments, tasks, and references without version chaos.',
  },
];

const integrations = [
  {
    title: 'Browser extensions',
    description: 'Save articles or quotes from any tab directly into Notes with tags and attribution.',
  },
  {
    title: 'Productivity stack',
    description: 'Sync tasks to Todo, link insights to Grow, and embed content into Notion or Google Docs.',
  },
  {
    title: 'Slack & email',
    description: 'Forward messages or threads to Notes, turning scattered conversations into structured knowledge.',
  },
];

export default function NotesFeaturesPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
            Notes Features
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Turn scattered thoughts into organized knowledge
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            AINex Notes is your capture engine for ideas, meetings, and research. Collect everything, synthesize quickly, and share with confidence.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {heroHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 mb-4">
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
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">A workspace that keeps up with your ideas</h2>
            <p className="text-white/70 leading-relaxed">
              Notes blends the speed of a scratchpad with the structure of a knowledge base. Capture fast, organize later—or let AI tag and sort for you.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <PenSquare className="h-5 w-5 text-blue-300 mt-1" />
                <span>
                  <strong className="text-white">Markdown & rich text:</strong> Mix quick bullets, code snippets, or rich embeds without losing flow.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Search className="h-5 w-5 text-blue-300 mt-1" />
                <span>
                  <strong className="text-white">Instant retrieval:</strong> Search by concept, tone, or people—AI understands what you meant even if you forgot the exact words.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Share2 className="h-5 w-5 text-blue-300 mt-1" />
                <span>
                  <strong className="text-white">Publish-ready exports:</strong> Turn notes into docs, slides, or shareable recaps with one click.
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/70 px-4 py-2 text-sm text-white/70">
              <Sparkles className="h-5 w-5 text-blue-300" />
              AI summary ready
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Today’s recap</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  “Product vision workshop highlighted three core themes: frictionless capture, team knowledge sharing, and AI coaching. Follow-up: align roadmap with these pillars.”
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Suggested actions</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Tag notes with #roadmap, share recap with leadership, draft 3 concept statements before next sprint review.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Templates for every workflow</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Launch faster with templates for research, meetings, strategy, journals, and more.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workspaceFeatures.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <Laptop className="h-6 w-6 text-blue-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Integrations</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Connected to your knowledge stack</h2>
            <p className="text-white/70 leading-relaxed">
              Notes plugs into the tools you already love so brainstorming, researching, and delivering stay in sync.
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
            <h2 className="text-2xl font-semibold text-white">Why note-takers choose AINex Notes</h2>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <StickyNote className="h-5 w-5 text-blue-300 mt-1" />
                <span>Capture in any format without worrying about structure—let AI tag and organize later.</span>
              </li>
              <li className="flex items-start gap-3">
                <Search className="h-5 w-5 text-blue-300 mt-1" />
                <span>Find ideas even when you barely remember the wording. Semantic search knows the context.</span>
              </li>
              <li className="flex items-start gap-3">
                <Share2 className="h-5 w-5 text-blue-300 mt-1" />
                <span>Turn notes into polished outputs—docs, decks, summaries—with zero copy-paste time.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </FooterPageLayout>
  );
}
