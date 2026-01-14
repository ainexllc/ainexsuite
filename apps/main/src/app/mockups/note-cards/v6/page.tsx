"use client";

import { MOCK_NOTES, COLOR_CLASSES, getContentSize, type MockNote } from "../mock-data";
import { Pin, Check, Circle, CheckCircle2, Image, ChevronLeft } from "lucide-react";
import Link from "next/link";

// Height mapping based on content size (from V1 Smart-Sized)
const HEIGHT_MAP = {
  tiny: "h-[100px]",
  small: "h-[140px]",
  medium: "h-[200px]",
  large: "h-[260px]",
};

// Favorites get +40px
const FAVORITE_HEIGHT_MAP = {
  tiny: "h-[140px]",
  small: "h-[180px]",
  medium: "h-[240px]",
  large: "h-[300px]",
};

// Max checklist items based on size
const MAX_ITEMS_MAP = {
  tiny: 2,
  small: 3,
  medium: 5,
  large: 8,
};

function NoteCard({ note, isFavorite }: { note: MockNote; isFavorite: boolean }) {
  const size = getContentSize(note);
  const heightClass = isFavorite ? FAVORITE_HEIGHT_MAP[size] : HEIGHT_MAP[size];
  const maxItems = isFavorite ? MAX_ITEMS_MAP[size] + 2 : MAX_ITEMS_MAP[size];
  const colorClasses = COLOR_CLASSES[note.color] || COLOR_CLASSES.default;

  const completedCount = note.checklist?.filter((i) => i.completed).length || 0;
  const totalCount = note.checklist?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = totalCount > 0 && completedCount === totalCount;

  // For notes with images, we need extra height for the image header
  const hasImageHeader = note.hasImage;

  return (
    <article
      className={`
        relative rounded-2xl border overflow-hidden
        break-inside-avoid mb-4
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-0.5
        ${colorClasses.bg} ${colorClasses.border}
        ${!hasImageHeader ? heightClass : ""}
        ${isFavorite ? "border-l-[3px] border-l-orange-500 shadow-lg shadow-orange-500/10" : ""}
      `}
    >
      {/* Image Header (from V3 Pinterest) - shown when note has image */}
      {hasImageHeader && (
        <div className="w-full h-32 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="w-8 h-8 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          </div>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-2 w-16 h-16 rounded-full bg-white dark:bg-black" />
            <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-white dark:bg-black" />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className={`p-4 flex flex-col ${hasImageHeader ? "h-[140px]" : "h-full"}`}>
        {/* Favorite pin badge */}
        {isFavorite && (
          <div className="absolute top-2 right-2 z-10">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-sm">
              <Pin className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Completion overlay */}
        {isComplete && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 backdrop-blur-[2px] pointer-events-none">
            <Check className="h-10 w-10 text-zinc-300/60 dark:text-zinc-600/40" strokeWidth={2} />
          </div>
        )}

        {/* Title */}
        {note.title && (
          <h3 className={`font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-1 pr-8 ${isFavorite ? "text-base" : "text-sm"}`}>
            {note.title}
          </h3>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {note.type === "checklist" && note.checklist ? (
            <div className="flex flex-col gap-1">
              {/* Compact Progress Bar at TOP (from V2) */}
              {totalCount > 0 && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="flex-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {completedCount}/{totalCount}
                  </span>
                </div>
              )}
              {/* Checklist items */}
              <ul className="space-y-1">
                {note.checklist.slice(0, maxItems).map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 text-xs ${
                      item.completed
                        ? "text-zinc-400 dark:text-zinc-500 line-through"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                    )}
                    <span className="line-clamp-1">{item.text}</span>
                  </li>
                ))}
                {note.checklist.length > maxItems && (
                  <li className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-5">
                    +{note.checklist.length - maxItems} more
                  </li>
                )}
              </ul>
            </div>
          ) : note.body ? (
            <p className={`text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap ${
              size === "tiny" ? "line-clamp-2" : size === "small" ? "line-clamp-3" : "line-clamp-5"
            }`}>
              {note.body}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function V6MashupMockup() {
  const favorites = MOCK_NOTES.filter((n) => n.pinned);
  const regularNotes = MOCK_NOTES.filter((n) => !n.pinned);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/mockups/note-cards"
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  V6: Best Of Mashup
                </h1>
                <p className="text-xs text-zinc-500">
                  Smart sizing + Compact progress + Image headers + Hero divider
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              {["v1", "v2", "v3", "v4", "v5", "v6"].map((v) => (
                <Link
                  key={v}
                  href={`/mockups/note-cards/${v}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    v === "v6"
                      ? "bg-orange-500 text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {v.toUpperCase()}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Favorites Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Pin className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Favorites
            </h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {favorites.length}
            </span>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {favorites.map((note) => (
              <NoteCard key={note.id} note={note} isFavorite={true} />
            ))}
          </div>
        </section>

        {/* Horizontal Divider (from V4 Hero Spotlight) */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 py-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-950">
              All Notes
            </span>
          </div>
        </div>

        {/* All Notes Section - True Masonry (from V1/V3) */}
        <section>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {regularNotes.map((note) => (
              <NoteCard key={note.id} note={note} isFavorite={false} />
            ))}
          </div>
        </section>

        {/* Design Specs */}
        <section className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50">
          <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-3">
            Combined Design Specs
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-orange-800 dark:text-orange-200">
            <div>
              <h4 className="font-semibold mb-1">From V1: Smart Sizing</h4>
              <ul className="space-y-0.5 text-orange-700 dark:text-orange-300">
                <li>• Tiny: 100px</li>
                <li>• Small: 140px</li>
                <li>• Medium: 200px</li>
                <li>• Large: 260px</li>
                <li>• Favorites: +40px</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">From V2: Compact Progress</h4>
              <ul className="space-y-0.5 text-orange-700 dark:text-orange-300">
                <li>• Thin 1px progress bar</li>
                <li>• At TOP of checklist</li>
                <li>• Inline count display</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">From V3: Image Headers</h4>
              <ul className="space-y-0.5 text-orange-700 dark:text-orange-300">
                <li>• 128px image header</li>
                <li>• Shown when hasImage</li>
                <li>• Card height adjusts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">From V4: Hero Divider</h4>
              <ul className="space-y-0.5 text-orange-700 dark:text-orange-300">
                <li>• Horizontal line separator</li>
                <li>• &quot;All Notes&quot; label</li>
                <li>• Clear hierarchy</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
