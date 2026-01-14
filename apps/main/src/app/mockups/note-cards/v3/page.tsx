"use client";

import Link from "next/link";
import { Star, Check, Circle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";
import { MOCK_NOTES, COLOR_CLASSES, type MockNote } from "../mock-data";

// Constants
const MAX_CHECKLIST_ITEMS = 15;
const MAX_TEXT_LENGTH = 300;

// Navigation links for version comparison
const NAV_LINKS = [
  { id: "v1", label: "V1: Smart Masonry" },
  { id: "v2", label: "V2: Compact Dense" },
  { id: "v3", label: "V3: Pinterest", active: true },
  { id: "v4", label: "V4: Hero Spotlight" },
  { id: "v5", label: "V5: Google Keep" },
];

// Separate favorites from regular notes
const favoriteNotes = MOCK_NOTES.filter((note) => note.pinned);
const regularNotes = MOCK_NOTES.filter((note) => !note.pinned);

// Truncate text with ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// Pinterest-style card component - content determines height
function NoteCard({ note, isHero = false }: { note: MockNote; isHero?: boolean }) {
  const colors = COLOR_CLASSES[note.color] || COLOR_CLASSES.default;
  const completedCount = note.checklist?.filter((item) => item.completed).length || 0;
  const totalCount = note.checklist?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // For hero cards, show more items
  const maxItems = isHero ? MAX_CHECKLIST_ITEMS : 10;
  const displayedChecklist = note.checklist?.slice(0, maxItems) || [];
  const remainingCount = (note.checklist?.length || 0) - displayedChecklist.length;

  // Truncate body text appropriately
  const displayBody = note.body ? truncateText(note.body, isHero ? MAX_TEXT_LENGTH * 1.5 : MAX_TEXT_LENGTH) : "";

  return (
    <article
      className={clsx(
        // Base styles
        "relative rounded-2xl border cursor-pointer group",
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        colors.bg,
        colors.border,
        // Ensure cards don't break across columns
        "break-inside-avoid",
        // Minimum height to prevent tiny cards
        "min-h-[80px]",
        // Hero cards span 2 columns
        isHero && "sm:col-span-2"
      )}
    >
      {/* Favorite Star Badge */}
      {note.pinned && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            <div
              className={clsx(
                "absolute top-0 right-0 w-10 h-10 rotate-45 translate-x-3 -translate-y-3",
                "bg-amber-400 dark:bg-amber-500"
              )}
            />
            <Star className="absolute top-1 right-1 h-3.5 w-3.5 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Hero accent border for favorites */}
      {isHero && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-400/50 dark:ring-amber-500/40 pointer-events-none" />
      )}

      {/* Image placeholder */}
      {note.hasImage && (
        <div
          className={clsx(
            "w-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center",
            "rounded-t-2xl",
            isHero ? "h-40" : "h-28"
          )}
        >
          <ImageIcon className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}

      {/* Content area - padding based on content type */}
      <div className={clsx("p-4", note.hasImage && "pt-3")}>
        {/* Title */}
        {note.title && (
          <h3
            className={clsx(
              "font-semibold text-zinc-900 dark:text-white tracking-tight",
              isHero ? "text-lg mb-3" : "text-sm mb-2",
              "pr-6" // Space for star badge
            )}
          >
            {note.title}
          </h3>
        )}

        {/* Body text for notes */}
        {note.type === "note" && note.body && (
          <p
            className={clsx(
              "text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap",
              isHero ? "text-sm" : "text-xs"
            )}
          >
            {displayBody}
          </p>
        )}

        {/* Checklist items - show all (up to limit) */}
        {note.type === "checklist" && note.checklist && (
          <div className="space-y-0">
            <ul className={clsx("space-y-1", isHero && "space-y-1.5")}>
              {displayedChecklist.map((item) => (
                <li
                  key={item.id}
                  className={clsx(
                    "flex items-start gap-2",
                    isHero ? "text-sm" : "text-xs",
                    item.completed
                      ? "text-zinc-400 dark:text-zinc-500 line-through"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {item.completed ? (
                    <CheckCircle2
                      className={clsx(
                        "flex-shrink-0 text-emerald-500/60",
                        isHero ? "h-4 w-4 mt-0.5" : "h-3.5 w-3.5 mt-0.5"
                      )}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ) : (
                    <Circle
                      className={clsx(
                        "flex-shrink-0 text-zinc-400 dark:text-zinc-500",
                        isHero ? "h-4 w-4 mt-0.5" : "h-3.5 w-3.5 mt-0.5"
                      )}
                      strokeWidth={2}
                    />
                  )}
                  <span className="leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* Remaining items indicator */}
            {remainingCount > 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 pl-5">
                +{remainingCount} more items
              </p>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
              <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Completion overlay for 100% done checklists */}
      {note.type === "checklist" && totalCount > 0 && completedCount === totalCount && (
        <div className="absolute inset-0 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="h-6 w-6 text-emerald-500" strokeWidth={3} />
          </div>
        </div>
      )}
    </article>
  );
}

export default function V3PinterestMasonry() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/mockups/note-cards"
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm"
              >
                All Versions
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
                V3: Pinterest True Masonry
              </h1>
            </div>
            <nav className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={`/mockups/note-cards/${link.id}`}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    link.active
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <h2 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Pinterest True Masonry
          </h2>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Cards size exactly to their content with no fixed heights. Favorites span 2 columns
            as hero cards with accent styling. Uses CSS columns for organic masonry flow.
            Checklists show all items (up to 15), text shows up to 300 characters.
          </p>
        </div>

        {/* Favorites Section - Hero Cards */}
        {favoriteNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Favorites
            </h2>
            {/* Grid for hero cards - 2 columns on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteNotes.map((note) => (
                <NoteCard key={note.id} note={note} isHero />
              ))}
            </div>
          </section>
        )}

        {/* All Notes - True CSS Columns Masonry */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            All Notes
          </h2>
          {/* CSS Columns for true masonry - organic, content-first */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {regularNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>

        {/* Design Notes */}
        <section className="mt-12 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
            Design Characteristics
          </h3>
          <ul className="grid gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">*</span>
              <span>
                <strong className="text-zinc-900 dark:text-white">No fixed heights</strong> -
                Cards size exactly to their content, creating organic flow
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">*</span>
              <span>
                <strong className="text-zinc-900 dark:text-white">CSS Columns</strong> -
                columns-1/2/3/4 with break-inside-avoid for true masonry
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">*</span>
              <span>
                <strong className="text-zinc-900 dark:text-white">Hero favorites</strong> -
                Pinned notes span 2 columns with accent ring styling
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">*</span>
              <span>
                <strong className="text-zinc-900 dark:text-white">Content-first</strong> -
                Checklists show up to 15 items, text up to 300 chars before truncation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">*</span>
              <span>
                <strong className="text-zinc-900 dark:text-white">min-h-[80px]</strong> -
                Minimum height prevents cards from becoming too tiny
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">*</span>
              <span>
                <strong className="text-zinc-900 dark:text-white">Natural variation</strong> -
                Variable gaps and heights create Pinterest-like organic feel
              </span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
