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

function SentenceWithPills({
  spaces,
  currentSpaceId,
  onSpaceChange,
  isDark,
  prefix = "Your notes in",
  showAdd = true,
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  isDark: boolean;
  prefix?: string;
  showAdd?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-xl font-normal ${isDark ? "text-white" : "text-zinc-900"}`}>
        {prefix}
      </span>

      {spaces.map((space) => {
        const Icon = SPACE_ICONS[space.type];
        const colors = SPACE_COLORS[space.type];
        const isActive = space.id === currentSpaceId;

        return (
          <button
            key={space.id}
            onClick={() => onSpaceChange(space.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200
            `}
            style={{
              backgroundColor: isActive ? colors.bg : "transparent",
              color: isActive ? colors.text : isDark ? "#a1a1aa" : "#71717a",
              boxShadow: isActive ? `0 2px 8px ${colors.bg}40` : undefined,
              border: isActive ? "none" : `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.2)" : colors.bg,
              }}
            >
              <Icon className="w-3 h-3 text-white" />
            </div>
            {space.name}
          </button>
        );
      })}

      {showAdd && (
        <button
          className={`
            flex items-center justify-center w-8 h-8 rounded-full border
            transition-colors
            ${isDark
              ? "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              : "border-zinc-300 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400"
            }
          `}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function SentenceWithPillsFlow({
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

  return (
    <div className="space-y-4">
      {/* Main header showing current space */}
      <h1 className={`text-2xl ${isDark ? "text-white" : "text-zinc-900"}`}>
        <span className="font-normal">Your notes in </span>
        <span className="font-bold" style={{ color: SPACE_COLORS[currentSpace.type].bg }}>
          {currentSpace.name}
        </span>
      </h1>

      {/* Pills flow naturally like a sentence continuation */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className={`text-sm mr-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
          Switch to:
        </span>
        {spaces
          .filter((s) => s.id !== currentSpaceId)
          .map((space) => {
            const Icon = SPACE_ICONS[space.type];
            const colors = SPACE_COLORS[space.type];

            return (
              <button
                key={space.id}
                onClick={() => onSpaceChange(space.id)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                  transition-all duration-200
                  ${isDark
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700"
                  }
                `}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.bg }}
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
            transition-colors
            ${isDark
              ? "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
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

function SentenceWithPillsCompact({
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
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl ${
      isDark ? "bg-zinc-800/50" : "bg-zinc-100"
    }`}>
      <span className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
        Your notes in
      </span>

      {spaces.map((space) => {
        const Icon = SPACE_ICONS[space.type];
        const colors = SPACE_COLORS[space.type];
        const isActive = space.id === currentSpaceId;

        return (
          <button
            key={space.id}
            onClick={() => onSpaceChange(space.id)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              transition-all duration-200
            `}
            style={{
              backgroundColor: isActive ? colors.bg : "transparent",
              color: isActive ? colors.text : isDark ? "#a1a1aa" : "#71717a",
            }}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.2)" : colors.bg,
              }}
            >
              <Icon className="w-2.5 h-2.5 text-white" />
            </div>
            {space.name}
          </button>
        );
      })}
    </div>
  );
}

export default function SpaceSelectorSentencePillsMockup() {
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
              Mockup 7: Sentence with Inline Pills
            </h1>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Text flows naturally with pill tabs inline
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

        {/* Preview - All pills after text */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            All Pills Inline
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            &quot;Your notes in&quot; followed by all space pills
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <SentenceWithPills
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId1}
              onSpaceChange={setCurrentSpaceId1}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Preview - Flow layout */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Header + Switch Pills
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Bold header shows current, smaller pills to switch
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <SentenceWithPillsFlow
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId2}
              onSpaceChange={setCurrentSpaceId2}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Preview - Compact bar */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Compact Bar
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            All in one contained row
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <SentenceWithPillsCompact
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId3}
              onSpaceChange={setCurrentSpaceId3}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Preview - Browse variant */}
        <div className={`p-8 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Action Variant: &quot;Browse&quot;
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Different prefix for action-oriented context
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <SentenceWithPills
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId4}
              onSpaceChange={setCurrentSpaceId4}
              isDark={isDark}
              prefix="Browse"
              showAdd={false}
            />
          </div>
        </div>

        {/* Structure */}
        <div className={`p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Structure
          </h2>
          <pre className={`font-mono text-sm overflow-x-auto ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
{`All Pills Inline:
Your notes in [🔵 My Notes] [💕 Couple] [👨‍👩‍👧 Family] [💼 Work]  +
               └──────────┘
                 Active (filled)

Header + Switch Pills:
Your notes in My Notes (bold, colored)
Switch to: 💕 Couple  👨‍👩‍👧 Family  💼 Work  + New

Compact Bar:
┌────────────────────────────────────────────────────────────┐
│ Your notes in  [🔵 My Notes] 💕 Couple  👨‍👩‍👧 Family  💼 Work │
└────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  );
}
