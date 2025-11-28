# Design Tokens Usage Examples

Real-world examples of using the unified design tokens system across AINexSuite apps.

## Example 1: Simple Card Component

Using presets for quick implementation:

```tsx
import { cardStyles } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

export function NoteCard({ title, content, onClick }: NoteCardProps) {
  return (
    <div className={cn(cardStyles.base, cardStyles.hover)} onClick={onClick}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[rgb(var(--color-ink-700))]">{content}</p>
    </div>
  );
}
```

## Example 2: Typed Card with Variants

Using component variants for type-safe props:

```tsx
import { cardVariants, type CardVariantProps } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

interface CardProps extends CardVariantProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  rounded,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cn(
        cardVariants({ variant, padding, interactive, rounded }),
        className
      )}
    >
      {children}
    </div>
  );
}

// Usage
<Card variant="elevated" padding="lg" interactive>
  <h2>Clickable elevated card</h2>
</Card>
```

## Example 3: Journey App Glass Card

Using glassmorphism presets:

```tsx
import { glass, spacing, radius } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

export function JourneyEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <div
      className={cn(glass.card, 'p-6')}
      style={{
        borderRadius: radius.xl,
        marginBottom: spacing.md,
      }}
    >
      <h3 className="text-xl font-bold text-white mb-3">{entry.title}</h3>
      <p className="text-white/80">{entry.content}</p>
    </div>
  );
}
```

## Example 4: Button with Multiple Variants

Using button variants with all options:

```tsx
import { buttonVariants, type ButtonVariantProps } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage examples
<Button variant="primary" size="lg">Save Changes</Button>
<Button variant="secondary" size="md">Cancel</Button>
<Button variant="ghost" size="sm">Close</Button>
<Button variant="danger" fullWidth>Delete Account</Button>
```

## Example 5: Form with Input Variants

Using input variants for consistent form styling:

```tsx
import { inputVariants, type InputVariantProps } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputVariants({
            size: 'md',
            state: error ? 'error' : 'default',
          })}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputVariants({ size: 'md', state: 'default' })}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className={alertVariants({ variant: 'error' })}>{error}</div>
      )}

      <button
        type="submit"
        className={buttonVariants({ variant: 'primary', fullWidth: true })}
      >
        Sign In
      </button>
    </form>
  );
}
```

## Example 6: Navigation with Presets

Using navigation presets for consistent header/sidebar:

```tsx
import { navigationStyles } from '@ainexsuite/ui';
import { Home, FileText, Calendar } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [activeRoute, setActiveRoute] = useState('/');

  return (
    <div>
      {/* Header */}
      <header className={navigationStyles.header}>
        <div className={navigationStyles.headerContainer}>
          <h1 className="text-xl font-bold">AINexSuite</h1>
          <div className="flex items-center gap-4">
            <button>Notifications</button>
            <button>Profile</button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={navigationStyles.sidebar}>
        <nav className="p-4 space-y-2">
          <a
            href="/"
            className={
              activeRoute === '/'
                ? navigationStyles.navLinkActive
                : navigationStyles.navLink
            }
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </a>
          <a
            href="/notes"
            className={
              activeRoute === '/notes'
                ? navigationStyles.navLinkActive
                : navigationStyles.navLink
            }
          >
            <FileText className="h-5 w-5" />
            <span>Notes</span>
          </a>
          <a
            href="/calendar"
            className={
              activeRoute === '/calendar'
                ? navigationStyles.navLinkActive
                : navigationStyles.navLink
            }
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-[280px] mt-16 p-6">{children}</main>
    </div>
  );
}
```

## Example 7: Modal with Presets

Using modal presets for consistent dialogs:

```tsx
import { modalStyles, buttonStyles } from '@ainexsuite/ui';
import { X } from 'lucide-react';

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.backdrop} onClick={onClose} />

      <div className={modalStyles.dialog}>
        {/* Header */}
        <div className={modalStyles.dialogHeader}>
          <h2 className="text-xl font-semibold">Confirm Deletion</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className={modalStyles.dialogBody}>
          <p>Are you sure you want to delete "{itemName}"?</p>
          <p className="text-sm text-[rgb(var(--color-ink-600))] mt-2">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className={modalStyles.dialogFooter}>
          <button onClick={onClose} className={buttonStyles.secondary}>
            Cancel
          </button>
          <button onClick={onConfirm} className={buttonStyles.danger}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Example 8: Status Badges

Using badge variants for consistent status indicators:

```tsx
import { badgeVariants, type BadgeVariantProps } from '@ainexsuite/ui';

type Status = 'active' | 'pending' | 'error' | 'completed';

const statusVariantMap: Record<Status, BadgeVariantProps['variant']> = {
  active: 'success',
  pending: 'warning',
  error: 'danger',
  completed: 'primary',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={badgeVariants({ variant: statusVariantMap[status] })}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Usage
<StatusBadge status="active" />   // Green badge
<StatusBadge status="pending" />  // Yellow badge
<StatusBadge status="error" />    // Red badge
```

## Example 9: Responsive Grid Layout

Using layout presets for consistent grids:

```tsx
import { layoutStyles, cardStyles } from '@ainexsuite/ui';

export function NotesGrid({ notes }: { notes: Note[] }) {
  return (
    <div className={layoutStyles.grid}>
      {notes.map((note) => (
        <div key={note.id} className={cardStyles.interactive}>
          <h3 className="font-semibold mb-2">{note.title}</h3>
          <p className="text-sm text-[rgb(var(--color-ink-700))]">
            {note.excerpt}
          </p>
        </div>
      ))}
    </div>
  );
}

// Masonry layout alternative
export function NotesMasonry({ notes }: { notes: Note[] }) {
  return (
    <div className={layoutStyles.masonry}>
      {notes.map((note) => (
        <div key={note.id} className={layoutStyles.masonryItem}>
          <div className={cardStyles.base}>
            <h3 className="font-semibold mb-2">{note.title}</h3>
            <p className="text-sm">{note.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Example 10: Loading States

Using skeleton and spinner variants:

```tsx
import { skeletonVariants, spinnerVariants } from '@ainexsuite/ui';

export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className={skeletonVariants({ variant: 'text' })} style={{ width: '60%' }} />
      <div className={skeletonVariants({ variant: 'text' })} />
      <div className={skeletonVariants({ variant: 'text' })} />
      <div className={skeletonVariants({ variant: 'text' })} style={{ width: '80%' }} />
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className={spinnerVariants({ size, variant: 'primary' })} />
    </div>
  );
}

// Full page loader
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className={spinnerVariants({ size: 'xl', variant: 'primary' })} />
        <p className="mt-4 text-[rgb(var(--color-ink-600))]">Loading...</p>
      </div>
    </div>
  );
}
```

## Example 11: Combining Tokens for Custom Components

Using raw tokens for complete customization:

```tsx
import {
  spacing,
  radius,
  shadows,
  typography,
  zIndex,
} from '@ainexsuite/ui';

export function FloatingActionButton({
  onClick,
  icon: Icon,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: spacing.xl,
        right: spacing.xl,
        width: '56px',
        height: '56px',
        borderRadius: radius.full,
        boxShadow: shadows.floating,
        zIndex: zIndex.sticky,
        fontSize: typography.body.large.size,
        fontWeight: typography.body.large.weight,
      }}
      className="bg-[rgb(var(--color-accent-500))] text-white hover:bg-[rgb(var(--color-accent-600))] transition-all flex items-center justify-center"
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
```

## Example 12: Theme-Aware Component

Building components that work across all app themes:

```tsx
import { cardVariants, badgeVariants } from '@ainexsuite/ui';
import { SUITE_APPS } from '@ainexsuite/ui';

export function AppCard({ appSlug }: { appSlug: keyof typeof SUITE_APPS }) {
  const app = SUITE_APPS[appSlug];

  return (
    <div className={cardVariants({ variant: 'elevated', padding: 'lg', interactive: true })}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold">{app.name}</h3>
        <span
          className={badgeVariants({ variant: 'primary' })}
          style={{ backgroundColor: `${app.color}15`, color: app.color }}
        >
          {appSlug}
        </span>
      </div>
      <p className="text-sm text-[rgb(var(--color-ink-700))]">{app.description}</p>
    </div>
  );
}
```

## Best Practices Summary

1. **Use presets first** - Check `tailwind-presets.ts` for existing patterns
2. **Use variants for type safety** - Use `component-variants.ts` for reusable components
3. **Use tokens for customization** - Use `tokens.ts` values when you need custom styling
4. **Combine approaches** - Mix presets, variants, and custom classes with `cn()`
5. **Stay theme-aware** - Use CSS custom properties for colors (e.g., `rgb(var(--color-accent-500))`)
6. **Keep it consistent** - Follow the examples above for similar patterns

## Migration Checklist

When updating existing components:

- [ ] Replace hard-coded spacing with `spacing` tokens
- [ ] Replace hard-coded border-radius with `radius` tokens
- [ ] Replace hard-coded shadows with `shadows` tokens
- [ ] Use `cardStyles` instead of repeated card class strings
- [ ] Use `buttonStyles` or `buttonVariants` for buttons
- [ ] Use `inputVariants` for form inputs
- [ ] Use `navigationStyles` for headers/sidebars
- [ ] Use `modalStyles` for dialogs
- [ ] Use `badgeVariants` for status indicators
- [ ] Use `layoutStyles` for grids/masonry/lists

## Questions?

See the main README at `/packages/ui/src/config/README.md` for complete documentation.
