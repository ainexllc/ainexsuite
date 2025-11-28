/**
 * Sidebar Component Examples
 *
 * This file demonstrates various usage patterns for the Sidebar component system.
 */

import { useState } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebarCollapsed,
} from "./sidebar";
import {
  Home,
  Settings,
  User,
  FileText,
  Folder,
  LogOut,
  Plus,
  Search,
} from "lucide-react";

// ============================================================================
// Example 1: Basic Sidebar
// ============================================================================

export function BasicSidebarExample() {
  return (
    <Sidebar>
      <SidebarHeader title="Navigation" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Main">
          <SidebarItem icon={<Home className="h-4 w-4" />} label="Home" href="/" active />
          <SidebarItem icon={<FileText className="h-4 w-4" />} label="Documents" href="/docs" />
          <SidebarItem icon={<Folder className="h-4 w-4" />} label="Projects" href="/projects" />
        </SidebarSection>
        <SidebarSection title="Settings">
          <SidebarItem icon={<Settings className="h-4 w-4" />} label="Settings" href="/settings" />
          <SidebarItem icon={<User className="h-4 w-4" />} label="Profile" href="/profile" />
        </SidebarSection>
      </div>
      <SidebarFooter>
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-surface-muted">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

// ============================================================================
// Example 2: Collapsible Sidebar with Persistence
// ============================================================================

export function CollapsibleSidebarExample() {
  const [collapsed, setCollapsed] = useSidebarCollapsed("app-sidebar", false);

  return (
    <Sidebar collapsed={collapsed} onToggle={setCollapsed}>
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title={collapsed ? "" : "Navigation"}>
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="Home"
            href="/"
            collapsible={collapsed}
            active
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Documents"
            href="/docs"
            collapsible={collapsed}
            badge="5"
          />
        </SidebarSection>
      </div>
    </Sidebar>
  );
}

// ============================================================================
// Example 3: Sidebar with Mobile Overlay
// ============================================================================

export function MobileSidebarExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2"
      >
        Open Menu
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarSection title="Menu">
            <SidebarItem
              icon={<Home className="h-4 w-4" />}
              label="Home"
              href="/"
              onClick={() => setIsOpen(false)}
            />
            <SidebarItem
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              href="/settings"
              onClick={() => setIsOpen(false)}
            />
          </SidebarSection>
        </div>
      </Sidebar>
    </>
  );
}

// ============================================================================
// Example 4: Right-Positioned Sidebar
// ============================================================================

export function RightSidebarExample() {
  return (
    <Sidebar position="right" width={320}>
      <SidebarHeader title="Details" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Information">
          <div className="space-y-2 px-3 py-2">
            <p className="text-sm text-ink-700">File details and metadata go here.</p>
          </div>
        </SidebarSection>
      </div>
    </Sidebar>
  );
}

// ============================================================================
// Example 5: Sidebar with Collapsible Sections
// ============================================================================

export function CollapsibleSectionsExample() {
  return (
    <Sidebar>
      <SidebarHeader title="File Browser" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Favorites" collapsible defaultExpanded>
          <SidebarItem icon={<Folder className="h-4 w-4" />} label="Work" href="/work" />
          <SidebarItem icon={<Folder className="h-4 w-4" />} label="Personal" href="/personal" />
        </SidebarSection>

        <SidebarSection title="Recent" collapsible defaultExpanded={false}>
          <SidebarItem icon={<FileText className="h-4 w-4" />} label="Document 1" href="/doc1" />
          <SidebarItem icon={<FileText className="h-4 w-4" />} label="Document 2" href="/doc2" />
        </SidebarSection>

        <SidebarSection title="Projects" collapsible>
          <SidebarItem icon={<Folder className="h-4 w-4" />} label="Project A" href="/project-a" />
          <SidebarItem icon={<Folder className="h-4 w-4" />} label="Project B" href="/project-b" />
        </SidebarSection>
      </div>
    </Sidebar>
  );
}

// ============================================================================
// Example 6: Sidebar with Nested Items
// ============================================================================

export function NestedItemsExample() {
  return (
    <Sidebar>
      <SidebarHeader title="Explorer" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Files">
          <SidebarItem icon={<Folder className="h-4 w-4" />} label="src" href="/src" />
          <SidebarItem label="components" href="/src/components" indent={1} />
          <SidebarItem label="Button.tsx" href="/src/components/button" indent={2} />
          <SidebarItem label="Input.tsx" href="/src/components/input" indent={2} />
          <SidebarItem label="utils" href="/src/utils" indent={1} />
          <SidebarItem icon={<Folder className="h-4 w-4" />} label="public" href="/public" />
        </SidebarSection>
      </div>
    </Sidebar>
  );
}

// ============================================================================
// Example 7: Sidebar with Custom Header Actions
// ============================================================================

export function CustomHeaderExample() {
  return (
    <Sidebar>
      <SidebarHeader
        title="Projects"
        icon={<Folder className="h-5 w-5" />}
        action={
          <button className="icon-button" title="New project">
            <Plus className="h-4 w-4" />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection>
          <SidebarItem label="Project 1" href="/project-1" />
          <SidebarItem label="Project 2" href="/project-2" />
        </SidebarSection>
      </div>
    </Sidebar>
  );
}

// ============================================================================
// Example 8: Sidebar with Badges
// ============================================================================

export function BadgesExample() {
  return (
    <Sidebar>
      <SidebarHeader title="Notifications" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Inbox">
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="All Messages"
            href="/messages"
            badge={12}
            active
          />
          <SidebarItem
            icon={<User className="h-4 w-4" />}
            label="Direct Messages"
            href="/dm"
            badge="3"
          />
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="Mentions"
            href="/mentions"
            badge="NEW"
          />
        </SidebarSection>
      </div>
    </Sidebar>
  );
}

// ============================================================================
// Example 9: Sidebar with Button Items
// ============================================================================

export function ButtonItemsExample() {
  const handleLogout = () => console.log("Logging out...");
  const handleSearch = () => console.log("Opening search...");

  return (
    <Sidebar>
      <SidebarHeader title="Actions" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Quick Actions">
          <SidebarItem
            icon={<Search className="h-4 w-4" />}
            label="Search"
            onClick={handleSearch}
          />
          <SidebarItem
            icon={<Plus className="h-4 w-4" />}
            label="New Document"
            onClick={() => console.log("New document")}
          />
        </SidebarSection>
      </div>
      <SidebarFooter>
        <SidebarItem
          icon={<LogOut className="h-4 w-4" />}
          label="Sign Out"
          onClick={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

// ============================================================================
// Example 10: Full-Featured Sidebar (Notes App Style)
// ============================================================================

export function FullFeaturedExample() {
  const [collapsed, setCollapsed] = useSidebarCollapsed("notes-sidebar", false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sidebar
      collapsed={collapsed}
      onToggle={setCollapsed}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      width={280}
      glass
    >
      <div className="flex-1 overflow-y-auto px-3">
        {/* Main Navigation */}
        <SidebarSection title="Workspace">
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="All Notes"
            href="/"
            active
            badge={42}
            collapsible={collapsed}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Recent"
            href="/recent"
            collapsible={collapsed}
          />
          <SidebarItem
            icon={<User className="h-4 w-4" />}
            label="Shared"
            href="/shared"
            badge="3"
            collapsible={collapsed}
          />
        </SidebarSection>

        {/* Projects */}
        {!collapsed && (
          <SidebarSection title="Projects" collapsible defaultExpanded>
            <SidebarItem
              icon={<Folder className="h-4 w-4" />}
              label="Work"
              href="/projects/work"
            />
            <SidebarItem label="Q1 Planning" href="/projects/work/q1" indent={1} />
            <SidebarItem label="Team Docs" href="/projects/work/team" indent={1} />
            <SidebarItem
              icon={<Folder className="h-4 w-4" />}
              label="Personal"
              href="/projects/personal"
            />
          </SidebarSection>
        )}

        {/* Tags */}
        {!collapsed && (
          <SidebarSection title="Tags" collapsible defaultExpanded={false}>
            <SidebarItem label="Important" href="/tags/important" badge={5} />
            <SidebarItem label="Ideas" href="/tags/ideas" badge={12} />
            <SidebarItem label="To Review" href="/tags/review" badge={3} />
          </SidebarSection>
        )}
      </div>

      {/* Footer */}
      <SidebarFooter>
        {collapsed ? (
          <button className="icon-button w-full">
            <Settings className="h-4 w-4" />
          </button>
        ) : (
          <div className="space-y-2">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-surface-muted">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-surface-muted">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

// ============================================================================
// Example 11: Glassmorphism vs Solid Background
// ============================================================================

export function StylingComparisonExample() {
  return (
    <div className="flex gap-4">
      {/* Glassmorphism (default) */}
      <Sidebar glass width={280}>
        <SidebarHeader title="Glass Style" />
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarSection title="Navigation">
            <SidebarItem icon={<Home className="h-4 w-4" />} label="Home" href="/" />
          </SidebarSection>
        </div>
      </Sidebar>

      {/* Solid background */}
      <Sidebar glass={false} width={280}>
        <SidebarHeader title="Solid Style" />
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarSection title="Navigation">
            <SidebarItem icon={<Home className="h-4 w-4" />} label="Home" href="/" />
          </SidebarSection>
        </div>
      </Sidebar>
    </div>
  );
}

// ============================================================================
// Example 12: Todo App Style Sidebar
// ============================================================================

export function TodoSidebarExample() {
  return (
    <Sidebar width={280} glass={false}>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <SidebarSection>
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            label="All Tasks"
            href="/all"
            active
            badge={24}
          />
          <SidebarItem
            icon={<FileText className="h-5 w-5" />}
            label="Today"
            href="/today"
            badge={5}
          />
          <SidebarItem
            icon={<Folder className="h-5 w-5" />}
            label="Upcoming"
            href="/upcoming"
            badge={12}
          />
        </SidebarSection>

        <SidebarSection title="Projects">
          <div className="space-y-1">
            <SidebarItem
              icon={<div className="h-3 w-3 rounded-full bg-blue-500" />}
              label="Work"
              href="/projects/work"
            />
            <SidebarItem
              icon={<div className="h-3 w-3 rounded-full bg-green-500" />}
              label="Personal"
              href="/projects/personal"
            />
            <SidebarItem
              icon={<div className="h-3 w-3 rounded-full bg-purple-500" />}
              label="Shopping"
              href="/projects/shopping"
            />
          </div>
        </SidebarSection>
      </div>
    </Sidebar>
  );
}
