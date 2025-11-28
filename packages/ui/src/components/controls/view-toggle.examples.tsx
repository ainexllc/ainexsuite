/**
 * ViewToggle and SegmentedControl Examples
 *
 * This file demonstrates various use cases for the ViewToggle and SegmentedControl components.
 * Copy and adapt these examples for use in your apps.
 */

"use client";

import { useState } from "react";
import { ViewToggle, SegmentedControl } from "./view-toggle";
import {
  LayoutGrid,
  List,
  Calendar,
  LayoutDashboard,
  Table,
  Sun,
  Moon,
  Monitor,
  Layers,
  Grid3x3,
} from "lucide-react";

// ============================================================================
// Example 1: Notes App - Masonry/List Toggle (Default Variant)
// ============================================================================

export function NotesViewToggleExample() {
  const [viewMode, setViewMode] = useState<"masonry" | "list">("masonry");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        Notes App - Glassmorphic View Toggle
      </h3>
      <ViewToggle
        value={viewMode}
        onChange={setViewMode}
        variant="default"
        size="md"
        options={[
          { value: "masonry", icon: LayoutGrid, ariaLabel: "Masonry view" },
          { value: "list", icon: List, ariaLabel: "List view" },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current view: <strong>{viewMode}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// Example 2: Todo App - List/Board/Calendar Toggle (Pills Variant)
// ============================================================================

export function TodoViewToggleExample() {
  const [view, setView] = useState<"list" | "board" | "my-day">("list");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        Todo App - Pills Variant with Icons
      </h3>
      <ViewToggle
        value={view}
        onChange={setView}
        variant="pills"
        size="md"
        options={[
          { value: "list", icon: List, ariaLabel: "List View" },
          { value: "board", icon: LayoutGrid, ariaLabel: "Board View" },
          { value: "my-day", icon: Calendar, ariaLabel: "My Day" },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current view: <strong>{view}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// Example 3: Projects App - Dashboard/Whiteboard Toggle (Pills with Labels)
// ============================================================================

export function ProjectsViewToggleExample() {
  const [viewMode, setViewMode] = useState<"dashboard" | "whiteboard">(
    "dashboard"
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        Projects App - Pills with Icons and Labels
      </h3>
      <ViewToggle
        value={viewMode}
        onChange={setViewMode}
        variant="pills"
        size="md"
        options={[
          {
            value: "dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
          },
          {
            value: "whiteboard",
            icon: LayoutGrid,
            label: "Whiteboard",
          },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current view: <strong>{viewMode}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// Example 4: Tab-Style Toggle
// ============================================================================

export function TabStyleToggleExample() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "history"
  >("overview");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        Tab-Style View Toggle
      </h3>
      <ViewToggle
        value={activeTab}
        onChange={setActiveTab}
        variant="tabs"
        options={[
          { value: "overview", label: "Overview" },
          { value: "details", label: "Details" },
          { value: "history", label: "History" },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current tab: <strong>{activeTab}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// Example 5: Size Variants
// ============================================================================

export function SizeVariantsExample() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-ink-800">Size Variants</h3>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-ink-600 mb-2">Small (sm)</p>
          <ViewToggle
            value={view}
            onChange={setView}
            size="sm"
            variant="pills"
            options={[
              { value: "grid", icon: Grid3x3, label: "Grid" },
              { value: "list", icon: List, label: "List" },
            ]}
          />
        </div>

        <div>
          <p className="text-xs text-ink-600 mb-2">Medium (md) - Default</p>
          <ViewToggle
            value={view}
            onChange={setView}
            size="md"
            variant="pills"
            options={[
              { value: "grid", icon: Grid3x3, label: "Grid" },
              { value: "list", icon: List, label: "List" },
            ]}
          />
        </div>

        <div>
          <p className="text-xs text-ink-600 mb-2">Large (lg)</p>
          <ViewToggle
            value={view}
            onChange={setView}
            size="lg"
            variant="pills"
            options={[
              { value: "grid", icon: Grid3x3, label: "Grid" },
              { value: "list", icon: List, label: "List" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: SegmentedControl - Theme Selector
// ============================================================================

export function ThemeSelectorExample() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        SegmentedControl - Theme Selector
      </h3>
      <SegmentedControl
        value={theme}
        onChange={setTheme}
        options={[
          { value: "light", label: "Light", icon: Sun },
          { value: "dark", label: "Dark", icon: Moon },
          { value: "system", label: "System", icon: Monitor },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current theme: <strong>{theme}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// Example 7: SegmentedControl - Full Width
// ============================================================================

export function FullWidthSegmentedControlExample() {
  const [status, setStatus] = useState<"pending" | "active" | "completed">(
    "active"
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        SegmentedControl - Full Width
      </h3>
      <SegmentedControl
        fullWidth
        value={status}
        onChange={setStatus}
        options={[
          { value: "pending", label: "Pending" },
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current status: <strong>{status}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// Example 8: SegmentedControl - With Disabled Option
// ============================================================================

export function DisabledOptionExample() {
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("free");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        SegmentedControl - With Disabled Option
      </h3>
      <SegmentedControl
        value={plan}
        onChange={setPlan}
        options={[
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro" },
          { value: "enterprise", label: "Enterprise", disabled: true },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current plan: <strong>{plan}</strong>
      </p>
      <p className="text-xs text-ink-500">
        Note: Enterprise option is disabled
      </p>
    </div>
  );
}

// ============================================================================
// Example 9: Multiple View Types
// ============================================================================

export function MultipleViewTypesExample() {
  const [view, setView] = useState<"grid" | "list" | "table" | "timeline">(
    "grid"
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-ink-800">
        Multiple View Types (4 options)
      </h3>
      <ViewToggle
        value={view}
        onChange={setView}
        variant="pills"
        options={[
          { value: "grid", icon: Grid3x3 },
          { value: "list", icon: List },
          { value: "table", icon: Table },
          { value: "timeline", icon: Layers },
        ]}
      />
      <p className="text-sm text-ink-600">
        Current view: <strong>{view}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// All Examples Component
// ============================================================================

export function AllViewToggleExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">
          ViewToggle & SegmentedControl Examples
        </h1>
        <p className="text-ink-600">
          Comprehensive examples demonstrating all variants and use cases
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NotesViewToggleExample />
        <TodoViewToggleExample />
        <ProjectsViewToggleExample />
        <TabStyleToggleExample />
        <ThemeSelectorExample />
        <FullWidthSegmentedControlExample />
        <DisabledOptionExample />
        <MultipleViewTypesExample />
      </div>

      <SizeVariantsExample />

      <div className="pt-8 border-t border-surface-hover">
        <h2 className="text-lg font-semibold text-ink-800 mb-3">
          Keyboard Navigation
        </h2>
        <ul className="space-y-1 text-sm text-ink-600">
          <li>
            <kbd className="px-2 py-1 bg-surface-card border border-surface-hover rounded text-xs">
              ←
            </kbd>{" "}
            <kbd className="px-2 py-1 bg-surface-card border border-surface-hover rounded text-xs">
              →
            </kbd>{" "}
            Navigate between options
          </li>
          <li>
            <kbd className="px-2 py-1 bg-surface-card border border-surface-hover rounded text-xs">
              Home
            </kbd>{" "}
            Jump to first option
          </li>
          <li>
            <kbd className="px-2 py-1 bg-surface-card border border-surface-hover rounded text-xs">
              End
            </kbd>{" "}
            Jump to last option
          </li>
          <li>
            <kbd className="px-2 py-1 bg-surface-card border border-surface-hover rounded text-xs">
              Tab
            </kbd>{" "}
            Move to next control
          </li>
        </ul>
      </div>
    </div>
  );
}
