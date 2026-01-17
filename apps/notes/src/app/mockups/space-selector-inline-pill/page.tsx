"use client";

import { useState, useRef, useEffect } from "react";
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
  Check,
  ChevronDown,
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

function InlinePillSelector({
  spaces,
  currentSpaceId,
  onSpaceChange,
  isDark,
  prefix = "Your notes in",
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  isDark: boolean;
  prefix?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  const SpaceIcon = SPACE_ICONS[currentSpace.type];
  const colors = SPACE_COLORS[currentSpace.type];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`text-2xl font-normal ${isDark ? "text-white" : "text-zinc-900"}`}>
        {prefix}
      </span>

      <div className="relative" ref={dropdownRef}>
        {/* Pill Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold
            transition-all duration-200
          `}
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            boxShadow: `0 2px 12px ${colors.bg}50`,
          }}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20">
            <SpaceIcon className="w-3.5 h-3.5 text-white" />
          </div>
          {currentSpace.name}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className={`
              absolute top-full left-0 mt-2 w-64 rounded-xl overflow-hidden
              shadow-xl border z-50
              animate-in fade-in-0 zoom-in-95 duration-200
              ${isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200"}
            `}
          >
            <div className="p-2">
              {spaces.map((space) => {
                const Icon = SPACE_ICONS[space.type];
                const spaceColors = SPACE_COLORS[space.type];
                const isSelected = space.id === currentSpaceId;

                return (
                  <button
                    key={space.id}
                    onClick={() => {
                      onSpaceChange(space.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors
                      ${isSelected
                        ? isDark ? "bg-zinc-800" : "bg-zinc-100"
                        : isDark ? "hover:bg-zinc-800/50" : "hover:bg-zinc-50"
                      }
                    `}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: spaceColors.bg }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {space.name}
                      </div>
                      {space.members && (
                        <div className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                          {space.members} members
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Check className={`w-4 h-4 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
                      )}
                      <span className={`text-sm tabular-nums ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        {space.noteCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className={`h-px mx-2 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <div className="p-2">
              <button
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors
                  ${isDark
                    ? "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-300"
                    : "hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700"
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}>
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">New Space</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpaceSelectorInlinePillMockup() {
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
              Mockup 6: Inline Pill Selector
            </h1>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              &quot;Your notes in&quot; followed by clickable pill with dropdown
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

        {/* Preview - Default */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Default: &quot;Your notes in&quot;
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Click the pill to open dropdown
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <InlinePillSelector
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId1}
              onSpaceChange={setCurrentSpaceId1}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Preview - Viewing */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Variant: &quot;Viewing&quot;
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Shorter prefix for compact layouts
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <InlinePillSelector
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId2}
              onSpaceChange={setCurrentSpaceId2}
              isDark={isDark}
              prefix="Viewing"
            />
          </div>
        </div>

        {/* Preview - Browse notes in */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Variant: &quot;Browse notes in&quot;
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Action-oriented language
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <InlinePillSelector
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId3}
              onSpaceChange={setCurrentSpaceId3}
              isDark={isDark}
              prefix="Browse notes in"
            />
          </div>
        </div>

        {/* Preview - Space: */}
        <div className={`p-8 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Variant: &quot;Space:&quot;
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Label-style prefix
          </p>
          <div className={`p-6 rounded-xl ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <InlinePillSelector
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId4}
              onSpaceChange={setCurrentSpaceId4}
              isDark={isDark}
              prefix="Space:"
            />
          </div>
        </div>

        {/* Structure */}
        <div className={`p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Structure
          </h2>
          <pre className={`font-mono text-sm overflow-x-auto ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
{`Your notes in [🔵 My Notes ▼]
              └─────────────┘
                 ↓ (on click)
         ┌─────────────────────────┐
         │ 🔵 My Notes      ✓  12 │
         │ 💕 Couple (2)        8 │
         │ 👨‍👩‍👧 Family (4)        5 │
         │ 💼 Work Team (6)    23 │
         │ ─────────────────────── │
         │ + New Space             │
         └─────────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  );
}
