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
  Settings,
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

function HeaderWithPillTabs({
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
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className={`text-2xl ${isDark ? "text-white" : "text-zinc-900"}`}>
          <span className="font-normal">Your notes in </span>
          <span className="font-bold" style={{ color: colors.bg }}>
            {currentSpace.name}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            {currentSpace.noteCount} notes
          </span>
          <button
            className={`p-2 rounded-lg transition-colors ${
              isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pill Tabs */}
      <div className="flex items-center gap-2">
        {spaces.map((space) => {
          const Icon = SPACE_ICONS[space.type];
          const spaceColors = SPACE_COLORS[space.type];
          const isActive = space.id === currentSpaceId;

          return (
            <button
              key={space.id}
              onClick={() => onSpaceChange(space.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 whitespace-nowrap
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
        <button
          className={`
            flex items-center justify-center w-9 h-9 rounded-full
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
    </div>
  );
}

export default function SpaceSelectorHeaderPillsMockup() {
  const [isDark, setIsDark] = useState(true);
  const [currentSpaceId, setCurrentSpaceId] = useState("personal");

  return (
    <div className={`min-h-screen p-8 transition-colors ${isDark ? "bg-zinc-950" : "bg-zinc-100"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
              Mockup 5: Header with Pill Tabs
            </h1>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              &quot;Your notes in [Space]&quot; header with pill tabs below
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

        {/* Preview */}
        <div className={`p-8 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-6 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Interactive Preview
          </h2>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <HeaderWithPillTabs
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId}
              onSpaceChange={setCurrentSpaceId}
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
{`┌─────────────────────────────────────────────────────────────┐
│ Your notes in My Notes                        12 notes  ⚙️  │
│                                                             │
│ [🔵 My Notes]  💕 Couple   👨‍👩‍👧 Family   💼 Work Team   +     │
└─────────────────────────────────────────────────────────────┘
      ↑               ↑           ↑            ↑
  Active pill    Inactive pills with colored icon badges`}
          </pre>
        </div>
      </div>
    </div>
  );
}
