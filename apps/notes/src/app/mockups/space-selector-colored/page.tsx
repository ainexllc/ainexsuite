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
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Space type configuration
const SPACE_COLORS = {
  personal: { bg: "#3b82f6", text: "#ffffff", light: "#dbeafe", dark: "#1e3a5f" },
  couple: { bg: "#ec4899", text: "#ffffff", light: "#fce7f3", dark: "#5f1e3a" },
  family: { bg: "#8b5cf6", text: "#ffffff", light: "#ede9fe", dark: "#3b1e5f" },
  work: { bg: "#f97316", text: "#ffffff", light: "#ffedd5", dark: "#5f3a1e" },
  buddy: { bg: "#10b981", text: "#ffffff", light: "#d1fae5", dark: "#1e5f4a" },
  squad: { bg: "#06b6d4", text: "#ffffff", light: "#cffafe", dark: "#1e4a5f" },
  project: { bg: "#6366f1", text: "#ffffff", light: "#e0e7ff", dark: "#2e1e5f" },
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

const manySpaces: Space[] = [
  ...mockSpaces,
  { id: "buddy-1", name: "Study Buddy", type: "buddy", noteCount: 15, members: 2 },
  { id: "squad-1", name: "Gaming Squad", type: "squad", noteCount: 7, members: 5 },
  { id: "project-1", name: "Side Project", type: "project", noteCount: 34, members: 3 },
];

function ColoredTabSelector({
  spaces,
  currentSpaceId,
  onSpaceChange,
  onManageSpaces,
  isDark,
  variant = "filled",
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  onManageSpaces?: () => void;
  isDark: boolean;
  variant?: "filled" | "underline" | "pill";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [spaces]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -150 : 150,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className={`
            absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full
            backdrop-blur-sm border shadow-sm transition
            ${isDark
              ? "bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white"
              : "bg-white/80 border-zinc-200 text-zinc-500 hover:text-zinc-900"
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Tabs container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-1 py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {spaces.map((space) => {
          const Icon = SPACE_ICONS[space.type];
          const colors = SPACE_COLORS[space.type];
          const isActive = space.id === currentSpaceId;

          if (variant === "filled") {
            return (
              <button
                key={space.id}
                onClick={() => onSpaceChange(space.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                `}
                style={{
                  backgroundColor: isActive
                    ? colors.bg
                    : isDark
                      ? `${colors.bg}15`
                      : `${colors.bg}10`,
                  color: isActive
                    ? colors.text
                    : isDark
                      ? colors.bg
                      : colors.bg,
                }}
              >
                <Icon className="w-4 h-4" />
                {space.name}
              </button>
            );
          }

          if (variant === "underline") {
            return (
              <button
                key={space.id}
                onClick={() => onSpaceChange(space.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium
                  transition-all duration-200 whitespace-nowrap border-b-2
                `}
                style={{
                  borderBottomColor: isActive ? colors.bg : "transparent",
                  color: isActive
                    ? colors.bg
                    : isDark
                      ? "#a1a1aa"
                      : "#71717a",
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: colors.bg }}
                />
                {space.name}
              </button>
            );
          }

          // pill variant
          return (
            <button
              key={space.id}
              onClick={() => onSpaceChange(space.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 whitespace-nowrap
              `}
              style={{
                backgroundColor: isActive
                  ? colors.bg
                  : "transparent",
                color: isActive
                  ? colors.text
                  : isDark
                    ? "#a1a1aa"
                    : "#71717a",
                boxShadow: isActive ? `0 2px 8px ${colors.bg}40` : undefined,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : colors.bg,
                }}
              >
                <Icon
                  className="w-3 h-3"
                  style={{ color: isActive ? "white" : "white" }}
                />
              </div>
              {space.name}
            </button>
          );
        })}
      </div>

      {/* Right scroll arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className={`
            absolute right-12 z-10 flex h-8 w-8 items-center justify-center rounded-full
            backdrop-blur-sm border shadow-sm transition
            ${isDark
              ? "bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white"
              : "bg-white/80 border-zinc-200 text-zinc-500 hover:text-zinc-900"
            }
          `}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Settings button */}
      {onManageSpaces && (
        <button
          onClick={onManageSpaces}
          className={`
            flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0
            transition-colors
            ${isDark
              ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700"
            }
          `}
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
      )}
    </div>
  );
}

export default function SpaceSelectorColoredMockup() {
  const [isDark, setIsDark] = useState(true);
  const [currentSpaceId1, setCurrentSpaceId1] = useState("personal");
  const [currentSpaceId2, setCurrentSpaceId2] = useState("couple-1");
  const [currentSpaceId3, setCurrentSpaceId3] = useState("family-1");
  const [currentSpaceId4, setCurrentSpaceId4] = useState("work-1");

  return (
    <div className={`min-h-screen p-8 transition-colors ${isDark ? "bg-zinc-950" : "bg-zinc-100"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
              Space Selector: Color-Coded Tabs
            </h1>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Mockup 3 - Each space type has a distinct color theme
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

        {/* Variant 1: Filled */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Filled Variant
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Active tab has solid color, inactive tabs have tinted background
          </p>

          <ColoredTabSelector
            spaces={mockSpaces}
            currentSpaceId={currentSpaceId1}
            onSpaceChange={setCurrentSpaceId1}
            onManageSpaces={() => alert("Manage spaces")}
            isDark={isDark}
            variant="filled"
          />
        </div>

        {/* Variant 2: Underline */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Underline Variant
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Colored underline indicator, icons always show space color
          </p>

          <ColoredTabSelector
            spaces={mockSpaces}
            currentSpaceId={currentSpaceId2}
            onSpaceChange={setCurrentSpaceId2}
            onManageSpaces={() => alert("Manage spaces")}
            isDark={isDark}
            variant="underline"
          />
        </div>

        {/* Variant 3: Pill */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Pill Variant
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Rounded pills with colored icon badges
          </p>

          <ColoredTabSelector
            spaces={mockSpaces}
            currentSpaceId={currentSpaceId3}
            onSpaceChange={setCurrentSpaceId3}
            onManageSpaces={() => alert("Manage spaces")}
            isDark={isDark}
            variant="pill"
          />
        </div>

        {/* Many Spaces Example */}
        <div className={`p-8 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            With Many Spaces (Scrollable)
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Horizontal scroll with arrow indicators when overflow
          </p>

          <ColoredTabSelector
            spaces={manySpaces}
            currentSpaceId={currentSpaceId4}
            onSpaceChange={setCurrentSpaceId4}
            onManageSpaces={() => alert("Manage spaces")}
            isDark={isDark}
            variant="filled"
          />
        </div>

        {/* Color Legend */}
        <div className={`p-6 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Space Type Color Legend
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(SPACE_COLORS).map(([type, colors]) => {
              const Icon = SPACE_ICONS[type as SpaceType];
              const labels: Record<string, string> = {
                personal: "Personal",
                couple: "Couple",
                family: "Family",
                work: "Work",
                buddy: "Buddy",
                squad: "Squad",
                project: "Project",
              };
              return (
                <div
                  key={type}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isDark ? "bg-zinc-800/50" : "bg-zinc-50"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>
                      {labels[type]}
                    </div>
                    <div className={`text-xs font-mono ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                      {colors.bg}
                    </div>
                  </div>
                </div>
              );
            })}
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
              <span><strong>Visual differentiation:</strong> Each space type is instantly recognizable by color</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
              <span><strong>Type icons:</strong> Icons reinforce the space type (user, heart, users, etc.)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
              <span><strong>Multiple variants:</strong> Choose the style that fits your UI best</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <span><strong>Horizontal scroll:</strong> Gracefully handles many spaces without wrapping</span>
            </li>
          </ul>
        </div>

        {/* ASCII Diagram */}
        <div className={`p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Component Structure
          </h2>
          <pre className={`font-mono text-sm overflow-x-auto ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
{`Filled Variant:
┌──────────────────────────────────────────────────────────┐
│ [👤 My Notes] [💕 Couple] [👨‍👩‍👧 Family] [💼 Work]   ⚙️    │
│  (blue bg)   (pink tint) (purple tint)(orange tint)     │
└──────────────────────────────────────────────────────────┘

Underline Variant:
┌──────────────────────────────────────────────────────────┐
│  👤 My Notes   💕 Couple   👨‍👩‍👧 Family   💼 Work    ⚙️    │
│  ‾‾‾‾‾‾‾‾‾‾                                             │
│  (blue line)                                             │
└──────────────────────────────────────────────────────────┘

Pill Variant:
┌──────────────────────────────────────────────────────────┐
│ [🔵 My Notes]  💕 Couple   👨‍👩‍👧 Family   💼 Work    ⚙️    │
│  (blue pill)  (gray text) (gray text)  (gray text)      │
└──────────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className={`p-6 rounded-2xl ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
              Pros
            </h3>
            <ul className={`space-y-2 ${isDark ? "text-emerald-300/80" : "text-emerald-700"}`}>
              <li>• All spaces visible at a glance</li>
              <li>• Quick single-click switching</li>
              <li>• Colors create strong visual hierarchy</li>
              <li>• Icons provide semantic meaning</li>
            </ul>
          </div>
          <div className={`p-6 rounded-2xl ${isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? "text-amber-400" : "text-amber-700"}`}>
              Cons
            </h3>
            <ul className={`space-y-2 ${isDark ? "text-amber-300/80" : "text-amber-700"}`}>
              <li>• Can feel busy with many spaces</li>
              <li>• Colors may clash with app branding</li>
              <li>• No room for metadata (member count)</li>
              <li>• Horizontal scroll less discoverable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
