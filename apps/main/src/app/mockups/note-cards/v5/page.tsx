"use client";

import Link from "next/link";
import { Star, Check, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_NOTES, COLOR_CLASSES, getContentSize, type MockNote } from "../mock-data";

// Left border accent colors for Google Keep style
const ACCENT_COLORS: Record<string, string> = {
  default: "border-l-zinc-400 dark:border-l-zinc-500",
  "note-sky": "border-l-blue-400 dark:border-l-blue-500",
  "note-mint": "border-l-green-400 dark:border-l-green-500",
  "note-lemon": "border-l-yellow-400 dark:border-l-yellow-500",
  "note-peach": "border-l-orange-400 dark:border-l-orange-500",
  "note-lavender": "border-l-purple-400 dark:border-l-purple-500",
  "note-blush": "border-l-pink-400 dark:border-l-pink-500",
  "note-fog": "border-l-slate-400 dark:border-l-slate-500",
  "note-coal": "border-l-zinc-600 dark:border-l-zinc-400",
  "note-moss": "border-l-emerald-400 dark:border-l-emerald-500",
  "note-tangerine": "border-l-amber-400 dark:border-l-amber-500",
};

// Size calculation: Small (120px), Medium (180px), Large (240px)
function getCardSize(note: MockNote): { height: number; sizeLabel: string } {
  const contentSize = getContentSize(note);

  // Base size by content
  let height: number;
  let sizeLabel: string;

  if (note.hasImage) {
    // Notes with images are always large
    height = 240;
    sizeLabel = "L";
  } else if (note.type === "checklist") {
    const count = note.checklist?.length || 0;
    if (count <= 3) {
      height = 120;
      sizeLabel = "S";
    } else if (count <= 6) {
      height = 180;
      sizeLabel = "M";
    } else {
      height = 240;
      sizeLabel = "L";
    }
  } else {
    // Regular notes based on content size
    switch (contentSize) {
      case "tiny":
      case "small":
        height = 120;
        sizeLabel = "S";
        break;
      case "medium":
        height = 180;
        sizeLabel = "M";
        break;
      case "large":
        height = 240;
        sizeLabel = "L";
        break;
      default:
        height = 180;
        sizeLabel = "M";
    }
  }

  return { height, sizeLabel };
}

function NoteCard({ note }: { note: MockNote }) {
  const colorClasses = COLOR_CLASSES[note.color] || COLOR_CLASSES.default;
  const accentColor = ACCENT_COLORS[note.color] || ACCENT_COLORS.default;
  const { height, sizeLabel } = getCardSize(note);

  // Favorites get +20% larger
  const finalHeight = note.pinned ? Math.round(height * 1.2) : height;
  const borderWidth = note.pinned ? "border-l-[6px]" : "border-l-4";

  // Favorite background tint
  const favoriteTint = note.pinned
    ? "ring-2 ring-amber-200/50 dark:ring-amber-500/30"
    : "";

  return (
    <div
      className={`
        relative group break-inside-avoid mb-4
        rounded-xl ${colorClasses.bg} ${borderWidth} ${accentColor}
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        ${favoriteTint}
        overflow-hidden
      `}
      style={{ minHeight: finalHeight }}
    >
      {/* Favorite star icon */}
      {note.pinned && (
        <div className="absolute top-2 right-2 z-10">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        </div>
      )}

      {/* Image placeholder for notes with images */}
      {note.hasImage && (
        <div className="w-full h-24 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {note.title && (
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2 pr-6">
            {note.title}
          </h3>
        )}

        {note.type === "checklist" && note.checklist ? (
          <ul className="space-y-1.5">
            {note.checklist.slice(0, note.pinned ? 10 : 8).map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <div className={`
                  flex-shrink-0 w-4 h-4 mt-0.5 rounded border-2
                  flex items-center justify-center
                  ${item.completed
                    ? "bg-green-500 border-green-500"
                    : "border-zinc-300 dark:border-zinc-600"
                  }
                `}>
                  {item.completed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`
                  ${item.completed
                    ? "text-zinc-400 dark:text-zinc-500 line-through"
                    : "text-zinc-700 dark:text-zinc-300"
                  }
                `}>
                  {item.text}
                </span>
              </li>
            ))}
            {note.checklist.length > (note.pinned ? 10 : 8) && (
              <li className="text-xs text-zinc-400 dark:text-zinc-500 pl-6">
                +{note.checklist.length - (note.pinned ? 10 : 8)} more items
              </li>
            )}
          </ul>
        ) : (
          note.body && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line line-clamp-6">
              {note.body}
            </p>
          )
        )}
      </div>

      {/* Size indicator badge */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded">
          {sizeLabel} {finalHeight}px
        </span>
      </div>
    </div>
  );
}

export default function V5GoogleKeepStyle() {
  const favorites = MOCK_NOTES.filter((note) => note.pinned);
  const others = MOCK_NOTES.filter((note) => !note.pinned);

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-zinc-950 transition-colors">
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                V5: Google Keep Style
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Familiar and friendly with colored accent borders
              </p>
            </div>
            <nav className="flex items-center gap-2">
              <Link
                href="/mockups/note-cards/v4"
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                V4
              </Link>
              <Link
                href="/mockups/note-cards"
                className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Index
              </Link>
              <Link
                href="/mockups/note-cards/v1"
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                V1
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Design specs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Design Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Card Sizes</h3>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="w-8 h-4 bg-green-100 dark:bg-green-900/30 rounded text-[10px] flex items-center justify-center text-green-600 dark:text-green-400 font-medium">S</span>
                  120px - Short notes, 1-3 items
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-8 h-4 bg-blue-100 dark:bg-blue-900/30 rounded text-[10px] flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">M</span>
                  180px - Standard, 4-6 items
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-8 h-4 bg-purple-100 dark:bg-purple-900/30 rounded text-[10px] flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium">L</span>
                  240px - Long, 7+ items, images
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Favorites Treatment</h3>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>+20% larger than calculated</li>
                <li>6px thick accent border (vs 4px)</li>
                <li>Subtle amber ring highlight</li>
                <li>Star icon in top-right corner</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Style Elements</h3>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Colored left border accent</li>
                <li>Smooth rounded corners (12px)</li>
                <li>Soft shadows on hover</li>
                <li>Warm, inviting background</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Favorites
            </h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              ({favorites.length})
            </span>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {favorites.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}

      {/* All Notes Section */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            All Notes
          </h2>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            ({others.length})
          </span>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {others.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            V5: Google Keep Style - Familiar colored borders with warm, friendly aesthetic.
            Smooth 3-tier sizing with generous favorites treatment.
          </p>
        </div>
      </footer>
    </div>
  );
}
