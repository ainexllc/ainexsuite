# Sidebar Component Suite

A comprehensive, flexible sidebar component system for the AinexSuite monorepo.

## 📦 What's Included

- **`sidebar.tsx`** - Complete Sidebar component implementation (16KB)
  - `Sidebar` - Main wrapper component
  - `SidebarHeader` - Header section with title/icon/action
  - `SidebarSection` - Collapsible section grouping
  - `SidebarItem` - Navigation item (link or button)
  - `SidebarFooter` - Footer section
  - `useSidebarCollapsed` - State management hook with localStorage

- **`sidebar.examples.tsx`** - 12 comprehensive usage examples (15KB)
  - Basic sidebar
  - Collapsible with persistence
  - Mobile overlay
  - Right-positioned
  - Collapsible sections
  - Nested items
  - Custom header actions
  - Badges
  - Button items
  - Full-featured (Notes app style)
  - Styling comparison
  - Todo app style

- **`sidebar.md`** - Complete documentation (12KB)
  - Component API reference
  - Props documentation
  - Usage examples
  - Accessibility guide
  - Migration instructions
  - Best practices

- **`sidebar.quick-ref.md`** - Quick reference guide (5.4KB)
  - Installation
  - Basic template
  - Common patterns
  - Props quick lookup
  - Complete example

- **`SIDEBAR_MIGRATION_GUIDE.md`** - Migration guide (11KB)
  - From Notes app sidebar
  - From Todo app sidebar
  - From NavigationPanel
  - Common patterns
  - Breaking changes
  - Testing checklist

## 🚀 Quick Start

```tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebarCollapsed,
} from '@ainexsuite/ui';

function MyApp() {
  const [collapsed, setCollapsed] = useSidebarCollapsed('my-sidebar', false);

  return (
    <Sidebar collapsed={collapsed} onToggle={setCollapsed}>
      <SidebarHeader title="My App" />
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarSection title="Main">
          <SidebarItem icon={<Home />} label="Dashboard" href="/" active />
        </SidebarSection>
      </div>
    </Sidebar>
  );
}
```

## ✨ Key Features

- **Responsive**: Desktop sidebar with mobile overlay
- **Collapsible**: Toggle between expanded/collapsed states
- **Glassmorphism**: Optional glass styling with backdrop blur
- **Flexible Positioning**: Left or right side
- **Nested Navigation**: Support for hierarchical items
- **Collapsible Sections**: Expandable/collapsible groups
- **Badges**: Display counts or labels
- **State Persistence**: Built-in localStorage hook
- **Fully Accessible**: ARIA labels, keyboard nav, screen reader support
- **TypeScript**: Complete type safety

## 📖 Documentation

| File | Purpose | Size |
|------|---------|------|
| `sidebar.tsx` | Component implementation | 16KB |
| `sidebar.md` | Complete documentation | 12KB |
| `sidebar.quick-ref.md` | Quick reference | 5.4KB |
| `sidebar.examples.tsx` | 12 usage examples | 15KB |
| `SIDEBAR_MIGRATION_GUIDE.md` | Migration guide | 11KB |
| **Total** | | **59.4KB** |

## 🎯 Use Cases

### Notes App
- Collapsible sidebar with label hierarchy
- Glassmorphism styling
- Persistent collapse state
- Mobile overlay

### Todo App
- Fixed-width sidebar with project list
- Solid background styling
- Badge counts for tasks
- Button-based items

### General Apps
- Standard left/right navigation
- Nested menu items
- Section grouping
- Custom header actions

## 🔧 Components

### Sidebar
Main wrapper with responsive behavior, positioning, and styling.

### SidebarHeader
Header section for title, icon, and action button.

### SidebarSection
Grouping component with optional collapse functionality.

### SidebarItem
Navigation item as link or button with icons, badges, and nesting.

### SidebarFooter
Footer section for bottom-aligned actions.

### useSidebarCollapsed
Hook for managing collapsed state with localStorage persistence.

## 📱 Responsive Behavior

- **Desktop (lg+)**: Fixed sidebar, optional collapse
- **Mobile (<lg)**: Slide-in overlay drawer
- **Automatic**: No configuration needed

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support
- Focus management
- Semantic HTML

## 🎨 Styling

### Glassmorphism (Default)
```tsx
<Sidebar glass>
  {/* bg-black/40 backdrop-blur-xl border-white/10 */}
</Sidebar>
```

### Solid Background
```tsx
<Sidebar glass={false}>
  {/* bg-surface-base/85 border-outline-subtle/60 */}
</Sidebar>
```

### Custom Width
```tsx
<Sidebar width={320} />
<Sidebar width="20rem" />
```

## 📦 Exports

From `@ainexsuite/ui`:

```tsx
export {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebarCollapsed,
  type SidebarProps,
  type SidebarPosition,
  type SidebarHeaderProps,
  type SidebarSectionProps,
  type SidebarItemProps,
  type SidebarFooterProps,
} from './layout/sidebar';
```

## 🧪 Testing

Verified with:
- TypeScript compilation (no errors)
- All props properly typed
- Examples compile correctly
- Accessible implementation
- Responsive on desktop/mobile

## 📚 Learn More

- **Full Docs**: Read `sidebar.md` for complete API reference
- **Quick Start**: See `sidebar.quick-ref.md` for common patterns
- **Examples**: Check `sidebar.examples.tsx` for 12+ examples
- **Migration**: Follow `SIDEBAR_MIGRATION_GUIDE.md` to migrate existing sidebars

## 🛠️ Integration

### Install Dependencies
Already included in `@ainexsuite/ui`:
- `react` ^19.2.0
- `next` ^15.5.4
- `lucide-react` ^0.344.0
- `clsx` ^2.1.1

### Import Components
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

### Use in App
```tsx
function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useSidebarCollapsed('app-sidebar');

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} onToggle={setCollapsed}>
        {/* sidebar content */}
      </Sidebar>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## 🎓 Examples

Browse 12 complete examples in `sidebar.examples.tsx`:

1. Basic Sidebar
2. Collapsible with Persistence
3. Mobile Overlay
4. Right-Positioned
5. Collapsible Sections
6. Nested Items
7. Custom Header Actions
8. Badges
9. Button Items
10. Full-Featured (Notes style)
11. Styling Comparison
12. Todo App Style

## 🚦 Status

- ✅ Implementation complete
- ✅ TypeScript types defined
- ✅ Documentation written
- ✅ Examples created
- ✅ Migration guide ready
- ✅ Exported from `@ainexsuite/ui`
- ⏳ Ready for app integration

## 📝 Next Steps

1. Review documentation in `sidebar.md`
2. Try examples in `sidebar.examples.tsx`
3. Follow migration guide for existing apps
4. Test in your app
5. Provide feedback

## 🤝 Contributing

When adding new features:
1. Update `sidebar.tsx` implementation
2. Add example to `sidebar.examples.tsx`
3. Document in `sidebar.md`
4. Update this README
5. Add to Quick Reference if applicable

---

**Created**: November 28, 2025
**Location**: `/packages/ui/src/components/layout/`
**Package**: `@ainexsuite/ui`
**Version**: 1.0.0
