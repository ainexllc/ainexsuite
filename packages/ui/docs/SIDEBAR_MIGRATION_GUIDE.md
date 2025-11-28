# Sidebar Migration Guide

This guide helps you migrate from app-specific sidebar implementations to the unified Sidebar component in `@ainexsuite/ui`.

## Overview

The new unified Sidebar component consolidates patterns from:
- Notes app: Collapsible sidebar with labels
- Todo app: Fixed sidebar with project lists
- Navigation Panel: Mobile-first drawer pattern

## Benefits of Migration

- **Consistent UX**: Same behavior across all apps
- **Reduced Code**: Eliminate duplicate sidebar implementations
- **Better Accessibility**: Built-in ARIA support
- **Mobile-Responsive**: Automatic mobile overlay
- **State Persistence**: Built-in localStorage hook
- **Type Safety**: Full TypeScript support

## Migration Checklist

- [ ] Install `@ainexsuite/ui` (already in monorepo)
- [ ] Import new Sidebar components
- [ ] Replace old sidebar component
- [ ] Update state management
- [ ] Test desktop and mobile layouts
- [ ] Verify keyboard navigation
- [ ] Remove old sidebar file

## From Notes App

### Before (Notes App Sidebar)

```tsx
// apps/notes/src/components/layout/sidebar.tsx
import { Sidebar } from "@/components/layout/sidebar";

function NotesApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
  );
}
```

### After (Unified Sidebar)

```tsx
// apps/notes/src/components/layout/notes-sidebar.tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  useSidebarCollapsed,
} from "@ainexsuite/ui";
import { useLabels } from "@/components/providers/labels-provider";

function NotesApp() {
  const [collapsed, setCollapsed] = useSidebarCollapsed("notes-sidebar", false);
  const [isOpen, setIsOpen] = useState(false);
  const { labels } = useLabels();

  return (
    <Sidebar
      collapsed={collapsed}
      onToggle={setCollapsed}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Workspace">
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="All Notes"
            href="/"
            active
            collapsible={collapsed}
          />
        </SidebarSection>

        {!collapsed && (
          <SidebarSection title="Labels">
            {labels.map(label => (
              <SidebarItem
                key={label.id}
                label={label.name}
                href={`/labels/${label.id}`}
              />
            ))}
          </SidebarSection>
        )}
      </div>
    </Sidebar>
  );
}
```

### Key Changes

1. **Component Structure**: Compose with `SidebarSection` and `SidebarItem`
2. **State Hook**: Use `useSidebarCollapsed` for persistence
3. **Conditional Rendering**: Wrap sections in `{!collapsed && ...}` for collapsible behavior
4. **Props**: Simplified prop names (`collapsed` vs `isCollapsed`)

## From Todo App

### Before (Todo Sidebar)

```tsx
// apps/todo/src/components/sidebar.tsx
interface SidebarProps {
  projects: TodoProject[];
  selectedProject: string | null;
  onSelectProject: (projectId: string | null) => void;
  viewFilter: ViewFilter;
  onViewFilterChange: (filter: ViewFilter) => void;
}

function TodoSidebar({
  projects,
  selectedProject,
  onSelectProject,
  viewFilter,
  onViewFilterChange,
}: SidebarProps) {
  return (
    <aside className="w-[280px] h-[calc(100vh-64px)] surface-elevated">
      {/* Custom sidebar implementation */}
    </aside>
  );
}
```

### After (Unified Sidebar)

```tsx
// apps/todo/src/components/todo-sidebar.tsx
import {
  Sidebar,
  SidebarSection,
  SidebarItem,
} from "@ainexsuite/ui";

interface TodoSidebarProps {
  projects: TodoProject[];
  selectedProject: string | null;
  onSelectProject: (projectId: string | null) => void;
}

function TodoSidebar({
  projects,
  selectedProject,
  onSelectProject,
}: TodoSidebarProps) {
  return (
    <Sidebar width={280} glass={false}>
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Main Views">
          <SidebarItem
            icon={<Inbox className="h-5 w-5" />}
            label="All Tasks"
            onClick={() => onSelectProject(null)}
            active={selectedProject === null}
            badge={24}
          />
        </SidebarSection>

        <SidebarSection title="Projects">
          {projects.map(project => (
            <SidebarItem
              key={project.id}
              icon={<Folder className="h-4 w-4" />}
              label={project.name}
              onClick={() => onSelectProject(project.id)}
              active={selectedProject === project.id}
            />
          ))}
        </SidebarSection>
      </div>
    </Sidebar>
  );
}
```

### Key Changes

1. **Remove Custom Styling**: Use built-in sidebar styles
2. **Button Items**: Use `onClick` instead of custom handlers
3. **Active State**: Pass `active` prop instead of custom classes
4. **Sections**: Group items with `SidebarSection`

## From Navigation Panel (Shared Component)

### Before (NavigationPanel)

```tsx
import { NavigationPanel } from "@ainexsuite/ui";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NavigationPanel
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      sections={sections}
      pathname={pathname}
    />
  );
}
```

### After (Unified Sidebar)

```tsx
import { Sidebar, SidebarSection, SidebarItem } from "@ainexsuite/ui";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="flex-1 overflow-y-auto px-3">
        {sections.map(section => (
          <SidebarSection key={section.title} title={section.title}>
            {section.items.map(item => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
              />
            ))}
          </SidebarSection>
        ))}
      </div>
    </Sidebar>
  );
}
```

### Key Changes

1. **Manual Mapping**: Loop through sections/items manually
2. **Flexibility**: More control over rendering
3. **Active Detection**: Handle active state in parent component

## Common Migration Patterns

### Pattern 1: Collapsible Sections

**Before:**
```tsx
const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
```

**After:**
```tsx
<SidebarSection title="Projects" collapsible defaultExpanded>
  {/* items */}
</SidebarSection>
```

### Pattern 2: Nested Navigation

**Before:**
```tsx
<div style={{ paddingLeft: `${depth * 16}px` }}>
  {label}
</div>
```

**After:**
```tsx
<SidebarItem label="Parent" href="/parent" />
<SidebarItem label="Child" href="/parent/child" indent={1} />
<SidebarItem label="Grandchild" href="/parent/child/grandchild" indent={2} />
```

### Pattern 3: Badge Counts

**Before:**
```tsx
<span className="badge">{count}</span>
```

**After:**
```tsx
<SidebarItem label="Inbox" href="/inbox" badge={count} />
```

### Pattern 4: Mobile Overlay

**Before:**
```tsx
<div className={clsx("overlay", isOpen && "show")}>
  <div className="sidebar-content" onClick={e => e.stopPropagation()}>
    {/* content */}
  </div>
</div>
```

**After:**
```tsx
<Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
  {/* content - overlay handled automatically */}
</Sidebar>
```

## Breaking Changes

### Removed Props

- `isCollapsed` → Use `collapsed` instead
- `sections` → Manually compose with `SidebarSection`
- `pathname` → Handle active state in parent
- `customContent` → Use children composition

### Changed Behavior

- **Default Width**: Now 280px (was variable)
- **Glass Effect**: Enabled by default (set `glass={false}` for solid)
- **Collapse Toggle**: Shows on desktop by default
- **Mobile Overlay**: Automatic (was manual)

## Testing After Migration

### Desktop Checklist

- [ ] Sidebar renders correctly
- [ ] Collapse/expand works
- [ ] Navigation items are clickable
- [ ] Active states display correctly
- [ ] Sections expand/collapse (if applicable)
- [ ] Badges display correctly
- [ ] Footer renders properly

### Mobile Checklist

- [ ] Mobile menu button triggers overlay
- [ ] Overlay slides in from correct side
- [ ] Clicking overlay closes it
- [ ] Navigation closes overlay on click
- [ ] Touch targets are appropriately sized
- [ ] Scrolling works in overlay

### Accessibility Checklist

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels are present
- [ ] Focus states are visible
- [ ] Screen reader announces correctly
- [ ] Active states are programmatic

## Rollback Plan

If you need to rollback:

1. Keep old sidebar file as `sidebar.backup.tsx`
2. Restore old component imports
3. Remove new Sidebar usage
4. Report issues to UI package maintainers

## Support

- Documentation: `/packages/ui/src/components/layout/sidebar.md`
- Examples: `/packages/ui/src/components/layout/sidebar.examples.tsx`
- Quick Ref: `/packages/ui/src/components/layout/sidebar.quick-ref.md`

## Example: Full Notes App Migration

```tsx
// apps/notes/src/app/layout.tsx
"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebarCollapsed,
} from "@ainexsuite/ui";
import { usePathname } from "next/navigation";
import { Home, FileText, Tag, Settings, LogOut } from "lucide-react";

export function NotesLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useSidebarCollapsed("notes-sidebar", false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={setCollapsed}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarSection title="Workspace">
            <SidebarItem
              icon={<Home className="h-4 w-4" />}
              label="All Notes"
              href="/"
              active={pathname === "/"}
              badge={42}
              collapsible={collapsed}
            />
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Recent"
              href="/recent"
              active={pathname === "/recent"}
              collapsible={collapsed}
            />
          </SidebarSection>

          {!collapsed && (
            <SidebarSection title="Labels" collapsible>
              <SidebarItem
                icon={<Tag className="h-4 w-4" />}
                label="Important"
                href="/labels/important"
                badge={5}
              />
            </SidebarSection>
          )}
        </div>

        <SidebarFooter>
          {collapsed ? (
            <button className="icon-button w-full">
              <Settings className="h-4 w-4" />
            </button>
          ) : (
            <div className="space-y-2">
              <SidebarItem
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
                href="/settings"
              />
              <SidebarItem
                icon={<LogOut className="h-4 w-4" />}
                label="Sign Out"
                onClick={handleSignOut}
              />
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## Next Steps

1. Start with one app (e.g., notes)
2. Test thoroughly
3. Migrate remaining apps
4. Remove old sidebar implementations
5. Update documentation
