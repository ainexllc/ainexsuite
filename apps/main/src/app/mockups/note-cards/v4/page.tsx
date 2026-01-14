"use client";

import Link from "next/link";
import { Star, Check, ImageIcon, Pin } from "lucide-react";
import { MOCK_NOTES, COLOR_CLASSES, type MockNote } from "../mock-data";

// Navigation links for all versions
const NAV_LINKS = [
  { id: "v1", name: "V1" },
  { id: "v2", name: "V2" },
  { id: "v3", name: "V3" },
  { id: "v4", name: "V4" },
  { id: "v5", name: "V5" },
];

// Hero card component for favorites - 320px tall
function HeroCard({ note }: { note: MockNote }) {
  const colorClasses = COLOR_CLASSES[note.color] || COLOR_CLASSES.default;

  return (
    <article
      className={`
        relative h-[320px] rounded-2xl border-2 overflow-hidden
        ${colorClasses.bg} ${colorClasses.border}
        ring-4 ring-yellow-400/30 dark:ring-yellow-500/20
        shadow-xl shadow-yellow-500/10 dark:shadow-yellow-500/5
        hover:ring-yellow-400/50 dark:hover:ring-yellow-500/40
        hover:shadow-2xl hover:shadow-yellow-500/20
        transition-all duration-300 cursor-pointer
        group
      `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Star badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 dark:bg-yellow-500 shadow-lg shadow-yellow-500/40">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col">
        {/* Title */}
        {note.title && (
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 pr-12 leading-tight">
            {note.title}
          </h3>
        )}

        {/* Body or Checklist */}
        <div className="flex-1 overflow-hidden">
          {note.type === "checklist" && note.checklist ? (
            <ul className="space-y-2">
              {note.checklist.slice(0, 10).map((item) => (
                <li key={item.id} className="flex items-start gap-3 group/item">
                  <span
                    className={`
                      flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5
                      ${
                        item.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }
                    `}
                  >
                    {item.completed && <Check className="w-3 h-3" />}
                  </span>
                  <span
                    className={`
                      text-sm leading-relaxed
                      ${
                        item.completed
                          ? "text-zinc-400 dark:text-zinc-500 line-through"
                          : "text-zinc-700 dark:text-zinc-200"
                      }
                    `}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
              {note.checklist.length > 10 && (
                <li className="text-sm text-zinc-400 dark:text-zinc-500 pl-8">
                  +{note.checklist.length - 10} more items...
                </li>
              )}
            </ul>
          ) : note.body ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed line-clamp-[12]">
              {note.body}
            </p>
          ) : null}
        </div>

        {/* Image indicator if present */}
        {note.hasImage && (
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900/10 dark:bg-white/10">
              <ImageIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 via-transparent to-transparent" />
      </div>
    </article>
  );
}

// Standard card component - 180px tall
function StandardCard({ note }: { note: MockNote }) {
  const colorClasses = COLOR_CLASSES[note.color] || COLOR_CLASSES.default;

  return (
    <article
      className={`
        h-[180px] rounded-xl border overflow-hidden
        ${colorClasses.bg} ${colorClasses.border}
        hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600
        transition-all duration-200 cursor-pointer
        group
      `}
    >
      <div className="h-full p-4 flex flex-col">
        {/* Title */}
        {note.title && (
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 truncate text-sm">
            {note.title}
          </h3>
        )}

        {/* Body or Checklist */}
        <div className="flex-1 overflow-hidden">
          {note.type === "checklist" && note.checklist ? (
            <ul className="space-y-1.5">
              {note.checklist.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span
                    className={`
                      flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center mt-0.5
                      ${
                        item.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }
                    `}
                  >
                    {item.completed && <Check className="w-2.5 h-2.5" />}
                  </span>
                  <span
                    className={`
                      text-xs leading-relaxed truncate
                      ${
                        item.completed
                          ? "text-zinc-400 dark:text-zinc-500 line-through"
                          : "text-zinc-600 dark:text-zinc-300"
                      }
                    `}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
              {note.checklist.length > 5 && (
                <li className="text-xs text-zinc-400 dark:text-zinc-500 pl-6">
                  +{note.checklist.length - 5} more
                </li>
              )}
            </ul>
          ) : note.body ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed line-clamp-5">
              {note.body}
            </p>
          ) : null}
        </div>

        {/* Image indicator if present */}
        {note.hasImage && (
          <div className="mt-2 flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="text-xs">Image</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function V4HeroSpotlight() {
  // Separate favorites (pinned) from regular notes
  const favorites = MOCK_NOTES.filter((note) => note.pinned);
  const regularNotes = MOCK_NOTES.filter((note) => !note.pinned);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/mockups/note-cards"
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                All Versions
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <h1 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                V4: Hero Spotlight
              </h1>
            </div>

            <nav className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={`/mockups/note-cards/${link.id}`}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      link.id === "v4"
                        ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Favorites Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Favorites
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your starred notes - front and center
              </p>
            </div>
          </div>

          {/* Hero grid - 2 columns on large screens for big impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((note) => (
              <HeroCard key={note.id} note={note} />
            ))}
          </div>
        </section>

        {/* Divider with visual separation */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-400 dark:text-zinc-600">
              All Notes
            </span>
          </div>
        </div>

        {/* All Notes Section - Standard cards */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800">
              <Pin className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              All Notes
            </h2>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {regularNotes.length} notes
            </span>
          </div>

          {/* Standard grid - 4 columns, compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {regularNotes.map((note) => (
              <StandardCard key={note.id} note={note} />
            ))}
          </div>
        </section>

        {/* Design specs footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            V4 Design Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h4 className="font-medium text-zinc-900 dark:text-white mb-2">
                Hero Favorites
              </h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Height: 320px (hero size)</li>
                <li>2-column grid layout</li>
                <li>Yellow ring glow effect</li>
                <li>Large title (text-lg)</li>
                <li>Shows 8-10 checklist items</li>
                <li>Star badge in corner</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h4 className="font-medium text-zinc-900 dark:text-white mb-2">
                Standard Cards
              </h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Height: 180px (fixed)</li>
                <li>4-column grid on large screens</li>
                <li>Simple border treatment</li>
                <li>Compact title (text-sm)</li>
                <li>Shows 4-5 checklist items</li>
                <li>Subtle hover shadow</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h4 className="font-medium text-zinc-900 dark:text-white mb-2">
                Visual Hierarchy
              </h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Clear section separation</li>
                <li>Favorites section prominence</li>
                <li>Standard section is secondary</li>
                <li>Favorites: 320px vs 180px ratio</li>
                <li>Golden accent for favorites</li>
                <li>Muted treatment for regulars</li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
