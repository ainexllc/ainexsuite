# Sidebar Component System

A flexible, accessible sidebar component system with support for collapsible states, mobile overlays, glassmorphism styling, and nested navigation.

## Features

- **Responsive Design**: Desktop sidebar with mobile overlay
- **Collapsible State**: Toggle between expanded and collapsed views
- **Glassmorphism**: Optional glass styling with backdrop blur
- **Position Support**: Left or right positioning
- **Mobile Overlay**: Slide-in drawer on mobile devices
- **Nested Items**: Support for hierarchical navigation
- **Collapsible Sections**: Expandable/collapsible section groups
- **Badges**: Display counts or labels on items
- **Accessibility**: Full ARIA support and keyboard navigation
- **State Persistence**: Built-in localStorage hook
- **TypeScript**: Full type safety

## Components

### Sidebar

Main wrapper component that handles layout, positioning, and responsive behavior.

```tsx
<Sidebar
  width={280}
  collapsed={false}
  onToggle={(collapsed) => setCollapsed(collapsed)}
  position="left"
  glass={true}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
>
  {/* Sidebar content */}
</Sidebar>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `280` | Sidebar width (px or CSS value) |
| `collapsed` | `boolean` | `false` | Whether sidebar is collapsed |
| `onToggle` | `(collapsed: boolean) => void` | - | Callback when collapse state changes |
| `position` | `'left' \| 'right'` | `'left'` | Sidebar position |
| `className` | `string` | - | Custom className |
| `children` | `ReactNode` | - | Child components |
| `showCollapseToggle` | `boolean` | `true` | Show collapse toggle button |
| `showCloseButton` | `boolean` | `true` | Show close button on mobile |
| `onClose` | `() => void` | - | Close handler for mobile overlay |
| `isOpen` | `boolean` | `false` | Mobile overlay open state |
| `glass` | `boolean` | `true` | Enable glassmorphism styling |

### SidebarHeader

Header section for title, icon, and actions.

```tsx
<SidebarHeader
  title="Navigation"
  icon={<Folder />}
  action={<Button>New</Button>}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Header title |
| `icon` | `ReactNode` | Header icon |
| `action` | `ReactNode` | Action element |
| `className` | `string` | Custom className |
| `children` | `ReactNode` | Child components (overrides title/icon) |

### SidebarSection

Grouping component for navigation items with optional collapse.

```tsx
<SidebarSection
  title="Projects"
  collapsible
  defaultExpanded={true}
>
  {/* Section items */}
</SidebarSection>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Section title |
| `collapsible` | `boolean` | `false` | Whether section is collapsible |
| `defaultExpanded` | `boolean` | `true` | Default expanded state |
| `className` | `string` | - | Custom className |
| `children` | `ReactNode` | - | Child components |

### SidebarItem

Navigation item component (link or button).

```tsx
<SidebarItem
  icon={<Home />}
  label="Dashboard"
  href="/"
  active
  badge="3"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | Item icon |
| `label` | `string` | - | Item label (required) |
| `href` | `string` | - | Link href (makes it a link) |
| `onClick` | `() => void` | - | Click handler (makes it a button) |
| `active` | `boolean` | `false` | Whether item is active |
| `badge` | `string \| number` | - | Badge text/count |
| `indent` | `number` | `0` | Indent level (for nested items) |
| `disabled` | `boolean` | `false` | Whether item is disabled |
| `className` | `string` | - | Custom className |
| `collapsible` | `boolean` | `false` | Show only icon when collapsed |

### SidebarFooter

Footer section for actions at the bottom.

```tsx
<SidebarFooter>
  <button>Sign Out</button>
</SidebarFooter>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Custom className |
| `children` | `ReactNode` | Child components |

## Hook: useSidebarCollapsed

Hook for managing sidebar collapsed state with localStorage persistence.

```tsx
const [collapsed, setCollapsed] = useSidebarCollapsed('my-sidebar', false);

<Sidebar collapsed={collapsed} onToggle={setCollapsed}>
  {/* ... */}
</Sidebar>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | `string` | - | localStorage key for persistence |
| `defaultCollapsed` | `boolean` | `false` | Default collapsed state |

### Returns

`[boolean, (collapsed: boolean) => void]` - Tuple of [collapsed state, setter function]

## Usage Examples

### Basic Sidebar

```tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from '@ainexsuite/ui';
import { Home, Settings, LogOut } from 'lucide-react';

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader title="Navigation" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Main">
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="Home"
            href="/"
            active
          />
          <SidebarItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            href="/settings"
          />
        </SidebarSection>
      </div>
      <SidebarFooter>
        <button className="flex items-center gap-2 w-full px-3 py-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
```

### Collapsible Sidebar with Persistence

```tsx
import { Sidebar, SidebarItem, useSidebarCollapsed } from '@ainexsuite/ui';

function CollapsibleSidebar() {
  const [collapsed, setCollapsed] = useSidebarCollapsed('app-sidebar', false);

  return (
    <Sidebar collapsed={collapsed} onToggle={setCollapsed}>
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarItem
          icon={<Home className="h-4 w-4" />}
          label="Home"
          href="/"
          collapsible={collapsed}
        />
      </div>
    </Sidebar>
  );
}
```

### Mobile-Responsive Sidebar

```tsx
import { useState } from 'react';
import { Sidebar, SidebarItem } from '@ainexsuite/ui';
import { Menu } from 'lucide-react';

function ResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarItem
            label="Home"
            href="/"
            onClick={() => setIsOpen(false)}
          />
        </div>
      </Sidebar>
    </>
  );
}
```

### Nested Navigation

```tsx
<Sidebar>
  <SidebarSection title="Files">
    <SidebarItem
      icon={<Folder className="h-4 w-4" />}
      label="src"
      href="/src"
    />
    <SidebarItem
      label="components"
      href="/src/components"
      indent={1}
    />
    <SidebarItem
      label="Button.tsx"
      href="/src/components/button"
      indent={2}
    />
  </SidebarSection>
</Sidebar>
```

### Collapsible Sections

```tsx
<Sidebar>
  <SidebarSection title="Projects" collapsible defaultExpanded>
    <SidebarItem label="Work" href="/work" />
    <SidebarItem label="Personal" href="/personal" />
  </SidebarSection>

  <SidebarSection title="Archive" collapsible defaultExpanded={false}>
    <SidebarItem label="Old Projects" href="/archive" />
  </SidebarSection>
</Sidebar>
```

### With Badges

```tsx
<Sidebar>
  <SidebarSection title="Inbox">
    <SidebarItem
      label="All Messages"
      href="/messages"
      badge={12}
    />
    <SidebarItem
      label="Unread"
      href="/unread"
      badge="NEW"
    />
  </SidebarSection>
</Sidebar>
```

### Button Items (Non-link)

```tsx
<Sidebar>
  <SidebarSection title="Actions">
    <SidebarItem
      icon={<Search className="h-4 w-4" />}
      label="Search"
      onClick={() => console.log('Search clicked')}
    />
  </SidebarSection>
</Sidebar>
```

### Right-Positioned Sidebar

```tsx
<Sidebar position="right" width={320}>
  <SidebarHeader title="Details" />
  <div className="flex-1 overflow-y-auto px-3">
    <p>Sidebar content on the right side</p>
  </div>
</Sidebar>
```

### Full-Featured Example

```tsx
function FullSidebar() {
  const [collapsed, setCollapsed] = useSidebarCollapsed('notes-sidebar', false);
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
        <SidebarSection title="Workspace">
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="All Notes"
            href="/"
            active
            badge={42}
            collapsible={collapsed}
          />
        </SidebarSection>

        {!collapsed && (
          <SidebarSection title="Projects" collapsible>
            <SidebarItem label="Work" href="/work" />
            <SidebarItem label="Team Docs" href="/work/team" indent={1} />
          </SidebarSection>
        )}
      </div>

      <SidebarFooter>
        {collapsed ? (
          <button className="icon-button w-full">
            <Settings className="h-4 w-4" />
          </button>
        ) : (
          <button className="flex items-center gap-2 w-full px-3 py-2">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
```

## Styling

### Glassmorphism (Default)

```tsx
<Sidebar glass>
  {/* Glassmorphism with backdrop blur */}
</Sidebar>
```

### Solid Background

```tsx
<Sidebar glass={false}>
  {/* Solid background */}
</Sidebar>
```

### Custom Width

```tsx
<Sidebar width={320}>
  {/* 320px width */}
</Sidebar>

<Sidebar width="20rem">
  {/* 20rem width */}
</Sidebar>
```

## Accessibility

The Sidebar component system is fully accessible:

- **ARIA Labels**: Proper `aria-label` and `aria-current` attributes
- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Readers**: Semantic HTML and descriptive labels
- **Focus Indicators**: Clear visual focus states
- **Mobile Touch Targets**: Appropriately sized touch targets

### Keyboard Navigation

- **Tab/Shift+Tab**: Navigate between items
- **Enter/Space**: Activate links or buttons
- **Escape**: Close mobile overlay

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Migration from Existing Sidebars

### From Notes App Sidebar

```tsx
// Before
<NotesAppSidebar isOpen={isOpen} onClose={onClose} />

// After
<Sidebar isOpen={isOpen} onClose={onClose}>
  <div className="flex-1 overflow-y-auto px-3">
    {/* Your sections */}
  </div>
</Sidebar>
```

### From Todo App Sidebar

```tsx
// Before
<TodoSidebar
  projects={projects}
  selectedProject={selected}
  onSelectProject={setSelected}
/>

// After
<Sidebar>
  <SidebarSection title="Projects">
    {projects.map(project => (
      <SidebarItem
        key={project.id}
        label={project.name}
        href={`/projects/${project.id}`}
        active={selected === project.id}
      />
    ))}
  </SidebarSection>
</Sidebar>
```

## Best Practices

1. **Overflow Handling**: Always wrap scrollable content in `flex-1 overflow-y-auto px-3`
2. **Mobile UX**: Use `isOpen` and `onClose` for mobile overlay behavior
3. **State Persistence**: Use `useSidebarCollapsed` hook for better UX
4. **Collapsible Sections**: Group related items in collapsible sections
5. **Accessibility**: Always provide `label` for all items
6. **Performance**: Use React.memo for large item lists
7. **Responsive**: Test on mobile devices for touch interactions

## See Also

- [NavigationPanel](./navigation-panel.tsx) - Alternative mobile-first navigation
- [AppShell](./app-shell.tsx) - Complete app layout with sidebar support
- [TopNav](./top-nav.tsx) - Top navigation bar component
