'use client';

import { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  List,
  LayoutGrid,
  SlidersHorizontal,
  ArrowUpDown,
  CheckSquare,
  Image as ImageIcon,
  Palette,
  Tag,
  BellRing,
  Calendar,
  Calculator,
  Pin,
  User,
  Users,
  Briefcase,
  Plus,
  Archive,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { AinexStudiosLogo } from '@ainexsuite/ui';

interface ThemeLabWorkspaceProps {
  mode: 'light' | 'dark';
}

// Sample note data
const SAMPLE_NOTES = [
  {
    id: '1',
    title: 'Project Kickoff Meeting',
    body: 'Discussed project timeline and deliverables. Key milestones set for Q1. Team assignments completed.',
    color: 'default',
    pinned: true,
    type: 'text',
    labels: [{ id: '1', name: 'Work', color: 'blue' }],
    createdAt: new Date('2024-12-10'),
  },
  {
    id: '2',
    title: 'Shopping List',
    body: '',
    color: 'lemon',
    pinned: false,
    type: 'checklist',
    checklist: [
      { id: '1', text: 'Milk', completed: true },
      { id: '2', text: 'Eggs', completed: true },
      { id: '3', text: 'Bread', completed: false },
      { id: '4', text: 'Coffee', completed: false },
    ],
    labels: [],
    createdAt: new Date('2024-12-11'),
  },
  {
    id: '3',
    title: 'Design System Notes',
    body: 'Zinc-based color system with inverted scales between light and dark modes. Primary buttons use zinc-900 in light mode and zinc-50 in dark mode.',
    color: 'lavender',
    pinned: false,
    type: 'text',
    labels: [{ id: '2', name: 'Design', color: 'purple' }],
    createdAt: new Date('2024-12-12'),
  },
  {
    id: '4',
    title: 'Weekly Goals',
    body: '',
    color: 'mint',
    pinned: false,
    type: 'checklist',
    checklist: [
      { id: '1', text: 'Complete theme documentation', completed: true },
      { id: '2', text: 'Review pull requests', completed: false },
      { id: '3', text: 'Update component library', completed: false },
    ],
    labels: [{ id: '3', name: 'Personal', color: 'green' }],
    createdAt: new Date('2024-12-09'),
  },
  {
    id: '5',
    title: 'API Integration Ideas',
    body: 'Consider using tRPC for type-safe API calls. Look into React Query for caching. Implement optimistic updates for better UX.',
    color: 'sky',
    pinned: false,
    type: 'text',
    labels: [{ id: '1', name: 'Work', color: 'blue' }],
    createdAt: new Date('2024-12-08'),
  },
  {
    id: '6',
    title: 'Quick Reminder',
    body: 'Call dentist to reschedule appointment.',
    color: 'peach',
    pinned: false,
    type: 'text',
    labels: [],
    createdAt: new Date('2024-12-07'),
  },
];

const NOTE_COLORS: Record<string, { bg: string; footer: string; darkBg: string; darkFooter: string }> = {
  default: {
    bg: 'bg-zinc-50',
    footer: 'bg-zinc-100',
    darkBg: 'bg-zinc-900',
    darkFooter: 'bg-zinc-800',
  },
  lemon: {
    bg: 'bg-yellow-50',
    footer: 'bg-yellow-100',
    darkBg: 'bg-yellow-950',
    darkFooter: 'bg-yellow-900',
  },
  peach: {
    bg: 'bg-orange-50',
    footer: 'bg-orange-100',
    darkBg: 'bg-orange-950',
    darkFooter: 'bg-orange-900',
  },
  mint: {
    bg: 'bg-green-50',
    footer: 'bg-green-100',
    darkBg: 'bg-green-950',
    darkFooter: 'bg-green-900',
  },
  lavender: {
    bg: 'bg-purple-50',
    footer: 'bg-purple-100',
    darkBg: 'bg-purple-950',
    darkFooter: 'bg-purple-900',
  },
  sky: {
    bg: 'bg-blue-50',
    footer: 'bg-blue-100',
    darkBg: 'bg-blue-950',
    darkFooter: 'bg-blue-900',
  },
  blush: {
    bg: 'bg-pink-50',
    footer: 'bg-pink-100',
    darkBg: 'bg-pink-950',
    darkFooter: 'bg-pink-900',
  },
};

const LABEL_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
};

export function ThemeLabWorkspace({ mode }: ThemeLabWorkspaceProps) {
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [spaceDropdownOpen, setSpaceDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'masonry' | 'calendar'>('masonry');

  const isDark = mode === 'dark';

  return (
    <div className={clsx('min-h-full', isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-100 text-zinc-900')}>
      {/* ============================================ */}
      {/* TOP NAVIGATION BAR */}
      {/* ============================================ */}
      <header
        className={clsx(
          'sticky top-0 z-40 h-16 border-b backdrop-blur-xl',
          isDark
            ? 'bg-zinc-900/95 border-zinc-800'
            : 'bg-zinc-50/95 border-zinc-200'
        )}
      >
        <div className="max-w-6xl mx-auto h-full flex items-center px-4 gap-3">
          {/* Hamburger */}
          <button
            className={clsx(
              'h-10 w-10 rounded-full flex items-center justify-center transition',
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            )}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Admin Logo */}
          <div className="hidden sm:block scale-50 origin-left -my-4">
            <AinexStudiosLogo
              size="sm"
              appName="ADMIN"
              appColor={isDark ? '#a1a1aa' : '#71717a'}
              asLink={false}
              align="center"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <button
            className={clsx(
              'h-9 w-9 rounded-full flex items-center justify-center transition',
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700'
            )}
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            className={clsx(
              'h-9 w-9 rounded-full flex items-center justify-center transition',
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700'
            )}
          >
            <Sparkles className="h-4 w-4" />
          </button>

          <button
            className={clsx(
              'h-9 w-9 rounded-full flex items-center justify-center transition relative',
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700'
            )}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <button
            className={clsx(
              'h-9 rounded-full flex items-center gap-2 px-2 transition',
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700'
                : 'bg-zinc-100 hover:bg-zinc-200'
            )}
          >
            <span className="h-7 w-7 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold">
              JD
            </span>
            <ChevronDown className={clsx('h-3.5 w-3.5', isDark ? 'text-zinc-400' : 'text-zinc-500')} />
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* LOGO SHOWCASE SECTION */}
      {/* ============================================ */}
      <section className={clsx('border-b py-8', isDark ? 'border-zinc-800' : 'border-zinc-200')}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={clsx('text-sm font-medium mb-6 uppercase tracking-wider', isDark ? 'text-zinc-500' : 'text-zinc-400')}>
            Admin Logo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Admin Logo - XL */}
            <div className={clsx('p-6 rounded-2xl border flex items-center justify-center', isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200')}>
              <p className={clsx('text-xs font-medium mb-4 uppercase tracking-wider absolute top-4 left-4', isDark ? 'text-zinc-600' : 'text-zinc-400')}>
                XL
              </p>
              <AinexStudiosLogo
                size="xl"
                appName="ADMIN"
                appColor={isDark ? '#a1a1aa' : '#71717a'}
                asLink={false}
                align="center"
              />
            </div>

            {/* Admin Logo - Large */}
            <div className={clsx('p-6 rounded-2xl border flex items-center justify-center', isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200')}>
              <p className={clsx('text-xs font-medium mb-4 uppercase tracking-wider absolute top-4 left-4', isDark ? 'text-zinc-600' : 'text-zinc-400')}>
                LG
              </p>
              <AinexStudiosLogo
                size="lg"
                appName="ADMIN"
                appColor={isDark ? '#a1a1aa' : '#71717a'}
                asLink={false}
                align="center"
              />
            </div>

            {/* Admin Logo - Medium */}
            <div className={clsx('p-6 rounded-2xl border flex items-center justify-center', isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200')}>
              <p className={clsx('text-xs font-medium mb-4 uppercase tracking-wider absolute top-4 left-4', isDark ? 'text-zinc-600' : 'text-zinc-400')}>
                MD
              </p>
              <AinexStudiosLogo
                size="md"
                appName="ADMIN"
                appColor={isDark ? '#a1a1aa' : '#71717a'}
                asLink={false}
                align="center"
              />
            </div>

            {/* Admin Logo - Small */}
            <div className={clsx('p-6 rounded-2xl border flex items-center justify-center', isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200')}>
              <p className={clsx('text-xs font-medium mb-4 uppercase tracking-wider absolute top-4 left-4', isDark ? 'text-zinc-600' : 'text-zinc-400')}>
                SM
              </p>
              <AinexStudiosLogo
                size="sm"
                appName="ADMIN"
                appColor={isDark ? '#a1a1aa' : '#71717a'}
                asLink={false}
                align="center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================ */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* ============================================ */}
        {/* COMPOSER ROW */}
        {/* ============================================ */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Note Composer */}
          <div className="flex-1 min-w-0">
            {!composerExpanded ? (
              <button
                onClick={() => setComposerExpanded(true)}
                className={clsx(
                  'w-full text-left px-5 py-4 rounded-2xl border transition',
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:border-zinc-700'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:border-zinc-300'
                )}
              >
                Take a note...
              </button>
            ) : (
              <div
                className={clsx(
                  'rounded-2xl border shadow-lg',
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                )}
              >
                <div className="p-5 space-y-3">
                  {/* Title */}
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      placeholder="Title"
                      className={clsx(
                        'flex-1 bg-transparent text-lg font-semibold focus:outline-none',
                        isDark
                          ? 'text-zinc-50 placeholder:text-zinc-600'
                          : 'text-zinc-900 placeholder:text-zinc-400'
                      )}
                    />
                    <button
                      className={clsx(
                        'p-2 rounded-full transition',
                        isDark
                          ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                          : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                      )}
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Body */}
                  <textarea
                    placeholder="What's on your mind?..."
                    rows={4}
                    className={clsx(
                      'w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed',
                      isDark
                        ? 'text-zinc-300 placeholder:text-zinc-600'
                        : 'text-zinc-700 placeholder:text-zinc-400'
                    )}
                  />

                  {/* Toolbar */}
                  <div
                    className={clsx(
                      'flex items-center justify-between gap-2 pt-3 border-t',
                      isDark ? 'border-zinc-800' : 'border-zinc-200'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {[CheckSquare, ImageIcon, Palette, Tag, BellRing, Calendar, Calculator].map(
                        (Icon, i) => (
                          <button
                            key={i}
                            className={clsx(
                              'p-2 rounded-full transition',
                              isDark
                                ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setComposerExpanded(false)}
                        className={clsx(
                          'text-sm font-medium transition',
                          isDark
                            ? 'text-zinc-500 hover:text-zinc-300'
                            : 'text-zinc-500 hover:text-zinc-700'
                        )}
                      >
                        Close
                      </button>
                      <button
                        className="px-5 py-2 rounded-full bg-yellow-500 text-white text-sm font-semibold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Space Switcher */}
          <div className="flex-shrink-0 md:w-[220px] relative">
            <button
              onClick={() => setSpaceDropdownOpen(!spaceDropdownOpen)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition',
                isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
              )}
            >
              <div className="h-8 w-8 rounded-md bg-yellow-500 flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={clsx('text-sm font-medium truncate', isDark ? 'text-zinc-50' : 'text-zinc-900')}>
                  Personal Notes
                </p>
                <p className={clsx('text-xs truncate', isDark ? 'text-zinc-500' : 'text-zinc-500')}>
                  Personal
                </p>
              </div>
              <ChevronDown
                className={clsx(
                  'h-4 w-4 transition',
                  isDark ? 'text-zinc-500' : 'text-zinc-400',
                  spaceDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown */}
            {spaceDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSpaceDropdownOpen(false)} />
                <div
                  className={clsx(
                    'absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl z-20 overflow-hidden',
                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  )}
                >
                  <div className="p-1">
                    <div
                      className={clsx(
                        'px-2 py-1.5 text-xs font-medium uppercase',
                        isDark ? 'text-zinc-500' : 'text-zinc-400'
                      )}
                    >
                      Spaces
                    </div>
                    {[
                      { name: 'Personal Notes', type: 'personal', icon: User, active: true },
                      { name: 'Work Projects', type: 'work', icon: Briefcase, active: false },
                      { name: 'Family', type: 'family', icon: Users, active: false },
                    ].map((space) => (
                      <button
                        key={space.name}
                        onClick={() => setSpaceDropdownOpen(false)}
                        className={clsx(
                          'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition',
                          space.active
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : isDark
                            ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                        )}
                      >
                        <space.icon className="h-4 w-4" />
                        <span className="truncate">{space.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className={clsx('border-t p-1', isDark ? 'border-zinc-800' : 'border-zinc-200')}>
                    <button
                      className={clsx(
                        'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition',
                        'text-yellow-600 hover:bg-zinc-100',
                        isDark && 'hover:bg-zinc-800'
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Create New Space
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* TOOLBAR - Matching Pill Style */}
        {/* ============================================ */}
        <div className="flex w-full items-center justify-center gap-2 mb-6">
          {/* Filter & Sort Group */}
          <div
            className={clsx(
              'inline-flex items-center gap-1 rounded-full p-1 shadow-sm border',
              isDark
                ? 'bg-white/5 backdrop-blur-sm border-white/10'
                : 'bg-zinc-900/5 backdrop-blur-sm border-zinc-900/10'
            )}
          >
            <button
              className={clsx(
                'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
                isDark
                  ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  : 'text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-900'
              )}
              aria-label="Search"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              className={clsx(
                'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
                isDark
                  ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  : 'text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-900'
              )}
              aria-label="Filter"
              title="Filter"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              className={clsx(
                'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
                isDark
                  ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  : 'text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-900'
              )}
              aria-label="Sort"
              title="Sort by date created"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* View Toggle Group */}
          <div
            className={clsx(
              'inline-flex items-center gap-1 rounded-full p-1 shadow-sm border',
              isDark
                ? 'bg-white/5 backdrop-blur-sm border-white/10'
                : 'bg-zinc-900/5 backdrop-blur-sm border-zinc-900/10'
            )}
          >
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
                viewMode === 'list'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : isDark
                    ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                    : 'text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-900'
              )}
              aria-label="List view"
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={clsx(
                'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
                viewMode === 'masonry'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : isDark
                    ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                    : 'text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-900'
              )}
              aria-label="Masonry view"
              title="Masonry view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={clsx(
                'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
                viewMode === 'calendar'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : isDark
                    ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                    : 'text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-900'
              )}
              aria-label="Calendar view"
              title="Calendar view"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* PINNED SECTION */}
        {/* ============================================ */}
        <div className="mb-8">
          <h2
            className={clsx(
              'text-xs font-semibold uppercase tracking-wide mb-3',
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            )}
          >
            Pinned
          </h2>
          <div className={viewMode === 'masonry' ? 'columns-1 sm:columns-2 gap-4' : 'space-y-2'}>
            {SAMPLE_NOTES.filter((n) => n.pinned).map((note) => (
              <NoteCard key={note.id} note={note} isDark={isDark} viewMode={viewMode} />
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* ALL NOTES SECTION */}
        {/* ============================================ */}
        <div>
          <h2
            className={clsx(
              'text-xs font-semibold uppercase tracking-wide mb-3',
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            )}
          >
            All Notes
          </h2>
          <div className={viewMode === 'masonry' ? 'columns-1 sm:columns-2 gap-4' : 'space-y-2'}>
            {SAMPLE_NOTES.filter((n) => !n.pinned).map((note) => (
              <NoteCard key={note.id} note={note} isDark={isDark} viewMode={viewMode} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================
// NOTE CARD COMPONENT
// ============================================
interface NoteCardProps {
  note: (typeof SAMPLE_NOTES)[0];
  isDark: boolean;
  viewMode: 'list' | 'masonry' | 'calendar';
}

function NoteCard({ note, isDark, viewMode }: NoteCardProps) {
  const colors = NOTE_COLORS[note.color] || NOTE_COLORS.default;

  return (
    <article
      className={clsx(
        'group relative rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden',
        viewMode === 'masonry' ? 'break-inside-avoid mb-4' : '',
        isDark
          ? `${colors.darkBg} border-zinc-800 hover:border-zinc-700`
          : `${colors.bg} border-zinc-200 hover:border-zinc-300 hover:shadow-md`
      )}
    >
      {/* Pin Badge */}
      {note.pinned && (
        <div className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-10">
          <div className="absolute top-0 right-0 bg-amber-500 w-14 h-14 rotate-45 translate-x-7 -translate-y-7" />
          <Pin className="absolute top-1.5 right-1.5 h-3 w-3 text-white" />
        </div>
      )}

      <div className="p-5">
        {/* Title */}
        {note.title && (
          <h3
            className={clsx(
              'font-semibold pr-8',
              isDark ? 'text-zinc-50' : 'text-zinc-900'
            )}
          >
            {note.title}
          </h3>
        )}

        {/* Content */}
        {note.type === 'checklist' && note.checklist ? (
          <ul className="mt-3 space-y-2">
            {note.checklist.map((item) => (
              <li
                key={item.id}
                className={clsx(
                  'flex items-start gap-2 text-sm',
                  item.completed
                    ? isDark
                      ? 'text-zinc-600 line-through'
                      : 'text-zinc-400 line-through'
                    : isDark
                    ? 'text-zinc-300'
                    : 'text-zinc-700'
                )}
              >
                <span
                  className={clsx(
                    'mt-1.5 h-2 w-2 rounded-full flex-shrink-0',
                    item.completed
                      ? isDark
                        ? 'bg-zinc-700'
                        : 'bg-zinc-300'
                      : 'bg-yellow-500'
                  )}
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ) : note.body ? (
          <p
            className={clsx(
              'mt-3 text-sm leading-relaxed',
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            )}
          >
            {note.body}
          </p>
        ) : null}

        {/* Labels */}
        {note.labels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.labels.map((label) => (
              <span
                key={label.id}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                  isDark
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-zinc-100 text-zinc-700'
                )}
              >
                <span className={clsx('h-2 w-2 rounded-full', LABEL_COLORS[label.color])} />
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className={clsx(
          'flex items-center justify-between px-5 py-3 border-t',
          isDark
            ? `${colors.darkFooter} border-zinc-800`
            : `${colors.footer} border-zinc-200`
        )}
      >
        <span
          className={clsx(
            'text-[11px] uppercase tracking-wide',
            isDark ? 'text-zinc-500' : 'text-zinc-400'
          )}
        >
          {note.createdAt.toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className={clsx(
              'h-7 w-7 rounded-full flex items-center justify-center transition',
              isDark
                ? 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600'
            )}
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
          <button
            className={clsx(
              'h-7 w-7 rounded-full flex items-center justify-center transition',
              isDark
                ? 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600'
            )}
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
          <button
            className={clsx(
              'h-7 w-7 rounded-full flex items-center justify-center transition',
              'text-red-400 hover:bg-red-500/20 hover:text-red-500'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </article>
  );
}
