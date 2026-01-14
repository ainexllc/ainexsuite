"use client";

import Link from "next/link";
import { ArrowRight, Layout, Grid3X3, Sparkles, Star, Layers, Blend } from "lucide-react";

const VERSIONS = [
  {
    id: "v1",
    name: "Smart-Sized Masonry",
    description: "4 height tiers (100/140/200/260px) based on content type + amount. Favorites get +40px and subtle accent border.",
    icon: Sparkles,
    recommended: false,
  },
  {
    id: "v2",
    name: "Compact Dense Grid",
    description: "Fixed 140px cards for maximum density. Favorites at 200px with accent glow. Information-first approach.",
    icon: Grid3X3,
    recommended: false,
  },
  {
    id: "v3",
    name: "Pinterest True Masonry",
    description: "Fully variable heights - content dictates exactly. Favorites span 2 columns as hero cards.",
    icon: Layout,
    recommended: false,
  },
  {
    id: "v4",
    name: "Hero Spotlight",
    description: "Standard 180px cards with massive 320px hero favorites. Clear hierarchy - favorites are stars.",
    icon: Star,
    recommended: false,
  },
  {
    id: "v5",
    name: "Google Keep Style",
    description: "3 smooth sizes (S/M/L) with colored accent borders. Familiar and friendly aesthetic.",
    icon: Layers,
    recommended: false,
  },
  {
    id: "v6",
    name: "Best Of Mashup",
    description: "Smart sizing (V1) + Compact progress bar (V2) + Image headers (V3) + Hero divider line (V4). The ultimate combination.",
    icon: Blend,
    recommended: true,
  },
];

export default function NoteCardMockupsIndex() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Note Card Sizing Mockups
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            6 different approaches to card sizing and hero favorites treatment.
            Click any version to see the full mockup.
          </p>
        </header>

        <div className="grid gap-4">
          {VERSIONS.map((version) => {
            const Icon = version.icon;
            return (
              <Link
                key={version.id}
                href={`/mockups/note-cards/${version.id}`}
                className="group relative flex items-center gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
              >
                {version.recommended && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full">
                    Recommended
                  </span>
                )}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                    {version.name}
                    <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
                      /{version.id}
                    </span>
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {version.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>

        <footer className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
          <p>Navigate between versions using the header links on each page.</p>
        </footer>
      </div>
    </div>
  );
}
