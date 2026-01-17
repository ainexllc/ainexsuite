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
  Plus,
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
  { id: "project-1", name: "Side Project", type: "project", noteCount: 34, members: 3 },
];

// Tooltip component
function Tooltip({
  children,
  content,
  isDark,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  isDark: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      });
    }
    setIsVisible(true);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
      className="relative"
    >
      {children}
      {isVisible && (
        <div
          className={`
            fixed z-50 px-3 py-2 rounded-lg text-sm shadow-lg
            animate-in fade-in-0 zoom-in-95 duration-150
            pointer-events-none -translate-x-1/2
            ${isDark
              ? "bg-zinc-800 text-white border border-zinc-700"
              : "bg-white text-zinc-900 border border-zinc-200"
            }
          `}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Combined Space Selector - The recommended design
function CombinedSpaceSelector({
  spaces,
  currentSpaceId,
  onSpaceChange,
  onManageSpaces,
  onNewSpace,
  isDark,
  showLabel = true,
}: {
  spaces: Space[];
  currentSpaceId: string;
  onSpaceChange: (id: string) => void;
  onManageSpaces?: () => void;
  onNewSpace?: () => void;
  isDark: boolean;
  showLabel?: boolean;
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
    <div className="w-full">
      {/* Optional label */}
      {showLabel && (
        <div className={`text-xs font-medium uppercase tracking-wider mb-2 ${
          isDark ? "text-zinc-500" : "text-zinc-400"
        }`}>
          Spaces
        </div>
      )}

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

        {/* Container with subtle background */}
        <div
          className={`
            flex-1 rounded-xl p-1
            ${isDark ? "bg-zinc-800/50" : "bg-zinc-100"}
          `}
        >
          {/* Tabs container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {spaces.map((space) => {
              const Icon = SPACE_ICONS[space.type];
              const colors = SPACE_COLORS[space.type];
              const isActive = space.id === currentSpaceId;

              const tabContent = (
                <button
                  key={space.id}
                  onClick={() => onSpaceChange(space.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? "shadow-sm"
                      : isDark
                        ? "hover:bg-zinc-700/50"
                        : "hover:bg-white/50"
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? colors.bg : "transparent",
                    color: isActive
                      ? colors.text
                      : isDark
                        ? "#a1a1aa"
                        : "#71717a",
                  }}
                >
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      transition-colors duration-200
                    `}
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.2)"
                        : `${colors.bg}20`,
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: isActive ? "white" : colors.bg }}
                    />
                  </div>
                  {space.name}
                </button>
              );

              // Show tooltip with member info on hover
              return space.members ? (
                <Tooltip
                  key={space.id}
                  content={
                    <div className="flex items-center gap-2">
                      <span>{space.noteCount} notes</span>
                      <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>·</span>
                      <span>{space.members} members</span>
                    </div>
                  }
                  isDark={isDark}
                >
                  {tabContent}
                </Tooltip>
              ) : (
                <Tooltip
                  key={space.id}
                  content={`${space.noteCount} notes`}
                  isDark={isDark}
                >
                  {tabContent}
                </Tooltip>
              );
            })}

            {/* Add new space button (inline) */}
            {onNewSpace && (
              <button
                onClick={onNewSpace}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-colors
                  ${isDark
                    ? "hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300"
                    : "hover:bg-white/50 text-zinc-400 hover:text-zinc-600"
                  }
                `}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
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
    </div>
  );
}

// Compact variant for smaller spaces
function CompactSpaceSelector({
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
    <div className={`inline-flex items-center gap-0.5 p-1 rounded-lg ${
      isDark ? "bg-zinc-800/50" : "bg-zinc-100"
    }`}>
      {spaces.map((space) => {
        const Icon = SPACE_ICONS[space.type];
        const colors = SPACE_COLORS[space.type];
        const isActive = space.id === currentSpaceId;

        return (
          <Tooltip
            key={space.id}
            content={
              <div className="flex flex-col">
                <span className="font-medium">{space.name}</span>
                <span className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {space.noteCount} notes
                  {space.members && ` · ${space.members} members`}
                </span>
              </div>
            }
            isDark={isDark}
          >
            <button
              onClick={() => onSpaceChange(space.id)}
              className={`
                flex items-center justify-center w-8 h-8 rounded-md
                transition-all duration-200
              `}
              style={{
                backgroundColor: isActive ? colors.bg : "transparent",
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? "white" : colors.bg }}
              />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}

export default function SpaceSelectorCombinedMockup() {
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                Space Selector: Combined
              </h1>
              <span className={`
                px-2 py-1 rounded-md text-xs font-semibold uppercase
                ${isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-700"
                }
              `}>
                Recommended
              </span>
            </div>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Mockup 4 - Best elements from all designs combined
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

        {/* Main Design Preview */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Full Space Selector
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Color-coded tabs with icons, tooltips for metadata, and inline add button
          </p>

          <CombinedSpaceSelector
            spaces={mockSpaces}
            currentSpaceId={currentSpaceId1}
            onSpaceChange={setCurrentSpaceId1}
            onManageSpaces={() => alert("Manage spaces")}
            onNewSpace={() => alert("Create new space")}
            isDark={isDark}
          />
        </div>

        {/* Without Label */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Without &quot;Spaces&quot; Label
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Cleaner look when context is already clear
          </p>

          <CombinedSpaceSelector
            spaces={mockSpaces}
            currentSpaceId={currentSpaceId2}
            onSpaceChange={setCurrentSpaceId2}
            onManageSpaces={() => alert("Manage spaces")}
            isDark={isDark}
            showLabel={false}
          />
        </div>

        {/* With Many Spaces */}
        <div className={`p-8 rounded-2xl mb-6 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            With Many Spaces
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Horizontal scroll with arrow indicators
          </p>

          <CombinedSpaceSelector
            spaces={manySpaces}
            currentSpaceId={currentSpaceId3}
            onSpaceChange={setCurrentSpaceId3}
            onManageSpaces={() => alert("Manage spaces")}
            onNewSpace={() => alert("Create new space")}
            isDark={isDark}
          />
        </div>

        {/* Compact Variant */}
        <div className={`p-8 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Compact Variant (Icons Only)
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            For tight spaces - hover for details
          </p>

          <CompactSpaceSelector
            spaces={mockSpaces}
            currentSpaceId={currentSpaceId4}
            onSpaceChange={setCurrentSpaceId4}
            isDark={isDark}
          />
        </div>

        {/* Key Features */}
        <div className={`p-6 rounded-2xl mb-8 ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Combined Best Elements
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Color-coded type indicators",
                description: "Each space type has distinct color for instant recognition",
                from: "Mockup 3",
                color: "#8b5cf6",
              },
              {
                title: "Type icons in tabs",
                description: "User, Heart, Users, Briefcase icons for semantic meaning",
                from: "Mockup 3",
                color: "#3b82f6",
              },
              {
                title: "Tooltips for metadata",
                description: "Hover shows note count and member count without clutter",
                from: "Mockup 1",
                color: "#ec4899",
              },
              {
                title: "Inline 'Add Space' button",
                description: "Quick access to create new spaces without dropdown",
                from: "Mockup 1",
                color: "#10b981",
              },
              {
                title: "Optional 'Spaces' label",
                description: "Can be shown/hidden based on context",
                from: "Mockup 2",
                color: "#f97316",
              },
              {
                title: "Horizontal scroll",
                description: "Gracefully handles many spaces with scroll indicators",
                from: "Mockup 3",
                color: "#06b6d4",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  isDark ? "bg-zinc-800/50" : "bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: feature.color }}
                  />
                  <h3 className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {feature.description}
                </p>
                <div className={`text-xs mt-2 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                  From {feature.from}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ASCII Diagram */}
        <div className={`p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Component Structure
          </h2>
          <pre className={`font-mono text-sm overflow-x-auto ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
{`Combined Design:

Spaces
┌──────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐  ⚙️  │
│ │ [🔵 My Notes] [💕 Couple] [👨‍👩‍👧 Family] [💼 Work]  +  │      │
│ └─────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
       ↑                   ↑                     ↑         ↑
  Active tab         Colored icons        Inline add   Settings
  (solid bg)          in circles           button

On hover → Shows tooltip: "8 notes · 2 members"

Compact Variant:
┌───────────────────┐
│ [🔵][💕][👨‍👩‍👧][💼] │  ← Icons only, tooltips on hover
└───────────────────┘`}
          </pre>
        </div>

        {/* Comparison Summary */}
        <div className={`mt-8 p-6 rounded-2xl ${isDark ? "bg-violet-500/10 border border-violet-500/20" : "bg-violet-50 border border-violet-200"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-violet-300" : "text-violet-800"}`}>
            Why This Design is Recommended
          </h2>
          <div className={`space-y-3 ${isDark ? "text-violet-200/80" : "text-violet-700"}`}>
            <p>
              <strong>Balances visibility and cleanliness:</strong> All spaces are visible at a glance
              (unlike Mockup 1&apos;s dropdown), but metadata is tucked away in tooltips (unlike Mockup 3&apos;s
              potential clutter).
            </p>
            <p>
              <strong>Strong visual hierarchy:</strong> Color-coded backgrounds make it immediately
              clear which space is active, and what type each space is.
            </p>
            <p>
              <strong>Accessible and scalable:</strong> Works for users with 2 spaces or 10 spaces,
              with graceful horizontal scrolling.
            </p>
            <p>
              <strong>Consistent with the &quot;spaces as containers&quot; concept:</strong> Icons and colors
              reinforce that these are distinct collaborative environments, not just folders.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className={`mt-8 p-6 rounded-2xl ${isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            View Other Mockups
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/mockups/space-selector-pill"
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                }
              `}
            >
              Mockup 1: Pill + Dropdown
            </a>
            <a
              href="/mockups/space-selector-header"
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                }
              `}
            >
              Mockup 2: Contextual Header
            </a>
            <a
              href="/mockups/space-selector-colored"
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                }
              `}
            >
              Mockup 3: Color-Coded Tabs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
