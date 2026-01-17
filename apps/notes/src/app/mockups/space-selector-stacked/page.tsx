"use client";

import { useState } from "react";
import {
  User,
  Heart,
  Users,
  Briefcase,
  UserPlus,
  Users2,
  FolderKanban,
  Moon,
  Sun,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Space type configuration
const SPACE_COLORS = {
  personal: { bg: "#3b82f6", text: "#ffffff" },
  couple: { bg: "#ec4899", text: "#ffffff" },
  family: { bg: "#8b5cf6", text: "#ffffff" },
  work: { bg: "#f97316", text: "#ffffff" },
  buddy: { bg: "#10b981", text: "#ffffff" },
  squad: { bg: "#06b6d4", text: "#ffffff" },
  project: { bg: "#6366f1", text: "#ffffff" },
};

const SPACE_ICONS: Record<string, LucideIcon> = {
  personal: User,
  couple: Heart,
  family: Users,
  work: Briefcase,
  buddy: UserPlus,
  squad: Users2,
  project: FolderKanban,
};

type SpaceType = keyof typeof SPACE_COLORS;

interface Space {
  id: string;
  name: string;
  type: SpaceType;
  noteCount: number;
  members?: number;
}

const mockSpaces: Space[] = [
  { id: "personal", name: "My Notes", type: "personal", noteCount: 12 },
  { id: "couple-1", name: "Couple", type: "couple", noteCount: 8, members: 2 },
  { id: "family-1", name: "Family", type: "family", noteCount: 5, members: 4 },
  { id: "work-1", name: "Work Team", type: "work", noteCount: 23, members: 6 },
];

function StackedHeaderPills({
  spaces,
  currentSpaceId,
  onSpaceChange,
  isDark,
  size = "default",
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  isDark: boolean;
  size?: "default" | "large" | "compact";
}) {
  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  const colors = SPACE_COLORS[currentSpace.type];

  const sizeConfig = {
    default: {
      header: "text-2xl",
      subtext: "text-sm",
      pill: "px-3 py-1.5 text-sm",
      icon: "w-5 h-5",
      iconInner: "w-3 h-3",
    },
    large: {
      header: "text-3xl",
      subtext: "text-base",
      pill: "px-4 py-2 text-base",
      icon: "w-6 h-6",
      iconInner: "w-3.5 h-3.5",
    },
    compact: {
      header: "text-xl",
      subtext: "text-xs",
      pill: "px-2.5 py-1 text-xs",
      icon: "w-4 h-4",
      iconInner: "w-2.5 h-2.5",
    },
  };

  const s = sizeConfig[size];

  return (
    <div className="space-y-4">
      {/* Stacked: Pills first */}
      <div className="flex items-center gap-1 flex-wrap">
        {spaces.map((space) => {
          const Icon = SPACE_ICONS[space.type];
          const spaceColors = SPACE_COLORS[space.type];
          const isActive = space.id === currentSpaceId;

          return (
            <button
              key={space.id}
              onClick={() => onSpaceChange(space.id)}
              className={`
                flex items-center gap-1.5 ${s.pill} rounded-full font-medium
                transition-all duration-200
              `}
              style={{
                backgroundColor: isActive ? spaceColors.bg : "transparent",
                color: isActive ? spaceColors.text : isDark ? "#a1a1aa" : "#71717a",
                boxShadow: isActive ? `0 2px 8px ${spaceColors.bg}40` : undefined,
              }}
            >
              <div
                className={`${s.icon} rounded-full flex items-center justify-center`}
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : spaceColors.bg,
                }}
              >
                <Icon className={`${s.iconInner} text-white`} />
              </div>
              {space.name}
            </button>
          );
        })}
        <button
          className={`
            flex items-center justify-center w-7 h-7 rounded-full
            transition-colors
            ${isDark
              ? "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
            }
          `}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Header text below */}
      <div>
        <h1 className={`${s.header} font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
          <span className="font-normal">Your notes in </span>
          <span style={{ color: colors.bg }}>{currentSpace.name}</span>
        </h1>
        <p className={`${s.subtext} mt-1 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
          {currentSpace.noteCount} notes
          {currentSpace.members && ` · Shared with ${currentSpace.members - 1} others`}
        </p>
      </div>
    </div>
  );
}

function StackedWithToolbar({
  spaces,
  currentSpaceId,
  onSpaceChange,
  isDark,
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  isDark: boolean;
}) {
  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  const colors = SPACE_COLORS[currentSpace.type];

  return (
    <div className="space-y-4">
      {/* Header row with tools */}
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
          <span className="font-normal">Your notes in </span>
          <span style={{ color: colors.bg }}>{currentSpace.name}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button className={`p-2 rounded-lg ${isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"}`}>
            <Search className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg ${isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"}`}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <div className={`h-5 w-px ${isDark ? "bg-zinc-700" : "bg-zinc-300"}`} />
          <button className={`p-2 rounded-lg ${isDark ? "bg-zinc-800 text-white" : "bg-zinc-200 text-zinc-900"}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg ${isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pills row below */}
      <div className="flex items-center gap-1">
        {spaces.map((space) => {
          const Icon = SPACE_ICONS[space.type];
          const spaceColors = SPACE_COLORS[space.type];
          const isActive = space.id === currentSpaceId;

          return (
            <button
              key={space.id}
              onClick={() => onSpaceChange(space.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200
              `}
              style={{
                backgroundColor: isActive ? spaceColors.bg : "transparent",
                color: isActive ? spaceColors.text : isDark ? "#a1a1aa" : "#71717a",
                boxShadow: isActive ? `0 2px 8px ${spaceColors.bg}40` : undefined,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : spaceColors.bg,
                }}
              >
                <Icon className="w-3 h-3 text-white" />
              </div>
              {space.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardStyleHeader({
  spaces,
  currentSpaceId,
  onSpaceChange,
  isDark,
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  isDark: boolean;
}) {
  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  const CurrentIcon = SPACE_ICONS[currentSpace.type];
  const colors = SPACE_COLORS[currentSpace.type];

  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${colors.bg}15 0%, transparent 60%)`
          : `linear-gradient(135deg, ${colors.bg}10 0%, transparent 60%)`,
        border: `1px solid ${isDark ? colors.bg + "30" : colors.bg + "20"}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: colors.bg }}
          >
            <CurrentIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
              <span className="font-normal">Your notes in </span>
              <span style={{ color: colors.bg }}>{currentSpace.name}</span>
            </h1>
            <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              {currentSpace.noteCount} notes
              {currentSpace.members && ` · ${currentSpace.members} members`}
            </p>
          </div>
        </div>
      </div>

      {/* Pills in card */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className={`text-xs mr-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
          Switch space:
        </span>
        {spaces
          .filter((s) => s.id !== currentSpaceId)
          .map((space) => {
            const Icon = SPACE_ICONS[space.type];
            const spaceColors = SPACE_COLORS[space.type];

            return (
              <button
                key={space.id}
                onClick={() => onSpaceChange(space.id)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                  transition-all duration-200
                  ${isDark
                    ? "bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300"
                    : "bg-white/50 hover:bg-white text-zinc-700"
                  }
                `}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: spaceColors.bg }}
                >
                  <Icon className="w-2.5 h-2.5 text-white" />
                </div>
                {space.name}
              </button>
            );
          })}
        <button
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
            ${isDark
              ? "hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
              : "hover:bg-white/50 text-zinc-400 hover:text-zinc-600"
            }
          `}
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>
    </div>
  );
}

export default function SpaceSelectorStackedMockup() {
  const [isDark, setIsDark] = useState(true);
  const [currentSpaceId1, setCurrentSpaceId1] = useState("personal");
  const [currentSpaceId2, setCurrentSpaceId2] = useState("couple-1");
  const [currentSpaceId3, setCurrentSpaceId3] = useState("family-1");
  const [currentSpaceId4, setCurrentSpaceId4] = useState("work-1");

  return (
    <div className={`min-h-screen p-8 transition-colors ${isDark ? "bg-zinc-950" : "bg-zinc-100"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
              Mockup 8: Stacked Header with Pills
            </h1>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Pills above or below the &quot;Your notes in&quot; header
            </p>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-xl transition-colors ${
              isDark
                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                : "bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200"
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Preview - Pills above header */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Pills Above Header
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Space pills as a navigation bar, header shows current context
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <StackedHeaderPills
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId1}
              onSpaceChange={setCurrentSpaceId1}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Preview - Large variant */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Large Variant
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            More prominent for main workspace pages
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <StackedHeaderPills
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId2}
              onSpaceChange={setCurrentSpaceId2}
              isDark={isDark}
              size="large"
            />
          </div>
        </div>

        {/* Preview - With toolbar */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Header with Toolbar
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Header row with actions, pills below
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <StackedWithToolbar
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId3}
              onSpaceChange={setCurrentSpaceId3}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Preview - Card style */}
        <div className={`p-8 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Card Style with Gradient
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Hero card with colored gradient based on current space
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <CardStyleHeader
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId4}
              onSpaceChange={setCurrentSpaceId4}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Structure */}
        <div className={`p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Structure
          </h2>
          <pre className={`font-mono text-sm overflow-x-auto ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
{`Pills Above Header:
┌─────────────────────────────────────────────────────────────┐
│ [🔵 My Notes]  💕 Couple   👨‍👩‍👧 Family   💼 Work Team   +     │
│                                                             │
│ Your notes in My Notes                                      │
│ 12 notes                                                    │
└─────────────────────────────────────────────────────────────┘

Header with Toolbar:
┌─────────────────────────────────────────────────────────────┐
│ Your notes in My Notes                      🔍 ⚙️ | 🔲 ≡   │
│                                                             │
│ [🔵 My Notes]  💕 Couple   👨‍👩‍👧 Family   💼 Work Team        │
└─────────────────────────────────────────────────────────────┘

Card Style:
┌─────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░ 🔵  Your notes in My Notes                              ░ │
│ ░     12 notes · 1 member                                 ░ │
│ ░                                                         ░ │
│ ░ Switch space: 💕 Couple  👨‍👩‍👧 Family  💼 Work  + New      ░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        {/* Navigation */}
        <div className={`mt-8 p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            View All Mockups
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { href: "/mockups/space-selector-pill", label: "1: Pill + Dropdown" },
              { href: "/mockups/space-selector-header", label: "2: Contextual Header" },
              { href: "/mockups/space-selector-colored", label: "3: Color-Coded Tabs" },
              { href: "/mockups/space-selector-combined", label: "4: Combined (Recommended)" },
              { href: "/mockups/space-selector-header-pills", label: "5: Header + Pills" },
              { href: "/mockups/space-selector-inline-pill", label: "6: Inline Pill" },
              { href: "/mockups/space-selector-sentence-pills", label: "7: Sentence + Pills" },
              { href: "/mockups/space-selector-stacked", label: "8: Stacked (Current)" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${link.href.includes("stacked")
                    ? isDark
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "bg-violet-100 text-violet-700 border border-violet-200"
                    : isDark
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                  }
                `}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
