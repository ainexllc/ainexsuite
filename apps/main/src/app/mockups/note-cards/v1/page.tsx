"use client";

import Link from "next/link";
import { Pin, Check, Circle, ImageIcon, Sparkles } from "lucide-react";
import {
  MOCK_NOTES,
  COLOR_CLASSES,
  getContentSize,
  type MockNote,
} from "../mock-data";

// Height mapping based on content size
const HEIGHT_MAP = {
  tiny: "h-[100px]",
  small: "h-[140px]",
  medium: "h-[200px]",
  large: "h-[260px]",
};

// Pinned cards get +40px
const PINNED_HEIGHT_MAP = {
  tiny: "h-[140px]",
  small: "h-[180px]",
  medium: "h-[240px]",
  large: "h-[300px]",
};

const NAV_LINKS = [
  { id: "v1", name: "V1: Smart Masonry", current: true },
  { id: "v2", name: "V2: Compact Dense" },
  { id: "v3", name: "V3: Pinterest" },
  { id: "v4", name: "V4: Hero Spotlight" },
  { id: "v5", name: "V5: Keep Style" },
];

function NoteCard({ note, isPinned }: { note: MockNote; isPinned?: boolean }) {
  const size = getContentSize(note);
  const colorClasses = COLOR_CLASSES[note.color] || COLOR_CLASSES.default;
  const heightClass = isPinned ? PINNED_HEIGHT_MAP[size] : HEIGHT_MAP[size];

  // Calculate checklist progress
  const completedCount =
    note.checklist?.filter((item) => item.completed).length || 0;
  const totalCount = note.checklist?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className={`
        break-inside-avoid mb-4 rounded-2xl border overflow-hidden transition-all
        ${colorClasses.bg} ${colorClasses.border}
        ${heightClass}
        ${
          isPinned
            ? "border-l-[3px] border-l-orange-500 shadow-lg shadow-orange-500/10"
            : "hover:shadow-md"
        }
      `}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Header */}
        {(note.title || isPinned) && (
          <div className="flex items-start justify-between gap-2 mb-2">
            {note.title && (
              <h3
                className={`font-semibold text-zinc-900 dark:text-white line-clamp-1 ${
                  isPinned ? "text-base" : "text-sm"
                }`}
              >
                {note.title}
              </h3>
            )}
            {isPinned && (
              <Pin className="w-4 h-4 text-orange-500 flex-shrink-0 fill-orange-500" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {note.type === "checklist" && note.checklist ? (
            <div className="space-y-1.5">
              {note.checklist
                .slice(0, isPinned ? 8 : 6)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 text-sm ${
                      item.completed
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.completed ? (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                    )}
                    <span
                      className={`truncate ${item.completed ? "line-through" : ""}`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              {note.checklist.length > (isPinned ? 8 : 6) && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 pl-6">
                  +{note.checklist.length - (isPinned ? 8 : 6)} more items
                </p>
              )}
            </div>
          ) : (
            <>
              {note.hasImage && (
                <div className="w-full h-20 mb-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                </div>
              )}
              <p
                className={`text-zinc-600 dark:text-zinc-400 whitespace-pre-line ${
                  isPinned ? "text-sm line-clamp-6" : "text-sm line-clamp-4"
                }`}
              >
                {note.body}
              </p>
            </>
          )}
        </div>

        {/* Progress bar for checklists */}
        {note.type === "checklist" && note.checklist && (
          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>
                {completedCount}/{totalCount} completed
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function V1SmartSizedMasonry() {
  const pinnedNotes = MOCK_NOTES.filter((note) => note.pinned);
  const regularNotes = MOCK_NOTES.filter((note) => !note.pinned);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                  V1: Smart-Sized Masonry
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Recommended approach
                </p>
              </div>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={`/mockups/note-cards/${link.id}`}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    link.current
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Design Specs Card */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50">
          <h2 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">
            Design Specifications
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-orange-700 dark:text-orange-400">
            <div>
              <p className="font-medium mb-1">Height Tiers:</p>
              <ul className="space-y-0.5 text-xs">
                <li>Tiny: 100px (short note, no title)</li>
                <li>Small: 140px (checklist 1-2 items, short note)</li>
                <li>Medium: 200px (checklist 3-5 items, medium note)</li>
                <li>Large: 260px (checklist 6+, long note, has image)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Favorites Treatment:</p>
              <ul className="space-y-0.5 text-xs">
                <li>+40px added to calculated height</li>
                <li>3px orange left border accent</li>
                <li>Larger title (text-base vs text-sm)</li>
                <li>Soft orange shadow glow</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {pinnedNotes.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Favorites
              </h2>
              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                {pinnedNotes.length}
              </span>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard key={note.id} note={note} isPinned />
              ))}
            </div>
          </section>
        )}

        {/* All Notes Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              All Notes
            </h2>
            <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {regularNotes.length}
            </span>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {regularNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Note Cards Mockup - Version 1: Smart-Sized Masonry
            </p>
            <Link
              href="/mockups/note-cards"
              className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              Back to all versions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
