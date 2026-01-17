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
  ChevronDown,
  Plus,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Space type configuration
const SPACE_COLORS = {
  personal: { bg: "#3b82f6", text: "#ffffff", tint: "bg-blue-500/10" },
  couple: { bg: "#ec4899", text: "#ffffff", tint: "bg-pink-500/10" },
  family: { bg: "#8b5cf6", text: "#ffffff", tint: "bg-purple-500/10" },
  work: { bg: "#f97316", text: "#ffffff", tint: "bg-orange-500/10" },
  buddy: { bg: "#10b981", text: "#ffffff", tint: "bg-emerald-500/10" },
  squad: { bg: "#06b6d4", text: "#ffffff", tint: "bg-cyan-500/10" },
  project: { bg: "#6366f1", text: "#ffffff", tint: "bg-indigo-500/10" },
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

// Mock data
const mockSpaces: Space[] = [
  { id: "personal", name: "My Notes", type: "personal", noteCount: 12 },
  { id: "couple-1", name: "Couple", type: "couple", noteCount: 8, members: 2 },
  { id: "family-1", name: "Family", type: "family", noteCount: 5, members: 4 },
  { id: "work-1", name: "Work Team", type: "work", noteCount: 23, members: 6 },
];

function SpaceSelectorPill({
  spaces,
  currentSpaceId,
  onSpaceChange,
  onNewSpace,
  isDark,
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  onNewSpace: () => void;
  isDark: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  const SpaceIcon = SPACE_ICONS[currentSpace.type];
  const colors = SPACE_COLORS[currentSpace.type];

  // Close dropdown on outside click
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
    <div className="relative" ref={dropdownRef}>
      {/* Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full
          transition-all duration-200 ease-out
          ${isDark
            ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
            : "bg-white hover:bg-zinc-50 border border-zinc-200 shadow-sm"
          }
        `}
        style={{
          boxShadow: isOpen ? `0 0 0 2px ${colors.bg}40` : undefined,
        }}
      >
        <div
          className="flex items-center justify-center w-6 h-6 rounded-full"
          style={{ backgroundColor: colors.bg }}
        >
          <SpaceIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className={`font-medium text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>
          {currentSpace.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 mt-2 w-64 rounded-xl overflow-hidden
            shadow-xl border z-50
            animate-in fade-in-0 zoom-in-95 duration-200
            ${isDark
              ? "bg-zinc-900 border-zinc-700"
              : "bg-white border-zinc-200"
            }
          `}
        >
          {/* Spaces List */}
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
                      ? isDark
                        ? "bg-zinc-800"
                        : "bg-zinc-100"
                      : isDark
                        ? "hover:bg-zinc-800/50"
                        : "hover:bg-zinc-50"
                    }
                  `}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
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

          {/* Divider */}
          <div className={`h-px mx-2 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

          {/* New Space Button */}
          <div className="p-2">
            <button
              onClick={() => {
                onNewSpace();
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors
                ${isDark
                  ? "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-300"
                  : "hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700"
                }
              `}
            >
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${isDark ? "bg-zinc-800" : "bg-zinc-100"}
              `}>
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">New Space</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpaceSelectorPillMockup() {
  const [isDark, setIsDark] = useState(true);
  const [currentSpaceId, setCurrentSpaceId] = useState("personal");

  return (
    <div className={`min-h-screen p-8 transition-colors ${isDark ? "bg-zinc-950" : "bg-zinc-100"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
              Space Selector: Pill + Dropdown
            </h1>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Mockup 1 - Compact pill that expands into a dropdown
            </p>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`
              p-3 rounded-xl transition-colors
              ${isDark
                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                : "bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200"
              }
            `}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Design Preview */}
        <div className={`p-8 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-6 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Interactive Preview
          </h2>

          <div className="flex justify-center">
            <SpaceSelectorPill
              spaces={mockSpaces}
              currentSpaceId={currentSpaceId}
              onSpaceChange={setCurrentSpaceId}
              onNewSpace={() => alert("Create new space")}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Design Rationale */}
        <div className={`p-6 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Design Rationale
          </h2>
          <ul className={`space-y-3 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span><strong>Less visual noise:</strong> Only shows the current space, reducing cognitive load</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
              <span><strong>Rich context:</strong> Dropdown shows member count and note count for each space</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
              <span><strong>Type icons:</strong> Each space type has a distinct icon for quick recognition</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <span><strong>Easy creation:</strong> &quot;New Space&quot; option built into the dropdown</span>
            </li>
          </ul>
        </div>

        {/* ASCII Diagram */}
        <div className={`p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Component Structure
          </h2>
          <pre className={`font-mono text-sm overflow-x-auto ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
{`┌─────────────────────────┐
│ 👤 My Notes  ▼         │  ← Pill trigger (current space)
└─────────────────────────┘
        ↓ (on click)
┌─────────────────────────┐
│ 👤 My Notes      ✓  12 │  ← Selected indicator + note count
│ 💕 Couple (2)       8  │  ← Member count in subtitle
│ 👨‍👩‍👧 Family (4)       5  │
│ 💼 Work Team (6)   23  │
│ ─────────────────────── │
│ + New Space             │  ← Create action
└─────────────────────────┘`}
          </pre>
        </div>

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className={`p-6 rounded-2xl ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
              Pros
            </h3>
            <ul className={`space-y-2 ${isDark ? "text-emerald-300/80" : "text-emerald-700"}`}>
              <li>• Clean, minimal default state</li>
              <li>• More room for metadata in dropdown</li>
              <li>• Scales well with many spaces</li>
              <li>• Familiar dropdown pattern</li>
            </ul>
          </div>
          <div className={`p-6 rounded-2xl ${isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? "text-amber-400" : "text-amber-700"}`}>
              Cons
            </h3>
            <ul className={`space-y-2 ${isDark ? "text-amber-300/80" : "text-amber-700"}`}>
              <li>• Extra click to see all spaces</li>
              <li>• Less discoverable for new users</li>
              <li>• No quick glance at available spaces</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
