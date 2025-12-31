---
name: accessibility-auditor
description: Audit and fix accessibility issues for WCAG 2.1 AA compliance. Use when reviewing UI components, implementing forms, building modals, or before releases.
---

# Accessibility Auditor

## When to Use
- Reviewing new UI components
- Implementing form controls
- Building modals and dialogs
- Creating interactive elements
- Before production releases
- Fixing reported a11y issues

## Quick Audit Checklist

### Keyboard Navigation
- [ ] All interactive elements focusable with Tab
- [ ] Focus order matches visual order
- [ ] Focus visible (outline or ring)
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys work in lists/menus
- [ ] Enter/Space activate buttons

### Screen Readers
- [ ] Images have alt text (or alt="" for decorative)
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Live regions for dynamic content
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Links describe destination

### Visual
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Color contrast ≥ 3:1 for large text
- [ ] Information not conveyed by color alone
- [ ] Focus indicators visible
- [ ] Text resizable to 200%
- [ ] No content clips on zoom

### Forms
- [ ] Labels associated with inputs
- [ ] Error messages linked to fields
- [ ] Required fields indicated
- [ ] Clear error descriptions
- [ ] Form can be submitted with Enter

## Common Fixes

### Missing Button Label
```tsx
// Bad
<button onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// Good
<button onClick={onClose} aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Also good
<button onClick={onClose}>
  <X className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Close dialog</span>
</button>
```

### Focus Management in Modals
```tsx
// Modal should trap focus and restore on close
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocus.current = document.activeElement as HTMLElement;
      // Focus first focusable element
      modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )?.focus();
    } else {
      // Restore focus on close
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Dialog Title</h2>
      {children}
    </div>
  );
}
```

### Form Labels
```tsx
// Bad - no label association
<label>Email</label>
<input type="email" />

// Good - explicit association
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Good - implicit association
<label>
  Email
  <input type="email" />
</label>

// With error message
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && (
  <span id="email-error" role="alert">
    {error}
  </span>
)}
```

### Skip Link
```tsx
// Add at top of page for keyboard users
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
    >
      Skip to main content
    </a>
  );
}

// Target element
<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>
```

### Live Regions for Dynamic Content
```tsx
// Announce changes to screen readers
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// For more urgent announcements
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>

// Using a toast component
function Toast({ message, type }) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {message}
    </div>
  );
}
```

### Icon Buttons
```tsx
// Pattern for icon-only buttons
function IconButton({
  icon: Icon,
  label,
  onClick,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-lg hover:bg-zinc-100"
      {...props}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

// Usage
<IconButton icon={Trash} label="Delete entry" onClick={handleDelete} />
<IconButton icon={Edit} label="Edit entry" onClick={handleEdit} />
```

### Dropdown Menus
```tsx
function Dropdown({ trigger, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0) {
          items[activeIndex].onClick();
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      {isOpen && (
        <ul role="menu">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={item.onClick}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Tailwind Utilities

```css
/* Screen reader only (visually hidden) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show on focus (for skip links) */
.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Testing Tools

### Browser Extensions
- axe DevTools (Chrome/Firefox)
- WAVE Evaluation Tool
- Accessibility Insights

### Automated Testing
```bash
# Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility

# axe-core in tests
npm install @axe-core/react
```

```tsx
// In tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no a11y violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing
1. Tab through entire page
2. Use with screen reader (VoiceOver on Mac)
3. Zoom to 200%
4. Test with keyboard only
5. Test with high contrast mode

## See Also
- [checklist.md](checklist.md) - Full WCAG 2.1 checklist
- [fixes.md](fixes.md) - Common fix patterns
