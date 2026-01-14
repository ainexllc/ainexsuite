"use client";

import Link from "next/link";
import { Pin, Image, Check, ChevronLeft } from "lucide-react";
import { MOCK_NOTES, COLOR_CLASSES, type MockNote } from "../mock-data";

const NAV_VERSIONS = [
  { id: "v1", name: "Smart Masonry" },
  { id: "v2", name: "Compact Dense" },
  { id: "v3", name: "True Masonry" },
  { id: "v4", name: "Hero Spotlight" },
  { id: "v5", name: "Keep Style" },
];

// Compact card component - fixed 140px, favorites 200px
function CompactNoteCard({ note }: { note: MockNote }) {
  const colors = COLOR_CLASSES[note.color] || COLOR_CLASSES.default;
  const isFavorite = note.pinned;

  // Card height: favorites 200px, regular 140px
  const heightClass = isFavorite ? "h-[200px]" : "h-[140px]";

  // Favorite glow effect
  const glowClass = isFavorite
    ? "shadow-lg shadow-orange-500/20 dark:shadow-orange-500/30"
    : "";

  // Slightly brighter background for favorites
  const bgClass = isFavorite
    ? `${colors.bg} brightness-105 dark:brightness-110`
    : colors.bg;

  return (
    <div
      className={`
        ${heightClass}
        ${bgClass}
        ${colors.border}
        ${glowClass}
        rounded-lg border overflow-hidden
        flex flex-col
        transition-all hover:shadow-md hover:scale-[1.02]
        cursor-pointer
      `}
    >
      {/* Image placeholder - only show for favorites to save space */}
      {note.hasImage && isFavorite && (
        <div className="h-16 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center flex-shrink-0">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="w-5 h-5 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col min-h-0 overflow-hidden">
        {/* Header row with title and pin */}
        {(note.title || isFavorite) && (
          <div className="flex items-start justify-between gap-1 mb-1 flex-shrink-0">
            {note.title && (
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                {note.title}
              </h3>
            )}
            {isFavorite && (
              <Pin className="w-3 h-3 text-orange-500 fill-orange-500 flex-shrink-0" />
            )}
          </div>
        )}

        {/* Body or Checklist */}
        {note.type === "note" && note.body && (
          <p className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 overflow-hidden line-clamp-3">
            {note.body}
          </p>
        )}

        {note.type === "checklist" && note.checklist && (
          <ChecklistDisplay items={note.checklist} isFavorite={isFavorite} />
        )}
      </div>
    </div>
  );
}

// Compact checklist display - max 3 items with "+N more"
function ChecklistDisplay({
  items,
  isFavorite,
}: {
  items: { id: string; text: string; completed: boolean }[];
  isFavorite: boolean;
}) {
  const completedCount = items.filter((i) => i.completed).length;
  const maxDisplay = isFavorite ? 4 : 3;
  const displayItems = items.slice(0, maxDisplay);
  const remaining = items.length - maxDisplay;

  return (
    <div className="flex flex-col gap-0.5 overflow-hidden">
      {/* Minimal progress bar */}
      <div className="flex items-center gap-1.5 mb-1">
        <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 tabular-nums">
          {completedCount}/{items.length}
        </span>
      </div>

      {/* Checklist items */}
      {displayItems.map((item) => (
        <div key={item.id} className="flex items-center gap-1.5 min-w-0">
          <div
            className={`
              w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0
              ${
                item.completed
                  ? "bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600"
                  : "border-zinc-300 dark:border-zinc-600"
              }
            `}
          >
            {item.completed && <Check className="w-2 h-2 text-white" />}
          </div>
          <span
            className={`
              text-[10px] truncate
              ${
                item.completed
                  ? "text-zinc-400 dark:text-zinc-500 line-through"
                  : "text-zinc-600 dark:text-zinc-400"
              }
            `}
          >
            {item.text}
          </span>
        </div>
      ))}

      {/* Show remaining count */}
      {remaining > 0 && (
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 pl-4">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

export default function CompactDenseGridMockup() {
  const favorites = MOCK_NOTES.filter((n) => n.pinned);
  const regular = MOCK_NOTES.filter((n) => !n.pinned);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/mockups/note-cards"
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                  V2: Compact Dense Grid
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Maximum information density - 140px fixed height
                </p>
              </div>
            </div>

            {/* Version nav */}
            <nav className="flex items-center gap-1">
              {NAV_VERSIONS.map((v) => (
                <Link
                  key={v.id}
                  href={`/mockups/note-cards/${v.id}`}
                  className={`
                    px-2.5 py-1 text-xs font-medium rounded-md transition-colors
                    ${
                      v.id === "v2"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }
                  `}
                >
                  {v.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pin className="w-3 h-3" />
              Favorites
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {favorites.map((note) => (
                <CompactNoteCard key={note.id} note={note} />
              ))}
            </div>
          </section>
        )}

        {/* All Notes Section */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            All Notes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {regular.map((note) => (
              <CompactNoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>

        {/* Info footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="font-semibold text-zinc-900 dark:text-white mb-1">
                Regular Cards
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                Fixed 140px height
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="font-semibold text-zinc-900 dark:text-white mb-1">
                Favorites
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                200px with orange glow
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="font-semibold text-zinc-900 dark:text-white mb-1">
                Grid Layout
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                2-5 columns responsive
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="font-semibold text-zinc-900 dark:text-white mb-1">
                Checklist Display
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                Max 3 items + count
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
