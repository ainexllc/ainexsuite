# Sidebar Component - Quick Reference

## Installation

```tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebarCollapsed,
} from '@ainexsuite/ui';
```

## Basic Template

```tsx
function MyApp() {
  const [collapsed, setCollapsed] = useSidebarCollapsed('my-app-sidebar', false);

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} onToggle={setCollapsed}>
        <SidebarHeader title="My App" />
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarSection title="Main">
            <SidebarItem icon={<Home />} label="Home" href="/" active />
          </SidebarSection>
        </div>
        <SidebarFooter>
          <button>Sign Out</button>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1">
        {/* Your app content */}
      </main>
    </div>
  );
}
```

## Common Patterns

### Link Item
```tsx
<SidebarItem
  icon={<Home className="h-4 w-4" />}
  label="Dashboard"
  href="/"
  active
  badge={5}
/>
```

### Button Item
```tsx
<SidebarItem
  icon={<Search className="h-4 w-4" />}
  label="Search"
  onClick={handleSearch}
/>
```

### Nested Item
```tsx
<SidebarItem label="Parent" href="/parent" />
<SidebarItem label="Child" href="/parent/child" indent={1} />
<SidebarItem label="Grandchild" href="/parent/child/grandchild" indent={2} />
```

### Collapsible Section
```tsx
<SidebarSection title="Projects" collapsible defaultExpanded>
  {/* items */}
</SidebarSection>
```

## Mobile Support

```tsx
function ResponsiveApp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="lg:hidden">
        <Menu />
      </button>

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {/* sidebar content */}
      </Sidebar>
    </>
  );
}
```

## Props Quick Lookup

### Sidebar
- `width` - number | string (default: 280)
- `collapsed` - boolean (default: false)
- `onToggle` - (collapsed: boolean) => void
- `position` - 'left' | 'right' (default: 'left')
- `glass` - boolean (default: true)
- `isOpen` - boolean (mobile overlay)
- `onClose` - () => void (mobile overlay)

### SidebarHeader
- `title` - string
- `icon` - ReactNode
- `action` - ReactNode
- `children` - ReactNode (overrides title/icon)

### SidebarSection
- `title` - string
- `collapsible` - boolean (default: false)
- `defaultExpanded` - boolean (default: true)

### SidebarItem
- `icon` - ReactNode
- `label` - string (required)
- `href` - string (for links)
- `onClick` - () => void (for buttons)
- `active` - boolean
- `badge` - string | number
- `indent` - number (default: 0)
- `collapsible` - boolean (show only icon when collapsed)

### SidebarFooter
- `children` - ReactNode

## State Management

```tsx
// With persistence
const [collapsed, setCollapsed] = useSidebarCollapsed('sidebar-key', false);

// Without persistence
const [collapsed, setCollapsed] = useState(false);
```

## Styling Options

```tsx
// Glassmorphism (default)
<Sidebar glass />

// Solid background
<Sidebar glass={false} />

// Custom width
<Sidebar width={320} />
<Sidebar width="20rem" />

// Right-side
<Sidebar position="right" />
```

## Layout Structure

```tsx
<Sidebar>
  {/* Optional: Header */}
  <SidebarHeader title="..." />

  {/* Required: Scrollable content */}
  <div className="flex-1 overflow-y-auto px-3">
    <SidebarSection title="...">
      <SidebarItem ... />
    </SidebarSection>
  </div>

  {/* Optional: Footer */}
  <SidebarFooter>...</SidebarFooter>
</Sidebar>
```

## Complete Example

```tsx
import { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebarCollapsed,
} from '@ainexsuite/ui';
import { Home, Folder, Settings, LogOut } from 'lucide-react';

export function AppSidebar() {
  const [collapsed, setCollapsed] = useSidebarCollapsed('app-sidebar', false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sidebar
      collapsed={collapsed}
      onToggle={setCollapsed}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Main">
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            href="/"
            active
            badge={3}
            collapsible={collapsed}
          />
        </SidebarSection>

        {!collapsed && (
          <SidebarSection title="Projects" collapsible>
            <SidebarItem
              icon={<Folder className="h-4 w-4" />}
              label="Work"
              href="/projects/work"
            />
            <SidebarItem
              label="Marketing"
              href="/projects/work/marketing"
              indent={1}
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
            <button className="flex w-full items-center gap-2 px-3 py-2">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button className="flex w-full items-center gap-2 px-3 py-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
```
