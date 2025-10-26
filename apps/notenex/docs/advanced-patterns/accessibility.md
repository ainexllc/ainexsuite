# Accessibility Patterns

Comprehensive guide to building accessible (a11y) AiNex applications, ensuring all users can effectively use your app regardless of ability.

## Overview

**What You'll Learn:**
- ARIA attributes and roles
- Keyboard navigation patterns
- Screen reader support
- Focus management
- Color contrast and visual accessibility
- Accessible form controls
- Skip links and landmarks
- Testing accessibility

---

## ARIA Attributes

### Basic ARIA Labels

```typescript
// components/IconButton.tsx
import { Trash2 } from "lucide-react";

export function DeleteButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Delete note"
      className="icon-button"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
```

**Key ARIA Attributes:**
- `aria-label`: Accessible name for elements without text
- `aria-labelledby`: Reference to element(s) that label this element
- `aria-describedby`: Additional descriptive text
- `aria-hidden`: Hide decorative elements from screen readers
- `aria-live`: Announce dynamic content changes
- `aria-expanded`: Toggle state for expandable elements
- `aria-controls`: Link to element this controls

### ARIA Live Regions

```typescript
// components/Toast.tsx
export function Toast({ message, type }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="toast"
    >
      {message}
    </div>
  );
}

// For urgent announcements
export function ErrorAlert({ error }: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="error-alert"
    >
      {error}
    </div>
  );
}
```

### ARIA States

```typescript
// components/Accordion.tsx
export function AccordionItem({ title, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="accordion-trigger"
      >
        {title}
      </button>

      <div
        id={contentId}
        hidden={!isOpen}
        role="region"
        aria-labelledby={contentId}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## Keyboard Navigation

### Focus Management

```typescript
// components/Modal.tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, children }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
    }

    // Restore focus on close
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      className="modal"
    >
      <div className="modal-header">
        <h2 id="modal-title">Modal Title</h2>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="icon-button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="modal-content">{children}</div>
    </div>
  );
}
```

### Focus Trap

```typescript
// hooks/useFocusTrap.ts
import { useEffect, RefObject } from "react";

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") {
        return;
      }

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // Shift + Tab on first element -> focus last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, isActive]);
}
```

### Keyboard Shortcuts

```typescript
// hooks/useKeyboardShortcut.ts
import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const matches =
        e.key.toLowerCase() === key.toLowerCase() &&
        (modifiers?.ctrl === undefined || e.ctrlKey === modifiers.ctrl) &&
        (modifiers?.shift === undefined || e.shiftKey === modifiers.shift) &&
        (modifiers?.alt === undefined || e.altKey === modifiers.alt) &&
        (modifiers?.meta === undefined || e.metaKey === modifiers.meta);

      if (matches) {
        e.preventDefault();
        callback();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, modifiers]);
}
```

**Usage:**
```typescript
// Open note with Ctrl+N
useKeyboardShortcut("n", openNewNote, { ctrl: true });

// Save with Ctrl+S (or Cmd+S on Mac)
useKeyboardShortcut("s", saveNote, { meta: true });
```

---

## Screen Reader Support

### Semantic HTML

```typescript
// Use semantic elements
<nav>
  <ul>
    <li><a href="/notes">Notes</a></li>
    <li><a href="/settings">Settings</a></li>
  </ul>
</nav>

<main>
  <article>
    <header>
      <h1>Note Title</h1>
    </header>
    <section>
      <p>Note content...</p>
    </section>
  </article>
</main>

<aside>
  <h2>Related Notes</h2>
</aside>
```

### Accessible Forms

```typescript
// components/forms/AccessibleForm.tsx
export function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const [error, setError] = useState("");

  return (
    <form aria-labelledby="form-title">
      <h2 id="form-title">Sign In</h2>

      {/* Error announcement */}
      {error && (
        <div role="alert" aria-live="assertive" className="error-message">
          {error}
        </div>
      )}

      {/* Email field */}
      <div>
        <label htmlFor={emailId}>Email</label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "email-error" : undefined}
        />
        {error && (
          <span id="email-error" className="error-text">
            {error}
          </span>
        )}
      </div>

      {/* Password field */}
      <div>
        <label htmlFor={passwordId}>Password</label>
        <input
          id={passwordId}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          aria-required="true"
        />
      </div>

      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Skip Links

```typescript
// components/layout/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to main content
    </a>
  );
}

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SkipLink />
        <Navigation />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
```

---

## Visual Accessibility

### Color Contrast

Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text):

```typescript
// tailwind.config.ts - Accessible color palette
export default {
  theme: {
    extend: {
      colors: {
        // High contrast text colors
        ink: {
          base: "#1a1a1a",      // 15.8:1 on white
          muted: "#666666",     // 5.74:1 on white
          subtle: "#999999",    // 3.54:1 on white (large text only)
        },

        // Accessible primary colors
        primary: {
          500: "#0066cc",       // 4.54:1 on white
          600: "#0052a3",       // 6.12:1 on white
        },

        // Error/success with good contrast
        red: {
          600: "#dc2626",       // 5.9:1 on white
        },
        green: {
          600: "#059669",       // 4.54:1 on white
        },
      },
    },
  },
};
```

### Focus Indicators

```css
/* globals.css */
/* Custom focus ring */
*:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
  border-radius: 0.25rem;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}

/* Never remove focus indicators */
/* ❌ Don't do this: */
/* *:focus { outline: none; } */
```

### Reduced Motion

```typescript
// components/AnimatedCard.tsx
import { clsx } from "clsx";

export function AnimatedCard({ children }: Props) {
  return (
    <div
      className={clsx(
        "card",
        // Disable animation if user prefers reduced motion
        "motion-safe:transition-transform motion-safe:hover:scale-105"
      )}
    >
      {children}
    </div>
  );
}
```

**Tailwind Config:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      // Respect prefers-reduced-motion
      animation: {
        // Only animate if motion is not reduced
        "spin": "spin 1s linear infinite",
      },
    },
  },
};
```

---

## Accessible Components

### Button

```typescript
// components/Button.tsx
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  "aria-label"?: string;
}

export function Button({
  children,
  onClick,
  type = "button",
  disabled,
  loading,
  variant = "primary",
  className,
  ...ariaProps
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 font-semibold transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variant === "primary" &&
          "bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500",
        variant === "secondary" &&
          "border border-outline-subtle bg-white text-ink-base hover:bg-surface-muted",
        (disabled || loading) && "cursor-not-allowed opacity-50",
        className
      )}
      {...ariaProps}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
```

### Toggle Switch

```typescript
// components/Switch.tsx
"use client";

import { clsx } from "clsx";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        checked ? "bg-primary-500" : "bg-surface-muted",
        disabled && "cursor-not-allowed opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white transition",
          checked ? "translate-x-6" : "translate-x-1"
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}
```

### Dropdown Menu

```typescript
// components/DropdownMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function DropdownMenu({ trigger, items }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Focus first menu item
      const firstItem = menuRef.current.querySelector('[role="menuitem"]');
      (firstItem as HTMLElement)?.focus();
    }
  }, [isOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        // Focus next item
        break;
      case "ArrowUp":
        e.preventDefault();
        // Focus previous item
        break;
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="dropdown-trigger"
      >
        {trigger}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          className="dropdown-menu"
        >
          {items.map((item, index) => (
            <button
              key={index}
              role="menuitem"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="dropdown-item"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Screen Reader Only Class

```css
/* globals.css */
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

.sr-only:not(:focus-visible) {
  /* Ensure it's truly hidden */
}
```

**Usage:**
```typescript
// Accessible icon button
<button aria-label="Delete note">
  <Trash2 className="h-4 w-4" />
  <span className="sr-only">Delete note</span>
</button>

// Accessible loading state
<div>
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span className="sr-only">Loading...</span>
</div>
```

---

## Testing Accessibility

### Automated Testing

```bash
# Install axe-core for automated a11y testing
npm install --save-dev @axe-core/react
```

```typescript
// app/layout.tsx (development only)
import { useEffect } from "react";

if (process.env.NODE_ENV === "development") {
  import("@axe-core/react").then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing Checklist

- ✅ Navigate entire site with keyboard only (Tab, Shift+Tab, Enter, Space, Arrow keys)
- ✅ Test with screen reader (NVDA, JAWS, VoiceOver)
- ✅ Check color contrast with tools (WebAIM, Chrome DevTools)
- ✅ Verify focus indicators are visible
- ✅ Test with 200% zoom
- ✅ Use prefers-reduced-motion
- ✅ Disable JavaScript and check core functionality
- ✅ Check images have alt text
- ✅ Verify form labels are properly associated
- ✅ Test error messages are announced

### Browser DevTools

**Chrome DevTools Lighthouse:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Click "Analyze page load"

**Firefox Accessibility Inspector:**
1. Open DevTools (F12)
2. Go to Accessibility tab
3. Review issues and ARIA properties

---

## Accessibility Best Practices

1. **Semantic HTML First**: Use `<button>`, `<nav>`, `<main>`, etc.
2. **Keyboard Navigation**: All interactive elements must be keyboard accessible
3. **Focus Management**: Trap focus in modals, restore on close
4. **ARIA When Needed**: Use semantic HTML first, ARIA as enhancement
5. **Alt Text**: Describe images, use empty alt for decorative images
6. **Color is Not Enough**: Don't rely solely on color to convey information
7. **Contrast**: Ensure text has sufficient contrast (4.5:1 minimum)
8. **Labels**: All form inputs need associated labels
9. **Live Regions**: Announce dynamic content changes
10. **Testing**: Test with keyboard, screen readers, and automated tools

---

## Related Documentation

- [Form Validation →](./form-validation.md)
- [UI Patterns →](../ui-patterns.md)
- [Components →](../components.md)

---

## External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
